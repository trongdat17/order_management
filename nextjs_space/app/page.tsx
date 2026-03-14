'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Shield, TrendingUp, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession() || {};

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === 'authenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Package className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              OrderHub
            </h1>
          </div>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium shadow-lg transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Streamline Your Order Management
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            A powerful platform to track, manage, and optimize your orders with real-time insights and seamless collaboration.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg rounded-lg font-semibold shadow-xl transition-all"
          >
            Start Managing Orders
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
              <Package className="text-blue-600" size={28} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Order Tracking</h3>
            <p className="text-gray-600">
              Track every order from creation to delivery with real-time status updates and comprehensive details.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
              <TrendingUp className="text-purple-600" size={28} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Analytics & Insights</h3>
            <p className="text-gray-600">
              Gain valuable insights into revenue, profit margins, and order trends to make data-driven decisions.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-6">
              <Shield className="text-green-600" size={28} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Role-Based Access</h3>
            <p className="text-gray-600">
              Secure admin and user roles ensure proper access control and data privacy across your team.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 mt-20 border-t border-gray-200">
        <div className="text-center text-gray-600">
          <p>&copy; 2024 OrderHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
