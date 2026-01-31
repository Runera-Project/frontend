'use client';

import { MapPin, Clock, TrendingUp, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface RunActivity {
  id: number;
  title: string;
  distance: number;
  duration: number;
  pace: string;
  timestamp: number;
  xpEarned?: number;
  location?: string;
}

export default function RecentRun() {
  const [recentRun, setRecentRun] = useState<RunActivity | null>(null);

  useEffect(() => {
    // Get most recent run from localStorage
    const activities = JSON.parse(localStorage.getItem('runera_activities') || '[]');
    if (activities.length > 0) {
      // Sort by timestamp descending and get the most recent
      const sorted = activities.sort((a: RunActivity, b: RunActivity) => b.timestamp - a.timestamp);
      setRecentRun(sorted[0]);
    }
  }, []);

  if (!recentRun) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="mx-5 mb-5 rounded-2xl bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Latest Run</p>
          <h3 className="text-lg font-bold text-gray-900">{recentRun.title}</h3>
        </div>
        <div className="rounded-full bg-blue-50 px-3 py-1">
          <p className="text-xs font-semibold text-blue-600">{getTimeAgo(recentRun.timestamp)}</p>
        </div>
      </div>

      {/* Location */}
      {recentRun.location && (
        <div className="mb-4 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <p className="text-sm text-gray-600">{recentRun.location}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-gray-50 p-3">
          <div className="mb-1 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-gray-400" />
            <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Time</p>
          </div>
          <p className="text-lg font-bold text-gray-900">{formatTime(recentRun.duration)}</p>
        </div>

        <div className="rounded-xl bg-gray-50 p-3">
          <div className="mb-1 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-gray-400" />
            <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Distance</p>
          </div>
          <p className="text-lg font-bold text-gray-900">{recentRun.distance.toFixed(2)}</p>
          <p className="text-[10px] text-gray-400">km</p>
        </div>

        <div className="rounded-xl bg-gray-50 p-3">
          <div className="mb-1 flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5 text-gray-400" />
            <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Pace</p>
          </div>
          <p className="text-lg font-bold text-gray-900">{recentRun.pace}</p>
          <p className="text-[10px] text-gray-400">/km</p>
        </div>
      </div>

      {/* XP Earned */}
      {recentRun.xpEarned && recentRun.xpEarned > 0 && (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-yellow-50 py-2">
          <Zap className="h-4 w-4 text-yellow-600" fill="currentColor" />
          <p className="text-sm font-bold text-yellow-700">
            +{recentRun.xpEarned} XP Earned
          </p>
        </div>
      )}
    </div>
  );
}
