import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getFileUrl } from '@/lib/s3';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;

    // Only admins can upload images
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { cloudStoragePath, isPublic } = body;

    if (!cloudStoragePath) {
      return NextResponse.json(
        { error: 'cloudStoragePath is required' },
        { status: 400 }
      );
    }

    // Generate public or signed URL
    const fileUrl = await getFileUrl(cloudStoragePath, isPublic ?? true);

    return NextResponse.json({ fileUrl, cloudStoragePath });
  } catch (error: any) {
    console.error('Error completing upload:', error);
    return NextResponse.json(
      { error: 'Failed to complete upload' },
      { status: 500 }
    );
  }
}
