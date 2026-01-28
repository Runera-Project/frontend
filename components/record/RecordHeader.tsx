import { Plus, History } from 'lucide-react';
import Link from 'next/link';

export default function RecordHeader() {
  return (
    <header className="px-6 pt-6 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activities</h1>
          <p className="mt-1 text-sm text-gray-500">Your running history</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/record"
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-md transition-all hover:scale-105 hover:shadow-lg"
          >
            <Plus className="h-6 w-6 text-white" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </header>
  );
}
