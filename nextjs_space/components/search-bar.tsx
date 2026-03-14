'use client';

import { useState, useEffect } from 'react';
import { Search, Calendar, X, Users, Filter } from 'lucide-react';

interface User {
  id: string;
  username: string;
  name?: string | null;
  email?: string | null;
}

interface SearchBarProps {
  onSearch: (filters: {
    orderNumber: string;
    startDate: string;
    endDate: string;
    status: string;
    customerId: string;
  }) => void;
  onReset: () => void;
  isAdmin?: boolean;
  users?: User[];
}

const ORDER_STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Processing', label: 'Processing' },
  { value: 'Shipped', label: 'Shipped' },
  { value: 'Delivered', label: 'Delivered' },
  { value: 'Cancelled', label: 'Cancelled' }
];

export function SearchBar({ onSearch, onReset, isAdmin = false, users = [] }: SearchBarProps) {
  const [orderNumber, setOrderNumber] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');
  const [customerId, setCustomerId] = useState('');

  const handleSearch = () => {
    onSearch({ orderNumber, startDate, endDate, status, customerId });
  };

  const handleReset = () => {
    setOrderNumber('');
    setStartDate('');
    setEndDate('');
    setStatus('');
    setCustomerId('');
    onReset();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Order Number Search */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order Number
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search orders..."
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Customer Filter (Admin Only) */}
        {isAdmin && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">All Customers</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.username}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-end gap-2">
          <button
            onClick={handleSearch}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Search size={18} />
            Search
          </button>
          <button
            onClick={handleReset}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <X size={18} />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
