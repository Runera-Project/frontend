'use client';

import { Trophy, ChevronRight, Zap } from 'lucide-react';
import { useAchievements } from '@/hooks/useAchievements';
import AchievementCard from '../AchievementCard';
import { useState, useEffect } from 'react';

export default function AchievementsSection() {
  const [hasError, setHasError] = useState(false);

  try {
    const {
      achievements,
      unlockedCount,
      totalCount,
      totalXP,
      getUnlockedAchievements,
      getNextAchievement,
    } = useAchievements();

    const unlockedAchievements = getUnlockedAchievements();
    const nextAchievement = getNextAchievement();

    // Error boundary
    useEffect(() => {
      const handleError = (event: ErrorEvent) => {
        console.error('Achievements section error:', event.error);
        setHasError(true);
      };
      
      window.addEventListener('error', handleError);
      return () => window.removeEventListener('error', handleError);
    }, []);

    if (hasError) {
      return (
        <div className="mx-6 mb-32">
          <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
            <div className="mb-2 text-3xl">⚠️</div>
            <p className="text-sm font-semibold text-red-900">Unable to load achievements</p>
            <p className="text-xs text-red-600 mt-1">Please refresh the page</p>
          </div>
        </div>
      );
    }

    return (
      <div className="mx-6 mb-32">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <h2 className="text-xl font-bold text-gray-900">Achievements</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-yellow-50 px-3 py-1">
              <Zap className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-semibold text-yellow-700">{totalXP} XP</span>
            </div>
            <button className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700">
              See All
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-4 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unlocked</p>
              <p className="text-2xl font-bold text-gray-900">
                {unlockedCount} <span className="text-base font-normal text-gray-500">/ {totalCount}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Completion</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round((unlockedCount / totalCount) * 100)}%
              </p>
            </div>
          </div>
        </div>

        {/* Next Achievement */}
        {nextAchievement && (
          <div className="mb-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Next Achievement
            </p>
            <AchievementCard achievement={nextAchievement} size="medium" />
          </div>
        )}

        {/* Recent Unlocked */}
        {unlockedAchievements.length > 0 && (
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Recently Unlocked
            </p>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {unlockedAchievements.slice(0, 6).map((achievement) => (
                <div key={achievement.id} className="flex-shrink-0" style={{ width: '120px' }}>
                  <AchievementCard achievement={achievement} size="small" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {unlockedAchievements.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
            <Trophy className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="mb-1 text-sm font-semibold text-gray-900">No Achievements Yet</p>
            <p className="text-xs text-gray-500">
              Complete activities to unlock achievements and earn XP!
            </p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Achievements section render error:', error);
    return (
      <div className="mx-6 mb-32">
        <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
          <div className="mb-2 text-3xl">⚠️</div>
          <p className="text-sm font-semibold text-red-900">Unable to load achievements</p>
          <p className="text-xs text-red-600 mt-1">Please refresh the page</p>
        </div>
      </div>
    );
  }
}
