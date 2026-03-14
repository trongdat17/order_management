import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET single order
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const userRole = (session.user as any)?.role;
    const userId = (session.user as any)?.id;

    // Check if user has permission to view this order
    if (userRole !== 'admin' && order.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Convert Decimal to string for JSON serialization
    const serializedOrder = {
      ...order,
      price: order.price.toString(),
      purchasePrice: order.purchasePrice.toString(),
      profit: order.profit.toString()
    };

    return NextResponse.json({ order: serializedOrder });
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// PUT update order (admin only)
export async function PUT(
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
    const {
      orderNumber,
      trackStatus,
      itemCode,
      imageUrl,
      color,
      size,
      qty,
      price,
      purchasePrice,
      orderDate
    } = body;

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id }
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Calculate profit if price or purchasePrice or qty changed
    const newQty = qty !== undefined ? parseInt(qty) : existingOrder.qty;
    const newPrice = price !== undefined ? parseFloat(price) : parseFloat(existingOrder.price.toString());
    const newPurchasePrice = purchasePrice !== undefined ? parseFloat(purchasePrice) : parseFloat(existingOrder.purchasePrice.toString());

    const calculatedProfit = (newPrice * newQty) - (newPurchasePrice * newQty);

    // Update order
    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        ...(orderNumber && { orderNumber }),
        ...(trackStatus && { trackStatus }),
        ...(itemCode && { itemCode }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(color !== undefined && { color }),
        ...(size !== undefined && { size }),
        ...(qty !== undefined && { qty: parseInt(qty) }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(purchasePrice !== undefined && { purchasePrice: parseFloat(purchasePrice) }),
        ...(orderDate && { orderDate: new Date(orderDate) }),
        profit: calculatedProfit
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Convert Decimal to string for JSON serialization
    const serializedOrder = {
      ...order,
      price: order.price.toString(),
      purchasePrice: order.purchasePrice.toString(),
      profit: order.profit.toString()
    };

    return NextResponse.json({ order: serializedOrder });
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// DELETE order (admin only)
export async function DELETE(
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

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id }
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Delete order
    await prisma.order.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}
