'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Download, Calculator } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { SearchBar } from '@/components/search-bar';
import { OrderTable } from '@/components/order-table';
import { formatVND, formatDate } from '@/lib/format';
import toast, { Toaster } from 'react-hot-toast';
import * as XLSX from 'xlsx';

interface User {
  id: string;
  username: string;
  name?: string | null;
  email?: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  trackStatus: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  itemCode: string;
  imageUrl?: string | null;
  color?: string | null;
  size?: string | null;
  qty: number;
  price: string;
  purchasePrice: string;
  profit: string;
  orderDate: string;
  createdAt: string;
  user?: {
    id: string;
    username: string;
    name?: string | null;
    email?: string | null;
  };
}

export default function OrdersPage() {
  const router = useRouter();
  const { data: session, status } = useSession() || {};
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = (session?.user as any)?.role === 'admin';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/orders');
      
      if (res.ok) {
        const { orders: fetchedOrders } = await res.json();
        setOrders(fetchedOrders ?? []);
        setFilteredOrders(fetchedOrders ?? []);
      } else {
        toast.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!isAdmin) return;
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const { users: fetchedUsers } = await res.json();
        setUsers(fetchedUsers ?? []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    if (session) {
      fetchOrders();
      if (isAdmin) {
        fetchUsers();
      }
    }
  }, [session, isAdmin]);

  // Calculate total amount of filtered orders
  const totalAmount = useMemo(() => {
    return filteredOrders.reduce((sum, order) => {
      return sum + (parseFloat(order.price) * order.qty);
    }, 0);
  }, [filteredOrders]);

  // Calculate total profit for admin
  const totalProfit = useMemo(() => {
    if (!isAdmin) return 0;
    return filteredOrders.reduce((sum, order) => {
      return sum + parseFloat(order.profit);
    }, 0);
  }, [filteredOrders, isAdmin]);

  const handleSearch = (filters: {
    orderNumber: string;
    startDate: string;
    endDate: string;
    status: string;
    customerId: string;
  }) => {
    let filtered = [...(orders ?? [])];

    // Filter by order number
    if (filters.orderNumber) {
      filtered = filtered.filter((order) =>
        order?.orderNumber?.toLowerCase()?.includes(filters.orderNumber.toLowerCase())
      );
    }

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter((order) => order?.trackStatus === filters.status);
    }

    // Filter by customer (admin only)
    if (filters.customerId && isAdmin) {
      filtered = filtered.filter((order) => order?.user?.id === filters.customerId);
    }

    // Filter by date range (using orderDate)
    if (filters.startDate) {
      const start = new Date(filters.startDate);
      filtered = filtered.filter((order) => new Date(order?.orderDate) >= start);
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setDate(end.getDate() + 1); // Include the end date
      filtered = filtered.filter((order) => new Date(order?.orderDate) < end);
    }

    setFilteredOrders(filtered);
  };

  const handleReset = () => {
    setFilteredOrders(orders ?? []);
  };

  const handleEdit = (order: Order) => {
    router.push(`/orders/edit/${order.id}`);
  };

  const handleDelete = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        toast.success('Order deleted successfully');
        fetchOrders();
      } else {
        const { error } = await res.json();
        toast.error(error || 'Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
    }
  };

  // Excel Export Function
  const handleExportExcel = () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const filename = `orders_${today}.xlsx`;

      // Prepare data for export
      const exportData = filteredOrders.map((order, index) => {
        const baseData: any = {
          '#': index + 1,
          'Date': formatDate(order.orderDate),
          'Order Number': order.orderNumber,
          'Status': order.trackStatus,
          'Item Code': order.itemCode,
          'Color': order.color || '-',
          'Size': order.size || '-',
          'Qty': order.qty,
          'Price (VND)': parseFloat(order.price),
          'Total (VND)': parseFloat(order.price) * order.qty
        };

        if (isAdmin) {
          baseData['Purchase Price (VND)'] = parseFloat(order.purchasePrice);
          baseData['Profit (VND)'] = parseFloat(order.profit);
          baseData['Customer'] = order.user?.name || order.user?.username || 'N/A';
        }

        return baseData;
      });

      // Add summary row
      const summaryRow: any = {
        '#': '',
        'Date': '',
        'Order Number': 'TOTAL',
        'Status': '',
        'Item Code': '',
        'Color': '',
        'Size': '',
        'Qty': filteredOrders.reduce((sum, o) => sum + o.qty, 0),
        'Price (VND)': '',
        'Total (VND)': totalAmount
      };

      if (isAdmin) {
        summaryRow['Purchase Price (VND)'] = '';
        summaryRow['Profit (VND)'] = totalProfit;
        summaryRow['Customer'] = '';
      }

      exportData.push(summaryRow);

      // Create workbook
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

      // Download file
      XLSX.writeFile(workbook, filename);
      toast.success('Excel file exported successfully!');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('Failed to export Excel file');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <Toaster position="top-right" />
      
      <Navbar 
        title="Orders" 
        description="Manage and track all orders in one place."
      />

      <div className="p-8">
        {/* Header with Create and Export Buttons */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <p className="text-gray-600">
              Total: <span className="font-semibold text-gray-900">{filteredOrders?.length ?? 0}</span> orders
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 shadow-sm"
            >
              <Download size={18} />
              Export Excel
            </button>
            {isAdmin && (
              <button
                onClick={() => router.push('/orders/new')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 shadow-sm"
              >
                <Plus size={20} />
                Create New Order
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <SearchBar 
          onSearch={handleSearch} 
          onReset={handleReset}
          isAdmin={isAdmin}
          users={users}
        />

        {/* Total Amount Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6 border border-blue-100">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Calculator size={20} className="text-blue-600" />
              <span className="text-gray-700 font-medium">Total Amount (Filtered Orders):</span>
              <span className="text-xl font-bold text-blue-600">{formatVND(totalAmount)}</span>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-2">
                <span className="text-gray-700 font-medium">Total Profit:</span>
                <span className={`text-xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatVND(totalProfit)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Orders Table */}
        <OrderTable
          orders={filteredOrders ?? []}
          isAdmin={isAdmin}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
