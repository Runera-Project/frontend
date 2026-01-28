import ActivityCard from './ActivityCard';

const dummyActivities = [
  {
    id: 1,
    type: 'Running',
    title: 'Morning Run',
    date: 'Today',
    time: '06:30 AM',
    distance: 8.5,
    duration: '48:30',
    pace: '5:42',
    calories: 520,
    elevation: 120,
    heartRate: 145,
    hasMap: true
  },
  {
    id: 2,
    type: 'Walking',
    title: 'Evening Walk',
    date: 'Yesterday',
    time: '06:00 PM',
    distance: 3.2,
    duration: '35:20',
    pace: '11:02',
    calories: 180,
    heartRate: 95,
    hasMap: false
  },
  {
    id: 3,
    type: 'Running',
    title: 'Interval Training',
    date: '2 days ago',
    time: '05:45 AM',
    distance: 6.0,
    duration: '32:15',
    pace: '5:22',
    calories: 450,
    elevation: 85,
    heartRate: 165,
    hasMap: true
  },
  {
    id: 4,
    type: 'Cycling',
    title: 'Weekend Ride',
    date: '3 days ago',
    time: '07:00 AM',
    distance: 25.5,
    duration: '1:15:30',
    pace: '2:58',
    calories: 680,
    elevation: 320,
    heartRate: 135,
    hasMap: true
  },
  {
    id: 5,
    type: 'Running',
    title: 'Recovery Run',
    date: '4 days ago',
    time: '06:15 AM',
    distance: 5.0,
    duration: '30:00',
    pace: '6:00',
    calories: 320,
    elevation: 45,
    heartRate: 125,
    hasMap: false
  }
];

export default function ActivityList() {
  return (
    <div className="px-6 pb-32">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Recent Activities</h2>
        <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
          View All
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {dummyActivities.map((activity) => (
          <ActivityCard key={activity.id} {...activity} />
        ))}
      </div>
    </div>
  );
}
