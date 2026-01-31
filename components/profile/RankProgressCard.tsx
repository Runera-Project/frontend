'use client';

import { TIER_REQUIREMENTS, TIER_NAMES, TIER_COLORS, LEVEL_XP_REQUIREMENTS } from '@/lib/contracts';

interface RankProgressCardProps {
  profile?: {
    tier: number;
    tierName: string;
    stats: {
      level: number;
      xp: number;
      totalDistance: number;
    };
  };
}

export default function RankProgressCard({ profile }: RankProgressCardProps) {
  if (!profile) {
    return (
      <div className="mx-6 mb-6 rounded-2xl bg-white p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-24 w-24 bg-gray-200 rounded-2xl mx-auto mb-4" />
          <div className="h-6 bg-gray-200 rounded mb-4 w-32 mx-auto" />
          <div className="h-3 bg-gray-200 rounded mb-2" />
          <div className="h-4 bg-gray-200 rounded w-48 mx-auto" />
        </div>
      </div>
    );
  }

  const currentTier = profile.tier;
  const nextTier = currentTier < 5 ? currentTier + 1 : 5;
  const currentLevel = profile.stats.level;
  const currentXP = profile.stats.xp;
  
  // Get level requirements for current and next tier
  const currentTierLevel = TIER_REQUIREMENTS[currentTier as keyof typeof TIER_REQUIREMENTS];
  const nextTierLevel = TIER_REQUIREMENTS[nextTier as keyof typeof TIER_REQUIREMENTS];
  
  // Calculate XP progress within current level
  const currentLevelXP = LEVEL_XP_REQUIREMENTS[currentLevel as keyof typeof LEVEL_XP_REQUIREMENTS] || 0;
  const nextLevelXP = LEVEL_XP_REQUIREMENTS[(currentLevel + 1) as keyof typeof LEVEL_XP_REQUIREMENTS] || currentLevelXP + 300;
  const xpProgress = ((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  
  const tierGradient = TIER_COLORS[currentTier as keyof typeof TIER_COLORS];
  const isMaxTier = currentTier >= 5;

  return (
    <div className="mx-6 mb-6 rounded-2xl bg-white p-6 shadow-sm">
      {/* Tier Badge */}
      <div className="mb-4 flex justify-center">
        <div className="relative">
          <div className={`flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br ${tierGradient} shadow-lg`}>
            <span className="text-5xl font-black text-white">{currentTier}</span>
          </div>
          {/* Level Badge */}
          <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md border-2 border-gray-100">
            <span className="text-sm font-bold text-gray-900">L{currentLevel}</span>
          </div>
        </div>
      </div>

      {/* Tier Title */}
      <h3 className={`mb-2 text-center text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${tierGradient}`}>
        {profile.tierName} Tier
      </h3>
      
      {/* Level & XP Display */}
      <div className="mb-4 text-center">
        <p className="text-sm text-gray-500">Level {currentLevel}</p>
        <p className="text-xs text-gray-400">{currentXP.toLocaleString()} XP</p>
      </div>

      {/* XP Progress Bar */}
      {!isMaxTier && (
        <>
          <div className="mb-2">
            <div className="h-3 overflow-hidden rounded-full bg-gray-100">
              <div 
                className={`h-full rounded-full bg-gradient-to-r ${tierGradient} transition-all duration-500`}
                style={{ width: `${Math.min(Math.max(xpProgress, 0), 100)}%` }}
              />
            </div>
          </div>

          {/* XP Progress Text */}
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="font-semibold text-gray-900">{currentXP.toLocaleString()} XP</span>
            <span className="text-gray-500">Level {currentLevel + 1} • {nextLevelXP.toLocaleString()} XP</span>
          </div>
          
          {/* Next Tier Info */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="text-center text-xs text-gray-500">
              <p className="mb-1">Next Tier: <span className="font-semibold text-gray-700">{TIER_NAMES[nextTier as keyof typeof TIER_NAMES]}</span></p>
              <p>Reach Level {nextTierLevel} to unlock</p>
            </div>
          </div>
        </>
      )}
      
      {isMaxTier && (
        <div className="text-center pt-2 border-t border-gray-100">
          <p className="text-lg font-bold text-gray-900 mb-1">Level {currentLevel}</p>
          <p className="text-sm text-gray-500 mb-2">{currentXP.toLocaleString()} XP</p>
          <p className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            Max Tier Reached! 🎉
          </p>
        </div>
      )}
      
      {/* Total Distance (for reference) */}
      <div className="mt-4 pt-4 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-400">Total Distance</p>
        <p className="text-sm font-semibold text-gray-700">{profile.stats.totalDistance.toFixed(1)} km</p>
      </div>
    </div>
  );
}
