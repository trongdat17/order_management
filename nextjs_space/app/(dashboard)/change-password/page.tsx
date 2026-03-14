'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { KeyRound, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import toast, { Toaster } from 'react-hot-toast';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { data: session, status } = useSession() || {};
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success('Password changed successfully!');
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const { error } = await res.json();
        toast.error(error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <div className="flex-1">
      <Toaster position="top-right" />
      <Navbar title="Change Password" description="Update your account password." />
      <div className="p-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
                <KeyRound className="text-white" size={28} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
              <p className="text-gray-600 mt-2">Enter your current password and choose a new one</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input type={showCurrentPassword ? 'text' : 'password'} name="currentPassword" value={formData.currentPassword} onChange={handleChange} required placeholder="••••••••" className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input type={showNewPassword ? 'text' : 'password'} name="newPassword" value={formData.newPassword} onChange={handleChange} required minLength={6} placeholder="••••••••" className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required minLength={6} placeholder="••••••••" className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg">
                {loading ? (<><Loader2 className="animate-spin" size={20} />Changing Password...</>) : (<><KeyRound size={20} />Change Password</>)}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
