'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useProfile } from './useProfile';

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  type: 'steps' | 'distance' | 'duration' | 'streak';
  target: number;
  current: number;
  unit: string;
  reward: {
    type: 'xp' | 'badge' | 'cosmetic';
    amount: number;
    description: string;
  };
  completed: boolean;
  claimed: boolean;
}

export interface WeeklyProgress {
  daysCompleted: number;
  totalDays: number;
  currentWeek: Date[];
}

const DAILY_STEP_TARGET = 8500;
const DAILY_DISTANCE_TARGET = 5; // km
const DAILY_DURATION_TARGET = 30; // minutes
const STREAK_TARGET = 7; // days

export function useDailyQuest() {
  const { address } = useAccount();
  const { profile } = useProfile(address);
  
  const [dailySteps, setDailySteps] = useState(0);
  const [dailyDistance, setDailyDistance] = useState(0);
  const [dailyDuration, setDailyDuration] = useState(0);
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress>({
    daysCompleted: 0,
    totalDays: 7,
    currentWeek: [],
  });

  // Load daily progress from localStorage
  useEffect(() => {
    if (!address) return;

    const today = new Date().toDateString();
    const storageKey = `daily_quest_${address}_${today}`;
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      const data = JSON.parse(stored);
      setDailySteps(data.steps || 0);
      setDailyDistance(data.distance || 0);
      setDailyDuration(data.duration || 0);
    }

    // Load weekly progress
    loadWeeklyProgress();
  }, [address]);

  // Save daily progress to localStorage
  const saveDailyProgress = (steps: number, distance: number, duration: number) => {
    if (!address) return;

    const today = new Date().toDateString();
    const storageKey = `daily_quest_${address}_${today}`;
    
    localStorage.setItem(storageKey, JSON.stringify({
      steps,
      distance,
      duration,
      date: today,
    }));
  };

  // Load weekly progress
  const loadWeeklyProgress = () => {
    if (!address) return;

    const today = new Date();
    const currentWeek: Date[] = [];
    const daysCompleted: boolean[] = [];

    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      currentWeek.push(date);

      // Check if quest was completed on this day
      const dateStr = date.toDateString();
      const storageKey = `daily_quest_${address}_${dateStr}`;
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        const data = JSON.parse(stored);
        const completed = data.steps >= DAILY_STEP_TARGET;
        daysCompleted.push(completed);
      } else {
        daysCompleted.push(false);
      }
    }

    setWeeklyProgress({
      daysCompleted: daysCompleted.filter(Boolean).length,
      totalDays: 7,
      currentWeek,
    });
  };

  // Update daily steps (called from GPS tracking)
  const updateDailySteps = (steps: number) => {
    setDailySteps(steps);
    saveDailyProgress(steps, dailyDistance, dailyDuration);
  };

  // Update daily distance (called after activity)
  const updateDailyDistance = (distance: number) => {
    const newDistance = dailyDistance + distance;
    setDailyDistance(newDistance);
    saveDailyProgress(dailySteps, newDistance, dailyDuration);
  };

  // Update daily duration (called after activity)
  const updateDailyDuration = (duration: number) => {
    const newDuration = dailyDuration + duration;
    setDailyDuration(newDuration);
    saveDailyProgress(dailySteps, dailyDistance, newDuration);
  };

  // Get current streak from localStorage
  const getCurrentStreak = (): number => {
    if (typeof window === 'undefined') return 0;
    
    const lastRunDate = localStorage.getItem('runera_last_run_date');
    const storedStreak = parseInt(localStorage.getItem('runera_streak') || '0');
    
    if (!lastRunDate) return 0;
    
    // Check if streak is still active
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastRun = new Date(lastRunDate);
    const todayStr = today.toDateString();
    const yesterdayStr = yesterday.toDateString();
    const lastRunStr = lastRun.toDateString();
    
    // Streak is active if last run was today or yesterday
    if (lastRunStr === todayStr || lastRunStr === yesterdayStr) {
      return storedStreak;
    }
    
    // Streak broken - reset
    localStorage.setItem('runera_streak', '0');
    return 0;
  };

  const currentStreak = getCurrentStreak();
  const longestStreak = parseInt(localStorage.getItem('runera_longest_streak') || '0');

  // Define daily quests
  const quests: DailyQuest[] = [
    {
      id: 'daily_steps',
      title: 'Daily Steps',
      description: `Walk ${DAILY_STEP_TARGET.toLocaleString()} steps today`,
      type: 'steps',
      target: DAILY_STEP_TARGET,
      current: dailySteps,
      unit: 'steps',
      reward: {
        type: 'xp',
        amount: 50,
        description: '+50 XP',
      },
      completed: dailySteps >= DAILY_STEP_TARGET,
      claimed: false, // TODO: Track claimed status
    },
    {
      id: 'daily_distance',
      title: 'Run Distance',
      description: `Run ${DAILY_DISTANCE_TARGET}km today`,
      type: 'distance',
      target: DAILY_DISTANCE_TARGET,
      current: dailyDistance,
      unit: 'km',
      reward: {
        type: 'xp',
        amount: 100,
        description: '+100 XP',
      },
      completed: dailyDistance >= DAILY_DISTANCE_TARGET,
      claimed: false,
    },
    {
      id: 'daily_duration',
      title: 'Active Time',
      description: `Be active for ${DAILY_DURATION_TARGET} minutes`,
      type: 'duration',
      target: DAILY_DURATION_TARGET,
      current: dailyDuration,
      unit: 'min',
      reward: {
        type: 'xp',
        amount: 75,
        description: '+75 XP',
      },
      completed: dailyDuration >= DAILY_DURATION_TARGET,
      claimed: false,
    },
    {
      id: 'weekly_streak',
      title: 'Weekly Streak',
      description: `Maintain ${STREAK_TARGET} day streak`,
      type: 'streak',
      target: STREAK_TARGET,
      current: Number(currentStreak),
      unit: 'days',
      reward: {
        type: 'badge',
        amount: 1,
        description: 'Streak Master Badge',
      },
      completed: Number(currentStreak) >= STREAK_TARGET,
      claimed: false,
    },
  ];

  // Calculate total progress
  const completedQuests = quests.filter(q => q.completed).length;
  const totalQuests = quests.length;
  const overallProgress = (completedQuests / totalQuests) * 100;

  // Check if all daily quests completed
  const allDailyQuestsCompleted = quests
    .filter(q => q.type !== 'streak')
    .every(q => q.completed);

  return {
    quests,
    dailySteps,
    dailyDistance,
    dailyDuration,
    currentStreak: Number(currentStreak),
    longestStreak: Number(longestStreak),
    weeklyProgress,
    completedQuests,
    totalQuests,
    overallProgress,
    allDailyQuestsCompleted,
    updateDailySteps,
    updateDailyDistance,
    updateDailyDuration,
    refreshWeeklyProgress: loadWeeklyProgress,
  };
}
