import { MapPin, Clock, TrendingUp, Heart, Calendar } from 'lucide-react';
import Image from 'next/image';

interface ActivityCardProps {
  id: number;
  type: string;
  title: string;
  date: string;
  time: string;
  distance: number;
  duration: string;
  pace: string;
  calories: number;
  elevation?: number;
  heartRate?: number;
  hasMap?: boolean;
}

export default function ActivityCard({
  type,
  title,
  date,
  time,
  distance,
  duration,
  pace,
  calories,
  elevation,
  heartRate,
  hasMap = false
}: ActivityCardProps) {
  const getActivityIcon = () => {
    switch (type) {
      case 'Running':
        return '🏃‍♂️';
      case 'Walking':
        return '🚶‍♂️';
      case 'Cycling':
        return '🚴‍♂️';
      default:
        return '🏃‍♂️';
    }
  };

  const getActivityColor = () => {
    switch (type) {
      case 'Running':
        return 'from-blue-500 to-cyan-500';
      case 'Walking':
        return 'from-green-500 to-emerald-500';
      case 'Cycling':
        return 'from-orange-500 to-red-500';
      default:
        return 'from-blue-500 to-cyan-500';
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-md">
      {/* Map Preview */}
      {hasMap && (
        <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200">
          <div className="flex h-full items-center justify-center">
            <MapPin className="h-12 w-12 text-gray-400" />
          </div>
          {/* Activity Type Badge */}
          <div className="absolute left-3 top-3">
            <div className={`flex items-center gap-2 rounded-xl bg-gradient-to-r ${getActivityColor()} px-3 py-1.5 text-xs font-bold text-white shadow-md backdrop-blur-sm`}>
              <span className="text-base">{getActivityIcon()}</span>
              {type}
            </div>
          </div>
        </div>
      )}

      {/* Activity Details */}
      <div className="p-5">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="mb-1 text-lg font-bold text-gray-900">{title}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>{date}</span>
              <span className="text-gray-300">•</span>
              <span>{time}</span>
            </div>
          </div>
          {!hasMap && (
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${getActivityColor()}`}>
              <span className="text-2xl">{getActivityIcon()}</span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="mb-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="mb-1 text-xs font-medium text-gray-500">Distance</p>
            <p className="text-lg font-bold text-gray-900">{distance.toFixed(2)}</p>
            <p className="text-xs text-gray-500">km</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="mb-1 text-xs font-medium text-gray-500">Duration</p>
            <p className="text-lg font-bold text-gray-900">{duration}</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="mb-1 text-xs font-medium text-gray-500">Pace</p>
            <p className="text-lg font-bold text-gray-900">{pace}</p>
            <p className="text-xs text-gray-500">/km</p>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="flex items-center gap-4 border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50">
              <span className="text-base">🔥</span>
            </div>
            <span className="font-semibold">{calories}</span>
            <span className="text-gray-400">kcal</span>
          </div>
          {elevation && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <span className="font-semibold">{elevation}</span>
              <span className="text-gray-400">m</span>
            </div>
          )}
          {heartRate && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
                <Heart className="h-4 w-4 text-red-600" />
              </div>
              <span className="font-semibold">{heartRate}</span>
              <span className="text-gray-400">bpm</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
