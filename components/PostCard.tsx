import Image from 'next/image';

interface PostCardProps {
  user: {
    name: string;
    avatar: string;
  };
  time: string;
  activity: string;
  distance_km: number;
  avg_pace: string;
  map_preview?: boolean;
}

export default function PostCard({ user, time, activity, distance_km, avg_pace, map_preview }: PostCardProps) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      {/* Map Preview */}
      {map_preview && (
        <div className="mb-3 h-40 overflow-hidden rounded-lg bg-gray-100">
          <div className="flex h-full items-center justify-center text-gray-400">
            <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
        </div>
      )}

      {/* User Info */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative h-9 w-9 overflow-hidden rounded-full bg-gray-200">
            <Image 
              src={user.avatar} 
              alt={user.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900">{user.name}</p>
              {user.name !== 'You' && (
                <span className="flex items-center gap-1 text-[10px] text-orange-500">
                  <span className="h-1 w-1 rounded-full bg-orange-500"></span>
                  Private
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-400">{time}</p>
          </div>
        </div>
        {user.name !== 'You' && (
          <button className="text-blue-500 hover:text-blue-600">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}
      </div>

      {/* Activity Title */}
      <h3 className="mb-3 text-base font-bold text-gray-900">{activity}</h3>

      {/* Stats */}
      <div className="flex gap-5">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Distance</p>
          <p className="text-lg font-bold text-gray-900">{distance_km.toFixed(2)} <span className="text-sm font-normal text-gray-500">km</span></p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Avg Pace</p>
          <p className="text-lg font-bold text-gray-900">{avg_pace}</p>
        </div>
      </div>
    </div>
  );
}
