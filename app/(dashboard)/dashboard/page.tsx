'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Package, DollarSign, TrendingUp, Users } from 'lucide-react';
import { Navbar } from '@/components/navbar';

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalProfit: number;
  totalUsers: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession() || {};
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProfit: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);

  const isAdmin = (session?.user as any)?.role === 'admin';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch orders
        const ordersRes = await fetch('/api/orders');
        if (ordersRes.ok) {
          const { orders } = await ordersRes.json();
          
          const totalOrders = orders?.length ?? 0;
          const totalRevenue = orders?.reduce((sum: number, order: any) => 
            sum + (parseFloat(order.price) * order.qty), 0
          ) ?? 0;
          const totalProfit = orders?.reduce((sum: number, order: any) => 
            sum + parseFloat(order.profit), 0
          ) ?? 0;

          setStats(prev => ({
            ...prev,
            totalOrders,
            totalRevenue,
            totalProfit
          }));
        }

        // Fetch users (admin only)
        if (isAdmin) {
          const usersRes = await fetch('/api/users');
          if (usersRes.ok) {
            const { users } = await usersRes.json();
            setStats(prev => ({ ...prev, totalUsers: users?.length ?? 0 }));
          }
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchStats();
    }
  }, [session, isAdmin]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: Package,
      color: 'bg-blue-500',
      show: true
    },
    {
      title: 'Total Revenue',
      value: `VND ${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-500',
      show: true
    },
    {
      title: 'Total Profit',
      value: `VND ${stats.totalProfit.toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      show: isAdmin
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-orange-500',
      show: isAdmin
    }
  ];

  return (
    <div className="flex-1">
      <Navbar 
        title="Dashboard" 
        description="Welcome back! Here's an overview of your order management system."
      />

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) =>
            stat.show ? (
              <div
                key={stat.title}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <stat.icon className="text-white" size={24} />
                  </div>
                </div>
              </div>
            ) : null
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/orders')}
              className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg shadow-sm transition-colors text-left"
            >
              <Package size={24} className="mb-2" />
              <h3 className="font-semibold text-lg">View All Orders</h3>
              <p className="text-sm text-blue-100 mt-1">
                Browse and manage orders
              </p>
            </button>

            {isAdmin && (
              <>
                <button
                  onClick={() => router.push('/orders/new')}
                  className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg shadow-sm transition-colors text-left"
                >
                  <DollarSign size={24} className="mb-2" />
                  <h3 className="font-semibold text-lg">Create New Order</h3>
                  <p className="text-sm text-green-100 mt-1">
                    Add a new order to the system
                  </p>
                </button>

                <button
                  onClick={() => router.push('/users')}
                  className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg shadow-sm transition-colors text-left"
                >
                  <Users size={24} className="mb-2" />
                  <h3 className="font-semibold text-lg">Manage Users</h3>
                  <p className="text-sm text-purple-100 mt-1">
                    View and edit user accounts
                  </p>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
