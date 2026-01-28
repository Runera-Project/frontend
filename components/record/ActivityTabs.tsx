'use client';

import { useState } from 'react';

export default function ActivityTabs() {
  const [activeTab, setActiveTab] = useState('All');
  const tabs = ['All', 'Running', 'Walking', 'Cycling'];

  return (
    <div className="px-6 pb-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
              activeTab === tab
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
                : 'bg-white text-gray-600 shadow-sm hover:shadow-md'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
