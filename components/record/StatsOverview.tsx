import { TrendingUp, Zap, Clock, Target } from 'lucide-react';

export default function StatsOverview() {
  const stats = [
    {
      label: 'This Week',
      value: '24.5',
      unit: 'km',
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      label: 'Avg Pace',
      value: '5:42',
      unit: '/km',
      icon: Zap,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      label: 'Total Time',
      value: '2h 20m',
      unit: '',
      icon: Clock,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      label: 'Goal',
      value: '82',
      unit: '%',
      icon: Target,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <div className="px-6 pb-6">
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </div>
              <p className="mb-1 text-xs font-medium text-gray-500">{stat.label}</p>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                {stat.unit && <p className="text-sm font-medium text-gray-500">{stat.unit}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
