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
  return (
    <div className="px-4 pb-32">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">Activity Feed</h2>
      <div className="flex flex-col gap-4">
        {dummyPosts.map((post, index) => (
          <PostCard key={index} {...post} />
        ))}
      </div>
    </div>
  );
}
