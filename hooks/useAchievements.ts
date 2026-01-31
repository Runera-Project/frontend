'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useProfile } from './useProfile';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'distance' | 'streak' | 'speed' | 'activities' | 'special';
  tier: 1 | 2 | 3 | 4 | 5; // Bronze, Silver, Gold, Platinum, Diamond
  icon: string;
  requirement: {
    type: string;
    value: number;
    unit: string;
  };
  progress: number;
  total: number;
  unlocked: boolean;
  unlockedAt?: Date;
  reward: {
    xp: number;
    badge: string;
  };
}

// Dummy achievements data (will be replaced with smart contract data)
const ACHIEVEMENTS_DATA: Omit<Achievement, 'progress' | 'unlocked' | 'unlockedAt'>[] = [
  // Distance Achievements
  {
    id: 'first_5k',
    name: 'First 5K',
    description: 'Complete your first 5 kilometer run',
    category: 'distance',
    tier: 1,
    icon: '🏃',
    requirement: { type: 'single_distance', value: 5, unit: 'km' },
    total: 5,
    reward: { xp: 100, badge: 'Bronze Runner' },
  },
  {
    id: 'first_10k',
    name: 'First 10K',
    description: 'Complete your first 10 kilometer run',
    category: 'distance',
    tier: 2,
    icon: '🏃‍♂️',
    requirement: { type: 'single_distance', value: 10, unit: 'km' },
    total: 10,
    reward: { xp: 250, badge: 'Silver Runner' },
  },
  {
    id: 'half_marathon',
    name: 'Half Marathon',
    description: 'Complete a 21.1 kilometer run',
    category: 'distance',
    tier: 3,
    icon: '🏅',
    requirement: { type: 'single_distance', value: 21.1, unit: 'km' },
    total: 21.1,
    reward: { xp: 500, badge: 'Gold Runner' },
  },
  {
    id: 'marathon',
    name: 'Marathon Master',
    description: 'Complete a full 42.2 kilometer marathon',
    category: 'distance',
    tier: 4,
    icon: '🏆',
    requirement: { type: 'single_distance', value: 42.2, unit: 'km' },
    total: 42.2,
    reward: { xp: 1000, badge: 'Platinum Runner' },
  },
  {
    id: 'total_100k',
    name: 'Century Runner',
    description: 'Run a total of 100 kilometers',
    category: 'distance',
    tier: 2,
    icon: '💯',
    requirement: { type: 'total_distance', value: 100, unit: 'km' },
    total: 100,
    reward: { xp: 300, badge: 'Century Badge' },
  },
  {
    id: 'total_500k',
    name: 'Distance Warrior',
    description: 'Run a total of 500 kilometers',
    category: 'distance',
    tier: 4,
    icon: '⚔️',
    requirement: { type: 'total_distance', value: 500, unit: 'km' },
    total: 500,
    reward: { xp: 1500, badge: 'Warrior Badge' },
  },
  
  // Streak Achievements
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day running streak',
    category: 'streak',
    tier: 1,
    icon: '🔥',
    requirement: { type: 'streak', value: 7, unit: 'days' },
    total: 7,
    reward: { xp: 150, badge: 'Week Streak' },
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day running streak',
    category: 'streak',
    tier: 3,
    icon: '🔥🔥',
    requirement: { type: 'streak', value: 30, unit: 'days' },
    total: 30,
    reward: { xp: 600, badge: 'Month Streak' },
  },
  {
    id: 'streak_100',
    name: 'Streak Legend',
    description: 'Maintain a 100-day running streak',
    category: 'streak',
    tier: 5,
    icon: '🔥🔥🔥',
    requirement: { type: 'streak', value: 100, unit: 'days' },
    total: 100,
    reward: { xp: 2000, badge: 'Legend Streak' },
  },
  
  // Activities Achievements
  {
    id: 'activities_10',
    name: 'Getting Started',
    description: 'Complete 10 running activities',
    category: 'activities',
    tier: 1,
    icon: '✅',
    requirement: { type: 'total_activities', value: 10, unit: 'runs' },
    total: 10,
    reward: { xp: 100, badge: 'Starter Badge' },
  },
  {
    id: 'activities_50',
    name: 'Dedicated Runner',
    description: 'Complete 50 running activities',
    category: 'activities',
    tier: 2,
    icon: '✅✅',
    requirement: { type: 'total_activities', value: 50, unit: 'runs' },
    total: 50,
    reward: { xp: 400, badge: 'Dedicated Badge' },
  },
  {
    id: 'activities_100',
    name: 'Century Club',
    description: 'Complete 100 running activities',
    category: 'activities',
    tier: 3,
    icon: '✅✅✅',
    requirement: { type: 'total_activities', value: 100, unit: 'runs' },
    total: 100,
    reward: { xp: 800, badge: 'Century Club' },
  },
  
  // Speed Achievements
  {
    id: 'pace_5min',
    name: 'Speed Demon',
    description: 'Run at 5:00 min/km pace or faster',
    category: 'speed',
    tier: 3,
    icon: '⚡',
    requirement: { type: 'pace', value: 5, unit: 'min/km' },
    total: 5,
    reward: { xp: 500, badge: 'Speed Badge' },
  },
  {
    id: 'pace_4min',
    name: 'Lightning Fast',
    description: 'Run at 4:00 min/km pace or faster',
    category: 'speed',
    tier: 5,
    icon: '⚡⚡',
    requirement: { type: 'pace', value: 4, unit: 'min/km' },
    total: 4,
    reward: { xp: 1500, badge: 'Lightning Badge' },
  },
  
  // Special Achievements
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete a run before 6 AM',
    category: 'special',
    tier: 1,
    icon: '🌅',
    requirement: { type: 'time_of_day', value: 6, unit: 'AM' },
    total: 1,
    reward: { xp: 150, badge: 'Early Bird' },
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete a run after 10 PM',
    category: 'special',
    tier: 1,
    icon: '🌙',
    requirement: { type: 'time_of_day', value: 22, unit: 'PM' },
    total: 1,
    reward: { xp: 150, badge: 'Night Owl' },
  },
];

