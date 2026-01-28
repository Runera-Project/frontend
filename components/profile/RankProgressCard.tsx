export default function RankProgressCard() {
  const currentXP = 1200;
  const nextLevelXP = 2500;
  const progress = (currentXP / nextLevelXP) * 100;

  return (
    <div className="mx-6 mb-6 rounded-2xl bg-white p-6 shadow-sm">
      {/* Tier Badge */}
      <div className="mb-4 flex justify-center">
        <div className="relative">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-400 shadow-lg">
            <span className="text-5xl font-black text-white">II</span>
          </div>
        </div>
      </div>

      {/* Tier Title */}
      <h3 className="mb-4 text-center text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600">
        Gold Tier II
      </h3>

      {/* Progress Bar */}
      <div className="mb-2">
        <div className="h-3 overflow-hidden rounded-full bg-gray-100">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* XP Text */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-gray-900">{currentXP.toLocaleString()} XP</span>
        <span className="text-gray-500">Next Tier • {nextLevelXP.toLocaleString()} XP</span>
      </div>
    </div>
  );
}
