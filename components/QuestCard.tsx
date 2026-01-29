'use client';

import { Flame, TrendingUp, Target } from 'lucide-react';
import { useDailyQuest } from '@/hooks/useDailyQuest';

export default function QuestCard() {
  const {
    dailySteps,
    currentStreak,
    weeklyProgress,
    overallProgress,
  } = useDailyQuest();

  const DAILY_STEP_TARGET = 8500;
  const stepProgress = Math.min((dailySteps / DAILY_STEP_TARGET) * 100, 100);

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
      <div>
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
    </div>
  );
}
