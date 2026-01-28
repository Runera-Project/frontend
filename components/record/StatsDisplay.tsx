interface StatsDisplayProps {
  timer: string;
  distance: string;
  pace: string;
  viewMode: 'map' | 'stats';
  recordState: 'idle' | 'recording' | 'paused';
}

export default function StatsDisplay({ timer, distance, pace, viewMode, recordState }: StatsDisplayProps) {
  const isIdle = recordState === 'idle';

  if (viewMode === 'stats' && isIdle) {
    // Large centered display for idle state
    return (
      <div className="flex flex-col items-center justify-center px-6 py-12">
        <div className="mb-12 text-center">
          <div className="mb-2 text-7xl font-bold text-gray-900">00:00</div>
          <div className="text-sm font-medium uppercase tracking-wide text-gray-400">Time Elapsed</div>
        </div>
        <div className="text-center">
          <div className="mb-2 text-6xl font-bold text-gray-900">0.00</div>
          <div className="text-sm font-medium uppercase tracking-wide text-gray-400">Kilometers</div>
        </div>
      </div>
    );
  }

  if (viewMode === 'stats') {
    // Large stats view
    return (
      <div className="flex flex-col items-center justify-center px-6 py-8">
        <div className="mb-8 text-center">
          <div className="mb-2 text-7xl font-bold text-gray-900">{timer}</div>
          <div className="text-sm font-medium uppercase tracking-wide text-gray-400">Time Elapsed</div>
        </div>
        <div className="grid w-full grid-cols-2 gap-6">
          <div className="text-center">
            <div className="mb-2 text-4xl font-bold text-gray-900">{distance}</div>
            <div className="text-xs font-medium uppercase tracking-wide text-gray-400">Kilometers</div>
          </div>
          <div className="text-center">
            <div className="mb-2 text-4xl font-bold text-gray-900">{pace}</div>
            <div className="text-xs font-medium uppercase tracking-wide text-gray-400">Avg Pace</div>
          </div>
        </div>
      </div>
    );
  }

  // Compact stats for map view
  return (
    <div className="px-6 pb-6">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
          <div className="mb-1 text-2xl font-bold text-gray-900">{timer}</div>
          <div className="text-xs font-medium uppercase tracking-wide text-gray-400">Time</div>
        </div>
        <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
          <div className="mb-1 text-2xl font-bold text-gray-900">{distance}</div>
          <div className="text-xs font-medium uppercase tracking-wide text-gray-400">KM</div>
        </div>
        <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
          <div className="mb-1 text-2xl font-bold text-gray-900">{pace}</div>
          <div className="text-xs font-medium uppercase tracking-wide text-gray-400">Pace</div>
        </div>
      </div>
    </div>
  );
}
