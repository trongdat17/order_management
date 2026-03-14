'use client';

import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusColors = {
    Pending: 'bg-gray-100 text-gray-800 border-gray-300',
    Processing: 'bg-blue-100 text-blue-800 border-blue-300',
    Shipped: 'bg-orange-100 text-orange-800 border-orange-300',
    Delivered: 'bg-green-100 text-green-800 border-green-300',
    Cancelled: 'bg-red-100 text-red-800 border-red-300'
  };

  return (
    <span
      className={cn(
        'px-3 py-1 rounded-full text-xs font-medium border',
        statusColors[status]
      )}
    >
      {status}
    </span>
  );
}
