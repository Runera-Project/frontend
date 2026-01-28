'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, MapPin, Clock, TrendingUp, Save, Share2 } from 'lucide-react';
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
    router.push('/');
  };

  const handlePost = () => {
    // TODO: Post activity to feed
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <div className="mx-auto max-w-md pb-28">
        {/* Header */}
        <header className="px-5 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-sm">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Great Job!</h1>
              <p className="text-xs text-gray-500">Review your activity</p>
            </div>
          </div>
        </header>

        {/* Map Preview */}
        <div className="mx-5 mb-5 overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="flex h-full items-center justify-center">
              <MapPin className="h-10 w-10 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Activity Title */}
        <div className="mx-5 mb-5">
          <label className="mb-2 block text-xs font-semibold text-gray-700">Activity Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Enter activity title"
          />
        </div>

        {/* Stats Summary */}
        <div className="mx-5 mb-5 rounded-xl bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-gray-900">Summary</h3>
          
          <div className="mb-4 grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="mb-2 flex justify-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="mb-1 text-[10px] font-medium text-gray-500">Duration</p>
              <p className="text-lg font-bold text-gray-900">{formatTime(time)}</p>
            </div>

            <div className="text-center">
              <div className="mb-2 flex justify-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                  <MapPin className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <p className="mb-1 text-[10px] font-medium text-gray-500">Distance</p>
              <p className="text-lg font-bold text-gray-900">{distance}</p>
              <p className="text-[10px] text-gray-500">km</p>
            </div>

            <div className="text-center">
              <div className="mb-2 flex justify-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <p className="mb-1 text-[10px] font-medium text-gray-500">Avg Pace</p>
              <p className="text-lg font-bold text-gray-900">{pace}</p>
              <p className="text-[10px] text-gray-500">/km</p>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="mb-1 text-[10px] font-medium text-gray-500">Calories</p>
              <p className="text-base font-bold text-gray-900">
                {Math.round(parseFloat(distance) * 65)} <span className="text-xs font-normal text-gray-500">kcal</span>
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="mb-1 text-[10px] font-medium text-gray-500">Elevation</p>
              <p className="text-base font-bold text-gray-900">
                {Math.round(parseFloat(distance) * 15)} <span className="text-xs font-normal text-gray-500">m</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mx-5 flex gap-3">
          <button
            onClick={handleSave}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm transition-all hover:border-gray-300"
          >
            <Save className="h-4 w-4" />
            Save
          </button>
          <button
            onClick={handlePost}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:shadow-md"
          >
            <Share2 className="h-4 w-4" />
            Post
          </button>
        </div>
      </div>
      <BottomNavigation activeTab="Record" />
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
