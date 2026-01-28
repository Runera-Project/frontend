import { Flame, TrendingUp } from 'lucide-react';

export default function QuestCard() {
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const completedDays = 5;
  const currentSteps = 5010;
  const goalSteps = 8500;
  const progress = (currentSteps / goalSteps) * 100;

  return (
    <div className="mx-4 mb-6 rounded-2xl bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Quest</h2>
        <button className="text-gray-400 hover:text-gray-600">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      </div>

      {/* Streak Section */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50">
            <Flame className="h-6 w-6 text-orange-500" fill="currentColor" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Streak</p>
            <p className="text-2xl font-bold text-gray-900">05 <span className="text-base font-normal text-gray-500">Days</span></p>
          </div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
          <TrendingUp className="h-6 w-6 text-blue-500" />
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium text-gray-400">Jan</p>
          <p className="text-xs font-medium text-gray-400">2026</p>
        </div>
        <div className="flex justify-between gap-2">
          {weekDays.map((day, index) => (
            <div key={day} className="flex flex-col items-center gap-2">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                index < completedDays 
                  ? 'bg-blue-500 text-white' 
                  : 'border-2 border-gray-200 text-gray-300'
              }`}>
                {index < completedDays && (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <p className="text-xs text-gray-400">{day}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Steps Progress */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Steps</p>
          <p className="text-xs font-semibold text-gray-500">{Math.round(progress)}%</p>
        </div>
        <div className="mb-2 flex items-baseline gap-2">
          <p className="text-2xl font-bold text-gray-900">{currentSteps.toLocaleString()}</p>
          <p className="text-sm text-gray-400">/ {goalSteps.toLocaleString()}</p>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <div 
            className="h-full rounded-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
