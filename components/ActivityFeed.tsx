import PostCard from './PostCard';

const dummyPosts = [
  {
    user: {
      name: 'Stella',
      avatar: 'https://i.pravatar.cc/100?img=1'
    },
    time: '2h ago',
    activity: 'Morning Run',
    distance_km: 6.22,
    avg_pace: '9:10',
    map_preview: true
  },
  {
    user: {
      name: 'You',
      avatar: 'https://i.pravatar.cc/100?img=5'
    },
    time: '5h ago',
    activity: 'Evening Walk',
    distance_km: 3.4,
    avg_pace: '11:45',
    map_preview: false
  }
];

export default function ActivityFeed() {
  const hasPosts = dummyPosts.length > 0;

  return (
    <div className="px-5">
      <h2 className="mb-4 text-lg font-bold text-gray-900">Activity Feed</h2>
      {hasPosts ? (
        <div className="flex flex-col gap-3">
          {dummyPosts.map((post, index) => (
            <PostCard key={index} {...post} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mb-3 text-5xl">🏃‍♂️</div>
          <h3 className="mb-2 text-base font-bold text-gray-900">No Activities Yet</h3>
          <p className="mb-4 text-sm text-gray-500">
            Start your first run to see activities here!
          </p>
          <button className="rounded-full bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:scale-105">
            Start Recording
          </button>
        </div>
      )}
    </div>
  );
}
