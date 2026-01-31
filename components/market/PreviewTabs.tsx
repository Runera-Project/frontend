'use client';

import { Frame, Palette, Type, Award } from 'lucide-react';

interface PreviewTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { name: 'Frames', icon: Frame },
  { name: 'Backgrounds', icon: Palette },
  { name: 'Titles', icon: Type },
  { name: 'Badges', icon: Award },
];

export default function PreviewTabs({ activeTab, onTabChange }: PreviewTabsProps) {
  return (
    <div className="px-6 pb-6">
      <p className="mb-3 text-center text-xs font-medium text-gray-500">Choose Category</p>
      <div className="grid grid-cols-4 gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.name;
          return (
            <button
              key={tab.name}
              onClick={() => onTabChange(tab.name)}
              className={`flex flex-col items-center justify-center rounded-xl px-2 py-3 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white text-gray-600 shadow-sm hover:shadow-md hover:bg-gray-50'
              }`}
            >
              <Icon className={`h-5 w-5 mb-1 ${isActive ? 'text-white' : 'text-gray-500'}`} />
              <span className="truncate">{tab.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
