import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// Generate random password
function generateTemporaryPassword(length: number = 12): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// POST - Reset password for a user (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;

    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { newPassword, generateTempPassword } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id }
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let passwordToSet: string;
    let isTemporary = false;

    if (generateTempPassword) {
      // Generate temporary password
      passwordToSet = generateTemporaryPassword();
      isTemporary = true;
    } else if (newPassword) {
      // Use provided password
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters' },
          { status: 400 }
        );
      }
      passwordToSet = newPassword;
    } else {
      return NextResponse.json(
        { error: 'Please provide a new password or generate a temporary one' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(passwordToSet, 12);

    // Update user password
    await prisma.user.update({
      where: { id: params.id },
      data: { password: hashedPassword }
    });

    return NextResponse.json({
      message: 'Password reset successfully',
      ...(isTemporary && { temporaryPassword: passwordToSet })
    });
  } catch (error: any) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
