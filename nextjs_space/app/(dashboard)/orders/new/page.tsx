'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { OrderForm } from '@/components/order-form';
import toast, { Toaster } from 'react-hot-toast';

export default function NewOrderPage() {
  const router = useRouter();
  const { data: session, status } = useSession() || {};
  const isAdmin = (session?.user as any)?.role === 'admin';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && !isAdmin) {
      toast.error('Access denied. Admin only.');
      router.push('/dashboard');
    }
  }, [status, isAdmin, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex-1">
      <Toaster position="top-right" />
      
      <Navbar 
        title="Create New Order" 
        description="Add a new order to the system."
      />

      <div className="p-8">
        <div className="max-w-4xl">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <OrderForm mode="create" />
          </div>
        </div>
      </div>
    </div>
  );
}
