'use client';

import { Users, QrCode, Edit } from 'lucide-react';

interface ProfileIdentityCardProps {
  bannerGradient?: string;
}

export default function ProfileIdentityCard({ bannerGradient }: ProfileIdentityCardProps) {
  const defaultGradient = 'from-purple-600 via-pink-500 to-red-500';
  const gradient = bannerGradient || defaultGradient;

  return (
    <div className="mx-6 mb-6 overflow-hidden rounded-2xl bg-white shadow-md">
      {/* Banner Background */}
      <div className={`relative h-32 bg-gradient-to-r ${gradient}`}>
        {/* Decorative pattern overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }} />
        </div>
      </div>

      {/* Profile Content */}
      <div className="relative px-6 pb-6">
        {/* Avatar - overlapping banner */}
        <div className="relative -mt-12 mb-4 flex justify-center">
          <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg">
            <div className="flex h-full items-center justify-center text-4xl">
              👤
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="text-center">
          <h2 className="mb-1 text-2xl font-bold text-gray-900">Bagus</h2>
          <p className="mb-3 text-sm text-gray-500">@bagus</p>

          {/* Stats */}
          <div className="mb-4 flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="font-semibold text-gray-900">11</span>
              <span className="text-gray-500">followers</span>
            </div>
            <div className="h-4 w-px bg-gray-200" />
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-900">2</span>
              <span className="text-gray-500">following</span>
            </div>
          </div>

          {/* Rank Badge */}
          <div className="mb-4">
            <div className="inline-flex rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 px-6 py-2 text-sm font-bold text-white shadow-md">
              Gold Runner
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-all hover:border-gray-300 hover:shadow-sm">
              <QrCode className="h-4 w-4" />
              QR profil
            </button>
            <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-all hover:border-gray-300 hover:shadow-sm">
              <Edit className="h-4 w-4" />
              Edit profil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