export function useAchievements() {
  const { address } = useAccount();
  const { profile } = useProfile(address);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedCount, setUnlockedCount] = useState(0);

  // Extract specific values to use as dependencies
  const totalDistance = profile?.stats.totalDistance ?? 0;
  const totalActivities = profile?.stats.totalActivities ?? 0;
  const currentStreak = profile?.stats.currentStreak ?? 0;

  useEffect(() => {
    // Calculate progress for each achievement based on profile stats
    const achievementsWithProgress = ACHIEVEMENTS_DATA.map((achievement) => {
      let progress = 0;
      let unlocked = false;

      switch (achievement.requirement.type) {
        case 'total_distance':
          progress = totalDistance;
          unlocked = progress >= achievement.total;
          break;
        
        case 'total_activities':
          progress = totalActivities;
          unlocked = progress >= achievement.total;
          break;
        
        case 'streak':
          progress = currentStreak;
          unlocked = progress >= achievement.total;
          break;
        
        case 'single_distance':
        case 'pace':
        case 'time_of_day':
          // These require activity history data (not available in profile stats)
          // Will be calculated from database when available
          progress = 0;
          unlocked = false;
          break;
        
        default:
          progress = 0;
          unlocked = false;
      }

      return {
        ...achievement,
        progress,
        unlocked,
        unlockedAt: unlocked ? new Date() : undefined,
      };
    });

    setAchievements(achievementsWithProgress);
    setUnlockedCount(achievementsWithProgress.filter(a => a.unlocked).length);
  }, [totalDistance, totalActivities, currentStreak]); // Use specific values, not entire profile object

  // Get achievements by category
  const getAchievementsByCategory = (category: Achievement['category']) => {
    return achievements.filter(a => a.category === category);
  };

  // Get unlocked achievements
  const getUnlockedAchievements = () => {
    return achievements.filter(a => a.unlocked);
  };

  // Get locked achievements
  const getLockedAchievements = () => {
    return achievements.filter(a => !a.unlocked);
  };

  // Get achievements by tier
  const getAchievementsByTier = (tier: Achievement['tier']) => {
    return achievements.filter(a => a.tier === tier);
  };

  // Get next achievement to unlock (closest to completion)
  const getNextAchievement = () => {
    const locked = getLockedAchievements();
    if (locked.length === 0) return null;

    return locked.reduce((closest, current) => {
      const closestProgress = (closest.progress / closest.total) * 100;
      const currentProgress = (current.progress / current.total) * 100;
      return currentProgress > closestProgress ? current : closest;
    });
  };

  // Calculate total XP earned from achievements
  const totalXP = achievements
    .filter(a => a.unlocked)
    .reduce((sum, a) => sum + a.reward.xp, 0);

  return {
    achievements,
    unlockedCount,
    totalCount: achievements.length,
    totalXP,
    getAchievementsByCategory,
    getUnlockedAchievements,
    getLockedAchievements,
    getAchievementsByTier,
    getNextAchievement,
  };
}
