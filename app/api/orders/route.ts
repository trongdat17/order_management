import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET all orders
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    const userId = (session.user as any)?.id;

    // Parse query parameters for search and filter
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');

    const where: any = {};

    // If user role, only show their orders
    if (userRole !== 'admin') {
      where.userId = userId;
    } else if (customerId) {
      // Admin can filter by customer
      where.userId = customerId;
    }

    // Search by order number
    if (orderNumber) {
      where.orderNumber = {
        contains: orderNumber,
        mode: 'insensitive'
      };
    }

    // Filter by status
    if (status) {
      where.trackStatus = status;
    }

    // Filter by date range (using orderDate)
    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) {
        where.orderDate.gte = new Date(startDate);
      }
      if (endDate) {
        // Add 1 day to include the end date
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        where.orderDate.lt = end;
      }
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        orderDate: 'desc'
      }
    });

    // Convert Decimal to string for JSON serialization
    const serializedOrders = orders.map(order => ({
      ...order,
      price: order.price.toString(),
      purchasePrice: order.purchasePrice.toString(),
      profit: order.profit.toString()
    }));

    return NextResponse.json({ orders: serializedOrders });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST create new order (admin only)
export async function POST(request: NextRequest) {
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
      userId,
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

    // Validate required fields
    if (!userId || !orderNumber || !itemCode || !qty || !price || !purchasePrice) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate profit: (Price × Qty) - (Purchase Price × Qty)
    const profit = (parseFloat(price) * parseInt(qty)) - (parseFloat(purchasePrice) * parseInt(qty));

    // Create order
    const order = await prisma.order.create({
      data: {
        userId,
        orderNumber,
        trackStatus: trackStatus || 'Pending',
        itemCode,
        imageUrl: imageUrl || null,
        color: color || null,
        size: size || null,
        qty: parseInt(qty),
        price: parseFloat(price),
        purchasePrice: parseFloat(purchasePrice),
        profit,
        orderDate: orderDate ? new Date(orderDate) : new Date()
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

    return NextResponse.json({ order: serializedOrder }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
