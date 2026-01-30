'use client';

import { usePrivy } from '@privy-io/react-auth';
import { LogOut } from 'lucide-react';

export default function Header() {
  const { logout, user } = usePrivy();

  const handleLogout = async () => {
    // Clear JWT token from localStorage
    localStorage.removeItem('runera_token');
    console.log('🗑️ JWT token cleared from localStorage');
    
    // Clear any other Runera data
    const keysToRemove = ['runera_activities', 'runera_streak', 'runera_last_run_date'];
    keysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`🗑️ Cleared ${key}`);
      }
    });
    
    // Call Privy logout
    await logout();
    console.log('✅ Logged out successfully');
  };

  return (
    <header className="px-5 pt-5 pb-4 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Home</h1>
        {user?.email && (
          <p className="text-xs text-gray-500 mt-1">{user.email.address}</p>
        )}
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </header>
  );
}
