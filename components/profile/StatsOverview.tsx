import { MapPin, Activity, Clock } from 'lucide-react';

export default function StatsOverview() {
  const stats = [
    {
      label: 'Total Dist',
      value: '124',
      unit: 'km',
      icon: MapPin,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      label: 'Runs',
      value: '15',
      unit: '',
      icon: Activity,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      label: 'Avg Pace',
      value: '5:30',
      unit: 'min/km',
      icon: Clock,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    }
  ];

  return (
    <div className="mx-6 mb-6 grid grid-cols-3 gap-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="rounded-xl bg-white p-4 text-center shadow-sm transition-all hover:shadow-md"
          >
            <div className="mb-3 flex justify-center">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bgColor}`}>
                <Icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
              {stat.label}
            </p>
            <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            {stat.unit && (
              <p className="text-xs text-gray-500">{stat.unit}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
