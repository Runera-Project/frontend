'use client';

import { Users } from 'lucide-react';
import Image from 'next/image';

interface ProfilePreviewProps {
  selectedSkin: {
    name: string;
    type: string;
    gradient: string;
  } | null;
}

export default function ProfilePreview({ selectedSkin }: ProfilePreviewProps) {
  const defaultGradient = 'from-purple-600 via-pink-500 to-red-500';
  const bannerGradient = selectedSkin?.gradient || defaultGradient;

  return (
    <div className="mx-6 mb-6 overflow-hidden rounded-2xl bg-white shadow-md">
      {/* Banner Background */}
      <div className={`relative h-32 bg-gradient-to-r ${bannerGradient}`}>
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
          <h3 className="mb-1 text-xl font-bold text-gray-900">Bagus</h3>
          <p className="mb-3 text-sm text-gray-500">0x8F31cB2E90</p>

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

          {/* Badges */}
          <div className="flex items-center justify-center gap-2">
            <div className="rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 px-4 py-1.5 text-xs font-bold text-white shadow-sm">
              Gold Runner
            </div>
            {selectedSkin && (
              <div className="rounded-full bg-gradient-to-r from-purple-400 to-pink-400 px-4 py-1.5 text-xs font-bold text-white shadow-sm">
                {selectedSkin.name}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
