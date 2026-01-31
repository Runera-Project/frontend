'use client';

import { Settings, LogOut, User, Bell, Shield, HelpCircle, X } from 'lucide-react';
import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';

export default function ProfileHeader() {
  const [showSettings, setShowSettings] = useState(false);
  const { logout, user } = usePrivy();
  const router = useRouter();

  const handleLogout = async () => {
    // Clear JWT token from localStorage
    localStorage.removeItem('runera_token');
    console.log('🗑️ JWT token cleared from localStorage');
    
    // Clear any other Runera data
    const keysToRemove = ['runera_activities', 'runera_streak', 'runera_last_run_date', 'runera_longest_streak'];
    keysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`🗑️ Cleared ${key}`);
      }
    });
    
    // Call Privy logout
    await logout();
    console.log('✅ Logged out successfully');
    
    // Redirect to home
    router.push('/');
  };

  return (
    <>
      <header className="flex items-center justify-between px-6 pt-6 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <button 
          onClick={() => setShowSettings(true)}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm transition-all hover:shadow-md"
        >
          <Settings className="h-6 w-6 text-gray-600" />
        </button>
      </header>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md animate-slide-up rounded-t-3xl bg-white pb-32 shadow-2xl">
            <div className="p-6">
              {/* Header */}
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-all hover:bg-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* User Info */}
              <div className="mb-6 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {user?.email?.address?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.email?.address || user?.wallet?.address?.slice(0, 10) + '...'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Settings Options */}
              <div className="mb-6 space-y-2">
                <button className="flex w-full items-center gap-3 rounded-xl p-4 text-left transition-all hover:bg-gray-50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Account</p>
                    <p className="text-xs text-gray-500">Manage your account settings</p>
                  </div>
                </button>

                <button className="flex w-full items-center gap-3 rounded-xl p-4 text-left transition-all hover:bg-gray-50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                    <Bell className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Notifications</p>
                    <p className="text-xs text-gray-500">Configure notification preferences</p>
                  </div>
                </button>

                <button className="flex w-full items-center gap-3 rounded-xl p-4 text-left transition-all hover:bg-gray-50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Privacy & Security</p>
                    <p className="text-xs text-gray-500">Control your privacy settings</p>
                  </div>
                </button>

                <button className="flex w-full items-center gap-3 rounded-xl p-4 text-left transition-all hover:bg-gray-50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                    <HelpCircle className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Help & Support</p>
                    <p className="text-xs text-gray-500">Get help and contact support</p>
                  </div>
                </button>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 font-bold text-white shadow-md transition-all hover:shadow-lg hover:scale-[1.02]"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
