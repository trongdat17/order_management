'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ImageUpload } from './image-upload';
import { formatVND, formatDateForInput } from '@/lib/format';
import toast from 'react-hot-toast';

interface User {
  id: string;
  username: string;
  name?: string | null;
  email?: string | null;
}

interface OrderFormData {
  userId: string;
  orderNumber: string;
  trackStatus: string;
  itemCode: string;
  imageUrl: string;
  color: string;
  size: string;
  qty: string;
  price: string;
  purchasePrice: string;
  orderDate: string;
}

interface OrderFormProps {
  orderId?: string;
  initialData?: Partial<OrderFormData & { orderDate?: string }>;
  mode: 'create' | 'edit';
}

export function OrderForm({ orderId, initialData, mode }: OrderFormProps) {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OrderFormData>({
    userId: initialData?.userId || '',
    orderNumber: initialData?.orderNumber || '',
    trackStatus: initialData?.trackStatus || 'Pending',
    itemCode: initialData?.itemCode || '',
    imageUrl: initialData?.imageUrl || '',
    color: initialData?.color || '',
    size: initialData?.size || '',
    qty: initialData?.qty || '1',
    price: initialData?.price || '',
    purchasePrice: initialData?.purchasePrice || '',
    orderDate: initialData?.orderDate ? formatDateForInput(initialData.orderDate) : formatDateForInput(new Date())
  });

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
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

    fetchUsers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (url: string) => {
    setFormData((prev) => ({ ...prev, imageUrl: url }));
  };

  // Calculate profit
  const calculateProfit = () => {
    const qty = parseFloat(formData.qty) || 0;
    const price = parseFloat(formData.price) || 0;
    const purchasePrice = parseFloat(formData.purchasePrice) || 0;
    return (price * qty - purchasePrice * qty).toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = mode === 'create' ? '/api/orders' : `/api/orders/${orderId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success(`Order ${mode === 'create' ? 'created' : 'updated'} successfully`);
        router.push('/orders');
      } else {
        const { error } = await res.json();
        toast.error(error || `Failed to ${mode} order`);
      }
    } catch (error) {
      console.error(`Error ${mode}ing order:`, error);
      toast.error(`Failed to ${mode} order`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Select User */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer <span className="text-red-500">*</span>
          </label>
          <select
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            required
            disabled={mode === 'edit'}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          >
            <option value="">Select a customer</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.username}
              </option>
            ))}
          </select>
        </div>

        {/* Order Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="orderNumber"
            value={formData.orderNumber}
            onChange={handleChange}
            required
            placeholder="e.g., ORD-2024-001"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Track Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Track Status <span className="text-red-500">*</span>
          </label>
          <select
            name="trackStatus"
            value={formData.trackStatus}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Item Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Item Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="itemCode"
            value={formData.itemCode}
            onChange={handleChange}
            required
            placeholder="e.g., SKU-12345"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color
          </label>
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleChange}
            placeholder="e.g., Red"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Size
          </label>
          <input
            type="text"
            name="size"
            value={formData.size}
            onChange={handleChange}
            placeholder="e.g., Large"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="qty"
            value={formData.qty}
            onChange={handleChange}
            required
            min="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price (per unit) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            step="0.01"
            min="0"
            placeholder="0.00"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Purchase Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Purchase Price (per unit) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="purchasePrice"
            value={formData.purchasePrice}
            onChange={handleChange}
            required
            step="0.01"
            min="0"
            placeholder="0.00"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Order Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="orderDate"
            value={formData.orderDate}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Calculated Profit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profit (auto-calculated)
          </label>
          <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
            <span className={`font-semibold ${
              parseFloat(calculateProfit()) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatVND(parseFloat(calculateProfit()))}
            </span>
          </div>
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Image
        </label>
        <ImageUpload
          value={formData.imageUrl}
          onChange={handleImageChange}
          disabled={loading}
        />
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create Order' : 'Update Order'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/orders')}
          disabled={loading}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
