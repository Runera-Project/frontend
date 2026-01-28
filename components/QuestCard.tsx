import { Flame, TrendingUp } from 'lucide-react';

export default function QuestCard() {
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const completedDays = 5;
  const currentSteps = 5010;
  const goalSteps = 8500;
  const progress = (currentSteps / goalSteps) * 100;

  return (
    <div className="mx-5 mb-5 rounded-2xl bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">Quest</h2>
      </div>

      {/* Streak Section */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50">
            <Flame className="h-5 w-5 text-orange-500" fill="currentColor" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Streak</p>
            <p className="text-xl font-bold text-gray-900">05 <span className="text-sm font-normal text-gray-500">Days</span></p>
          </div>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
          <TrendingUp className="h-5 w-5 text-blue-500" />
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium text-gray-400">Jan</p>
          <p className="text-xs font-medium text-gray-400">2026</p>
        </div>
        <div className="flex justify-between gap-1.5">
          {weekDays.map((day, index) => (
            <div key={day} className="flex flex-col items-center gap-1.5">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full ${
                index < completedDays 
                  ? 'bg-blue-500 text-white' 
                  : 'border-2 border-gray-200 text-gray-300'
              }`}>
                {index < completedDays && (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <p className="text-[10px] text-gray-400">{day}</p>
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
          <p className="text-xl font-bold text-gray-900">{currentSteps.toLocaleString()}</p>
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
