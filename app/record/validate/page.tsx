'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, MapPin, Clock, TrendingUp, Save, X } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';
import { Suspense, useState } from 'react';

function ValidateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [title, setTitle] = useState('Morning Run');
  
  const time = searchParams.get('time') || '0';
  const distance = searchParams.get('distance') || '0.00';
  const pace = searchParams.get('pace') || '0:00';

  const formatTime = (seconds: string) => {
    const secs = parseInt(seconds);
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handleSave = () => {
    // TODO: Save activity to database
    router.push('/activities');
  };

  const handleDiscard = () => {
    router.push('/record');
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] pb-safe">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <header className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-md">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Activity Complete!</h1>
              <p className="text-sm text-gray-500">Review and save your activity</p>
            </div>
          </div>
        </header>

        {/* Map Preview */}
        <div className="mx-6 mb-6 overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="flex h-full items-center justify-center">
              <MapPin className="h-12 w-12 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Activity Title */}
        <div className="mx-6 mb-6">
          <label className="mb-2 block text-sm font-semibold text-gray-700">Activity Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Enter activity title"
          />
        </div>

        {/* Stats Summary */}
        <div className="mx-6 mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-gray-900">Activity Summary</h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="mb-2 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="mb-1 text-xs font-medium text-gray-500">Duration</p>
              <p className="text-xl font-bold text-gray-900">{formatTime(time)}</p>
            </div>

            <div className="text-center">
              <div className="mb-2 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="mb-1 text-xs font-medium text-gray-500">Distance</p>
              <p className="text-xl font-bold text-gray-900">{distance}</p>
              <p className="text-xs text-gray-500">km</p>
            </div>

            <div className="text-center">
              <div className="mb-2 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <p className="mb-1 text-xs font-medium text-gray-500">Avg Pace</p>
              <p className="text-xl font-bold text-gray-900">{pace}</p>
              <p className="text-xs text-gray-500">/km</p>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="mb-1 text-xs font-medium text-gray-500">Calories</p>
              <p className="text-lg font-bold text-gray-900">
                {Math.round(parseFloat(distance) * 65)} <span className="text-sm font-normal text-gray-500">kcal</span>
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="mb-1 text-xs font-medium text-gray-500">Elevation</p>
              <p className="text-lg font-bold text-gray-900">
                {Math.round(parseFloat(distance) * 15)} <span className="text-sm font-normal text-gray-500">m</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mx-6 mb-32 flex gap-3">
          <button
            onClick={handleDiscard}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-gray-200 bg-white px-6 py-4 font-bold text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
          >
            <X className="h-5 w-5" />
            Discard
          </button>
          <button
            onClick={handleSave}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 font-bold text-white shadow-md transition-all hover:shadow-lg hover:scale-105"
          >
            <Save className="h-5 w-5" />
            Save Activity
          </button>
        </div>

        <BottomNavigation activeTab="Record" />
      </div>
    </div>
  );
}

export default function ValidatePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fa]">
        <div className="text-gray-400">Loading...</div>
      </div>
    }>
      <ValidateContent />
    </Suspense>
  );
}
