import { Sunrise, Moon, Flame, ChevronRight } from 'lucide-react';

export default function AchievementsSection() {
  const achievements = [
    {
      name: 'Early Bird',
      status: 'Unlocked',
      icon: Sunrise,
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    },
    {
      name: 'Night Owl',
      status: 'Unlocked',
      icon: Moon,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      name: '7 Day Streak',
      status: 'Unlocked',
      icon: Flame,
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600'
    }
  ];

  return (
    <div className="mx-6 mb-32">
      {/* Section Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Achievements</h2>
        <button className="flex items-center gap-1 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700">
          See All
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Achievements Horizontal Scroll */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {achievements.map((achievement, index) => {
          const Icon = achievement.icon;
          return (
            <div
              key={index}
              className="flex-shrink-0 rounded-xl bg-white p-4 text-center shadow-sm transition-all hover:shadow-md"
              style={{ width: '120px' }}
            >
              <div className="mb-3 flex justify-center">
                <div className={`flex h-16 w-16 items-center justify-center rounded-full ${achievement.bgColor}`}>
                  <Icon className={`h-8 w-8 ${achievement.iconColor}`} />
                </div>
              </div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-900">
                {achievement.name}
              </p>
              <p className="text-xs font-medium text-green-600">
                {achievement.status}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
