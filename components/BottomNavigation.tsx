'use client';

import { Home, Calendar, Activity, ShoppingBag, User } from 'lucide-react';
import Link from 'next/link';

interface BottomNavigationProps {
  activeTab?: string;
}

const navItems = [
  { name: 'Home', icon: Home, href: '/' },
  { name: 'Event', icon: Calendar, href: '/event' },
  { name: 'Record', icon: Activity, href: '/record' },
  { name: 'Market', icon: ShoppingBag, href: '/market' },
  { name: 'Profil', icon: User, href: '/profile' }
];

export default function BottomNavigation({ activeTab = 'Home' }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-full border border-gray-200/50 bg-white/70 px-6 py-3 shadow-lg backdrop-blur-md">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.name === activeTab;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                isActive ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={2} />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
