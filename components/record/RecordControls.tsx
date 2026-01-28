import { Play, Pause, Square, History } from 'lucide-react';
import Link from 'next/link';

interface RecordControlsProps {
  recordState: 'idle' | 'recording' | 'paused';
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export default function RecordControls({
  recordState,
  onStart,
  onPause,
  onResume,
  onStop
}: RecordControlsProps) {
  if (recordState === 'idle') {
    return (
      <div className="px-6 pb-32">
        <div className="flex flex-col items-center gap-6">
          <button
            onClick={onStart}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            <Play className="h-10 w-10 text-white" fill="white" />
          </button>
          <Link
            href="/activities"
            className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-md transition-all hover:shadow-lg"
          >
            <History className="h-4 w-4" />
            View Activity History
          </Link>
        </div>
      </div>
    );
  }

  if (recordState === 'recording') {
    return (
      <div className="flex items-center justify-center gap-6 px-6 pb-32">
        <button
          onClick={onStop}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
        >
          <Square className="h-7 w-7 text-white" fill="white" />
        </button>
        <button
          onClick={onPause}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
        >
          <Pause className="h-10 w-10 text-gray-700" fill="currentColor" />
        </button>
      </div>
    );
  }

  // Paused state
  return (
    <div className="flex items-center justify-center gap-6 px-6 pb-32">
      <button
        onClick={onStop}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
      >
        <Square className="h-7 w-7 text-white" fill="white" />
      </button>
      <button
        onClick={onResume}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
      >
        <Play className="h-10 w-10 text-white" fill="white" />
      </button>
    </div>
  );
}
