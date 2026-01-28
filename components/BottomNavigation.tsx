'use client';

import { Home, Calendar, Activity, ShoppingBag, User } from 'lucide-react';

const navItems = [
  { name: 'Home', icon: Home, active: true },
  { name: 'Event', icon: Calendar, active: false },
  { name: 'Record', icon: Activity, active: false },
  { name: 'Market', icon: ShoppingBag, active: false },
  { name: 'Profil', icon: User, active: false }
];

export default function BottomNavigation() {
  return (
    <nav className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-full border border-gray-200/50 bg-white/70 px-6 py-3 shadow-lg backdrop-blur-md">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                item.active ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={2} />
              <span className="text-xs font-medium">{item.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
