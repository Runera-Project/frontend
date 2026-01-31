'use client';

import { MapPin, Activity, Clock } from 'lucide-react';

interface StatsOverviewProps {
  profile?: {
    stats: {
      totalDistance: number;
      totalActivities: number;
      totalDuration: number;
    };
  };
}

export default function StatsOverview({ profile }: StatsOverviewProps) {
  if (!profile) {
    return (
      <div className="mx-6 mb-6 grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl bg-white p-4 shadow-sm animate-pulse">
            <div className="h-12 w-12 bg-gray-200 rounded-xl mx-auto mb-3" />
            <div className="h-3 bg-gray-200 rounded mb-2" />
            <div className="h-6 bg-gray-200 rounded mb-1" />
            <div className="h-3 bg-gray-200 rounded w-12 mx-auto" />
          </div>
        ))}
      </div>
    );
  }

  // Calculate average pace (min/km)
  const avgPace = profile.stats.totalActivities > 0 && profile.stats.totalDistance > 0
    ? (profile.stats.totalDuration / 60) / profile.stats.totalDistance
    : 0;
  
  // Format pace as MM:SS
  const paceMinutes = Math.floor(avgPace);
  const paceSeconds = Math.floor((avgPace - paceMinutes) * 60);
  const formattedPace = avgPace > 0 ? `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')}` : '--';

  const stats = [
    {
      label: 'Total Dist',
      value: profile.stats.totalDistance.toFixed(1),
      unit: 'km',
      icon: MapPin,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      label: 'Runs',
      value: profile.stats.totalActivities.toString(),
      unit: '',
      icon: Activity,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      label: 'Avg Pace',
      value: formattedPace,
      unit: 'min/km',
      icon: Clock,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    }
  ];

  return (
    <div className="mx-6 mb-6 grid grid-cols-3 gap-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="rounded-xl bg-white p-4 text-center shadow-sm transition-all hover:shadow-md"
          >
            <div className="mb-3 flex justify-center">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bgColor}`}>
                <Icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
              {stat.label}
            </p>
            <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            {stat.unit && (
              <p className="text-xs text-gray-500">{stat.unit}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
