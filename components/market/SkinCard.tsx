'use client';

import { Lock, Check } from 'lucide-react';

interface SkinCardProps {
  name: string;
  type: string;
  owned: boolean;
  rarity?: string;
  gradient: string;
  isSelected?: boolean;
  onSelect: () => void;
}

export default function SkinCard({
  name,
  owned,
  rarity,
  gradient,
  isSelected,
  onSelect
}: SkinCardProps) {
  const getRarityColor = () => {
    switch (rarity) {
      case 'Legendary':
        return 'from-yellow-400 to-orange-500';
      case 'Epic':
        return 'from-purple-500 to-pink-500';
      case 'Rare':
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <div className={`overflow-hidden rounded-xl bg-white shadow-sm transition-all ${
      isSelected ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-md'
    }`}>
      {/* Skin Preview */}
      <div className={`relative h-32 bg-gradient-to-br ${gradient}`}>
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
            backgroundSize: '20px 20px'
          }} />
        </div>

        {/* Rarity Badge */}
        {rarity && (
          <div className="absolute right-2 top-2">
            <div className={`rounded-lg bg-gradient-to-r ${getRarityColor()} px-2 py-1 text-xs font-bold text-white shadow-md`}>
              {rarity}
            </div>
          </div>
        )}

        {/* Selected Indicator */}
        {isSelected && (
          <div className="absolute left-2 top-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 shadow-md">
              <Check className="h-4 w-4 text-white" strokeWidth={3} />
            </div>
          </div>
        )}

        {/* Lock Overlay for non-owned */}
        {!owned && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
            <div className="rounded-full bg-white/90 p-3 shadow-lg">
              <Lock className="h-5 w-5 text-gray-600" />
            </div>
          </div>
        )}
      </div>

      {/* Skin Info */}
      <div className="p-3">
        <h4 className="mb-2 text-sm font-bold text-gray-900">{name}</h4>
        <button
          onClick={onSelect}
          disabled={!owned}
          className={`w-full rounded-lg py-2 text-sm font-semibold transition-all ${
            owned
              ? isSelected
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {owned ? (isSelected ? 'Using' : 'Use') : 'Locked'}
        </button>
      </div>
    </div>
  );
}
