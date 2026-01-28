import { Sparkles } from 'lucide-react';

export default function EventHeader() {
  return (
    <header className="px-6 pt-6 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Event</h1>
          <p className="mt-1 text-sm text-gray-500">Discover running challenges</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-md">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
      </div>
    </header>
  );
}
