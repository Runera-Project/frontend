'use client';

import { Search, SlidersHorizontal } from 'lucide-react';

export default function SearchBar() {
  return (
    <div className="px-5 pb-5">
      <div className="flex items-center gap-2.5">
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition-all focus-within:border-blue-400">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search event"
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
          />
        </div>
        <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:border-blue-400">
          <SlidersHorizontal className="h-4 w-4 text-gray-600" />
        </button>
      </div>
    </div>
  );
}
