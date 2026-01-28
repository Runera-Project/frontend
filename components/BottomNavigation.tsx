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
  { name: 'User', icon: User, href: '/profile' }
];

export default function BottomNavigation({ activeTab = 'Home' }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-6 px-4">
      <div 
        className="flex items-center justify-around rounded-full border border-black/[0.11] bg-white/[0.81] shadow-[0px_1.2px_4.9px_0.6px_rgba(0,0,0,0.04)] backdrop-blur-[4.4px]"
        style={{ 
          width: '100%',
          maxWidth: '448px',
          padding: '12px 16px'
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.name === activeTab;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1.5 px-3 py-1 transition-all ${
                isActive ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className={`h-6 w-6 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
