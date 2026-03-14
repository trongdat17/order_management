'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Edit2, Trash2, Eye, X } from 'lucide-react';
import { StatusBadge } from './status-badge';
import { formatVND, formatDate } from '@/lib/format';

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

interface OrderTableProps {
  orders: Order[];
  isAdmin: boolean;
  onEdit?: (order: Order) => void;
  onDelete?: (orderId: string) => void;
}

export function OrderTable({ orders, isAdmin, onEdit, onDelete }: OrderTableProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Pagination logic
  const totalPages = Math.ceil((orders?.length ?? 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = orders?.slice(startIndex, endIndex) ?? [];

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-500 text-lg">No orders found</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Order Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Track Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Item Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Color
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Price (VND)
                </th>
                {isAdmin && (
                  <>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Purchase Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Profit
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Customer
                    </th>
                  </>
                )}
                {isAdmin && (
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentOrders.map((order, index) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {formatDate(order.orderDate)}
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">
                    {order.orderNumber}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={order.trackStatus} />
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {order.itemCode}
                  </td>
                  <td className="px-4 py-4">
                    {order.imageUrl ? (
                      <button
                        onClick={() => setSelectedImage(order.imageUrl!)}
                        className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors"
                      >
                        <Image
                          src={order.imageUrl}
                          alt={order.itemCode}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Eye size={16} className="text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {order.color || '-'}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {order.size || '-'}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {order.qty}
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                    {formatVND(parseFloat(order.price))}
                  </td>
                  {isAdmin && (
                    <>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {formatVND(parseFloat(order.purchasePrice))}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <span
                          className={`font-semibold ${
                            parseFloat(order.profit) >= 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {formatVND(parseFloat(order.profit))}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        <div>
                          <p className="font-medium">{order.user?.name || order.user?.username || 'N/A'}</p>
                          <p className="text-xs text-gray-500">@{order.user?.username}</p>
                        </div>
                      </td>
                    </>
                  )}
                  {isAdmin && (
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEdit?.(order)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit order"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this order?')) {
                              onDelete?.(order.id);
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete order"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, orders.length)} of{' '}
              {orders.length} orders
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full">
            <Image
              src={selectedImage}
              alt="Order image"
              fill
              className="object-contain"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white text-gray-900 p-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
