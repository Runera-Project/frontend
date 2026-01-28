'use client';

import { Search, SlidersHorizontal } from 'lucide-react';

export default function SearchBar() {
  return (
    <div className="px-6 pb-6">
      <div className="flex items-center gap-3">
        <div className="flex flex-1 items-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-3.5 shadow-sm transition-all focus-within:border-blue-400 focus-within:shadow-md">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search event"
            className="flex-1 bg-transparent text-base text-gray-900 placeholder:text-gray-400 focus:outline-none"
          />
        </div>
        <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:border-blue-400 hover:shadow-md">
          <SlidersHorizontal className="h-5 w-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
}
