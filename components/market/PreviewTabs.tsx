'use client';

interface PreviewTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function PreviewTabs({ activeTab, onTabChange }: PreviewTabsProps) {
  const tabs = ['Frames', 'Background', 'Title'];

  return (
    <div className="px-6 pb-6">
      <p className="mb-3 text-center text-xs font-medium text-gray-500">Live Preview</p>
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
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
