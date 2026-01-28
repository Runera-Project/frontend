import { Sparkles } from 'lucide-react';

export default function EventHeader() {
  return (
    <header className="px-5 pt-5 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event</h1>
          <p className="mt-0.5 text-xs text-gray-500">Discover running challenges</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-sm">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
      </div>
    </header>
  );
}
