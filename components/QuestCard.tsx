'use client';

import { useState, useEffect } from 'react';
import { Flame, TrendingUp, Target } from 'lucide-react';
import { useDailyQuest } from '@/hooks/useDailyQuest';
import { useModal } from '@/hooks/useModal';
import Modal from './Modal';

export default function QuestCard() {
  const {
    dailySteps,
    currentStreak,
    weeklyProgress,
    overallProgress,
  } = useDailyQuest();

  const modal = useModal();

  const DAILY_STEP_TARGET = 8500;
  const stepProgress = Math.min((dailySteps / DAILY_STEP_TARGET) * 100, 100);

  // Get today's distance from localStorage
  const getTodayDistance = () => {
    if (typeof window === 'undefined') return 0;
    
    const activities = JSON.parse(localStorage.getItem('runera_activities') || '[]');
    const today = new Date().toDateString();
    
    const totalDistance = activities
      .filter((activity: any) => {
        const activityDate = new Date(activity.timestamp).toDateString();
        return activityDate === today;
      })
      .reduce((total: number, activity: any) => total + (activity.distance || 0), 0);
    
    return totalDistance;
  };

  // Get today's activity count from localStorage
  const getTodayActivityCount = () => {
    if (typeof window === 'undefined') return 0;
    
    const activities = JSON.parse(localStorage.getItem('runera_activities') || '[]');
    const today = new Date().toDateString();
    
    return activities.filter((activity: any) => {
      const activityDate = new Date(activity.timestamp).toDateString();
      return activityDate === today;
    }).length;
  };

  // Get XP earned today from localStorage
  const getTodayXP = () => {
    if (typeof window === 'undefined') return 0;
    
    const activities = JSON.parse(localStorage.getItem('runera_activities') || '[]');
    const today = new Date().toDateString();
    
    return activities
      .filter((activity: any) => {
        const activityDate = new Date(activity.timestamp).toDateString();
        return activityDate === today;
      })
      .reduce((total: number, activity: any) => total + (activity.xpEarned || 0), 0);
  };

  // Quest data states (reactive)
  const [todayDistance, setTodayDistance] = useState(0);
  const [todayActivityCount, setTodayActivityCount] = useState(0);
  const [todayXP, setTodayXP] = useState(0);

  // Quest visibility states with cooldown
  const [showDistanceQuest, setShowDistanceQuest] = useState(true);
  const [showActivitiesQuest, setShowActivitiesQuest] = useState(true);
  const [showXpQuest, setShowXpQuest] = useState(true);

  // Update quest data on mount and periodically
  useEffect(() => {
    const updateQuestData = () => {
      setTodayDistance(getTodayDistance());
      setTodayActivityCount(getTodayActivityCount());
      setTodayXP(getTodayXP());
    };

    // Initial update
    updateQuestData();

    // Update every 2 seconds to catch new activities
    const interval = setInterval(updateQuestData, 2000);

    return () => clearInterval(interval);
  }, []);

  // Initialize quest visibility from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkQuestCooldown = (questKey: string) => {
      const claimTime = localStorage.getItem(`runera_${questKey}_claim_time`);
      if (!claimTime) return true; // Show if never claimed
      
      const timeSinceClaim = Date.now() - parseInt(claimTime);
      const fiveMinutes = 5 * 60 * 1000;
      
      return timeSinceClaim >= fiveMinutes; // Show if 5 minutes passed
    };

    setShowDistanceQuest(checkQuestCooldown('distance_quest'));
    setShowActivitiesQuest(checkQuestCooldown('activities_quest'));
    setShowXpQuest(checkQuestCooldown('xp_quest'));
  }, []);

  // Timer to check cooldowns every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof window === 'undefined') return;

      const checkAndUpdateQuest = (questKey: string, setter: (show: boolean) => void) => {
        const claimTime = localStorage.getItem(`runera_${questKey}_claim_time`);
        if (!claimTime) {
          setter(true);
          return;
        }
        
        const timeSinceClaim = Date.now() - parseInt(claimTime);
        const fiveMinutes = 5 * 60 * 1000;
        
        if (timeSinceClaim >= fiveMinutes) {
          setter(true);
        }
      };

      checkAndUpdateQuest('distance_quest', setShowDistanceQuest);
      checkAndUpdateQuest('activities_quest', setShowActivitiesQuest);
      checkAndUpdateQuest('xp_quest', setShowXpQuest);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Claim distance quest
  const claimDistanceQuest = () => {
    if (todayDistance < 5) {
      modal.warning(
        'Not Enough Distance',
        `You need 5km to claim this quest.\n\nCurrent: ${todayDistance.toFixed(2)}km\nNeeded: 5.00km\n\nKeep running! 🏃‍♂️`
      );
      return;
    }
    
    // Mark as claimed and hide for 5 minutes
    localStorage.setItem('runera_distance_quest_claim_time', String(Date.now()));
    setShowDistanceQuest(false);
    
    modal.success(
      'Quest Completed! 🎉',
      `+50 XP for running ${todayDistance.toFixed(2)}km!\n\nQuest will reappear in 5 minutes.`
    );
  };

  // Claim activities quest
  const claimActivitiesQuest = () => {
    if (todayActivityCount < 3) {
      modal.warning(
        'Not Enough Activities',
        `You need 3 activities to claim this quest.\n\nCompleted: ${todayActivityCount}/3\n\nKeep going! 💪`
      );
      return;
    }
    
    // Mark as claimed and hide for 5 minutes
    localStorage.setItem('runera_activities_quest_claim_time', String(Date.now()));
    setShowActivitiesQuest(false);
    
    modal.success(
      'Quest Completed! 🎉',
      `+30 XP for completing ${todayActivityCount} activities!\n\nQuest will reappear in 5 minutes.`
    );
  };

  // Claim XP quest
  const claimXpQuest = () => {
    if (todayXP < 100) {
      modal.warning(
        'Not Enough XP',
        `You need 100 XP to claim this quest.\n\nEarned: ${todayXP}/100 XP\n\nKeep running to earn more XP! 🏃‍♂️`
      );
      return;
    }
    
    // Mark as claimed and hide for 5 minutes
    localStorage.setItem('runera_xp_quest_claim_time', String(Date.now()));
    setShowXpQuest(false);
    
    modal.success(
      'Quest Completed! 🎉',
      `+${todayXP} XP bonus!\n\nQuest will reappear in 5 minutes.`
    );
  };

  // Get current week days with completion status
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
  const mondayIndex = today === 0 ? 6 : today - 1; // Convert to Monday-based index

  return (
    <div className="mx-5 mb-5 rounded-2xl bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">Quest</h2>
        <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1">
          <Target className="h-3.5 w-3.5 text-blue-600" />
          <span className="text-[10px] font-semibold text-blue-600">
            {Math.round(overallProgress)}%
          </span>
        </div>
      </div>

      {/* Streak Section */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50">
            <Flame className="h-5 w-5 text-orange-500" fill="currentColor" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Streak</p>
            <p className="text-xl font-bold text-gray-900">
              {String(currentStreak).padStart(2, '0')}{' '}
              <span className="text-sm font-normal text-gray-500">Days</span>
            </p>
          </div>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
          <TrendingUp className="h-5 w-5 text-blue-500" />
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium text-gray-400">
            {new Date().toLocaleString('default', { month: 'short' })}
          </p>
          <p className="text-xs font-medium text-gray-400">
            {new Date().getFullYear()}
          </p>
        </div>
        <div className="flex justify-between gap-1.5">
          {weekDays.map((day, index) => {
            const isCompleted = index < weeklyProgress.daysCompleted;
            const isToday = index === mondayIndex;
            
            // Calculate date for this day
            const today = new Date();
            const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
            const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Days to Monday
            const date = new Date(today);
            date.setDate(today.getDate() + mondayOffset + index);
            const dateNum = date.getDate();
            
            return (
              <div key={day} className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                    isCompleted
                      ? 'bg-blue-500 text-white'
                      : isToday
                      ? 'border-2 border-blue-500 bg-blue-50 text-blue-500'
                      : 'border-2 border-gray-200 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-xs font-semibold">{dateNum}</span>
                  )}
                </div>
                <p className={`text-[10px] ${isCompleted ? 'text-blue-500 font-medium' : 'text-gray-400'}`}>
                  {day}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Steps Progress */}
      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Steps</p>
          <p className="text-xs font-semibold text-gray-500">{Math.round(stepProgress)}%</p>
        </div>
        <div className="mb-2 flex items-baseline gap-2">
          <p className="text-xl font-bold text-gray-900">{dailySteps.toLocaleString()}</p>
          <p className="text-sm text-gray-400">/ {DAILY_STEP_TARGET.toLocaleString()}</p>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-300"
            style={{ width: `${stepProgress}%` }}
          />
        </div>
      </div>

      {/* Daily Quests */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Daily Quests</p>
          <p className="text-[10px] font-medium text-gray-400">
            {[showDistanceQuest, showActivitiesQuest, showXpQuest].filter(Boolean).length} Active
          </p>
        </div>
        
        <div className="space-y-2">
          {/* Quest 1: Run 5km - Claimable */}
          {showDistanceQuest && (
            <div 
              className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                todayDistance >= 5
                  ? 'border-blue-300 bg-gradient-to-r from-blue-50 to-blue-100 hover:border-blue-400 cursor-pointer'
                  : 'border-gray-100 bg-gradient-to-r from-blue-50 to-transparent hover:border-blue-200'
              }`}
              onClick={() => {
                if (todayDistance >= 5) {
                  claimDistanceQuest();
                }
              }}
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">Run 5 Kilometers</p>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.min((todayDistance / 5) * 100, 100)}%` }} />
                  </div>
                  <span className="text-[10px] font-medium text-gray-500">{todayDistance.toFixed(1)}/5.0 km</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                {todayDistance >= 5 ? (
                  <>
                    <span className="text-xs font-bold text-blue-600 animate-pulse">Claim!</span>
                    <span className="text-[10px] text-blue-600">+50 XP</span>
                  </>
                ) : (
                  <>
                    <span className="text-xs font-bold text-yellow-600">+50 XP</span>
                    <span className="text-[10px] text-gray-400">Today</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Quest 2: Complete 3 Activities - Claimable */}
          {showActivitiesQuest && (
            <div 
              className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                todayActivityCount >= 3
                  ? 'border-green-300 bg-gradient-to-r from-green-50 to-green-100 hover:border-green-400 cursor-pointer'
                  : 'border-gray-100 bg-gradient-to-r from-green-50 to-transparent hover:border-green-200'
              }`}
              onClick={() => {
                if (todayActivityCount >= 3) {
                  claimActivitiesQuest();
                }
              }}
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-500 text-white">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">Complete 3 Activities</p>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                    <div className="h-full rounded-full bg-green-500" style={{ width: `${Math.min((todayActivityCount / 3) * 100, 100)}%` }} />
                  </div>
                  <span className="text-[10px] font-medium text-gray-500">{todayActivityCount}/3 done</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                {todayActivityCount >= 3 ? (
                  <>
                    <span className="text-xs font-bold text-green-600 animate-pulse">Claim!</span>
                    <span className="text-[10px] text-green-600">+30 XP</span>
                  </>
                ) : (
                  <>
                    <span className="text-xs font-bold text-yellow-600">+30 XP</span>
                    <span className="text-[10px] text-gray-400">Today</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Quest 3: XP Today - Claimable */}
          {showXpQuest && (
            <div 
              className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                todayXP >= 100
                  ? 'border-yellow-300 bg-gradient-to-r from-yellow-50 to-yellow-100 hover:border-yellow-400 cursor-pointer'
                  : 'border-gray-100 bg-gradient-to-r from-yellow-50 to-transparent hover:border-yellow-200'
              }`}
              onClick={() => {
                if (todayXP >= 100) {
                  claimXpQuest();
                }
              }}
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-yellow-500 text-white">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">XP Earned Today</p>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                    <div className="h-full rounded-full bg-yellow-500" style={{ width: `${Math.min((todayXP / 100) * 100, 100)}%` }} />
                  </div>
                  <span className="text-[10px] font-medium text-gray-500">{todayXP}/100 XP</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                {todayXP >= 100 ? (
                  <>
                    <span className="text-xs font-bold text-yellow-600 animate-pulse">Claim!</span>
                    <span className="text-[10px] text-yellow-600">+{todayXP} XP</span>
                  </>
                ) : (
                  <>
                    <span className="text-xs font-bold text-yellow-600">+{todayXP} XP</span>
                    <span className="text-[10px] text-gray-400">Today</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={modal.closeModal}
        title={modal.config.title}
        message={modal.config.message}
        type={modal.config.type}
        confirmText={modal.config.confirmText}
        cancelText={modal.config.cancelText}
        onConfirm={modal.config.onConfirm}
        showCancel={modal.config.showCancel}
      />
    </div>
  );
}
