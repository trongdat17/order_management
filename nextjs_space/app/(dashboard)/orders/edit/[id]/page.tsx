'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { OrderForm } from '@/components/order-form';
import toast, { Toaster } from 'react-hot-toast';

interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  trackStatus: string;
  itemCode: string;
  imageUrl?: string | null;
  color?: string | null;
  size?: string | null;
  qty: number;
  price: string;
  purchasePrice: string;
}

export default function EditOrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;
  const { data: session, status } = useSession() || {};
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = (session?.user as any)?.role === 'admin';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && !isAdmin) {
      toast.error('Access denied. Admin only.');
      router.push('/dashboard');
    }
  }, [status, isAdmin, router]);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId || !session) return;

      try {
        setLoading(true);
        const res = await fetch(`/api/orders/${orderId}`);
        
        if (res.ok) {
          const { order: fetchedOrder } = await res.json();
          setOrder(fetchedOrder);
        } else {
          toast.error('Order not found');
          router.push('/orders');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to fetch order');
        router.push('/orders');
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchOrder();
    }
  }, [orderId, session, isAdmin, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin || !order) {
    return null;
  }

  return (
    <div className="flex-1">
      <Toaster position="top-right" />
      
      <Navbar 
        title="Edit Order" 
        description="Update order details."
      />

      <div className="p-8">
        <div className="max-w-4xl">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <OrderForm
              mode="edit"
              orderId={order.id}
              initialData={{
                userId: order.userId,
                orderNumber: order.orderNumber,
                trackStatus: order.trackStatus,
                itemCode: order.itemCode,
                imageUrl: order.imageUrl || '',
                color: order.color || '',
                size: order.size || '',
                qty: order.qty.toString(),
                price: order.price,
                purchasePrice: order.purchasePrice
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
