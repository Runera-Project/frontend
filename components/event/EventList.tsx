import EventCard from './EventCard';
import { Trophy } from 'lucide-react';

const dummyEvents = [
  {
    id: 1,
    title: 'PACE+ athletic skincare',
    tier: 'Elite Tier',
    date: '05 Jan 2025',
    location: 'Sleman, Indonesia',
    required_rank: 'Platinum',
    image: '/event-pace.jpg',
    description: 'Exclusive recovery and performance challenge with skincare rewards'
  },
  {
    id: 2,
    title: 'Summer Marathon',
    tier: '9 KM',
    date: '15 Jan 2025',
    location: 'Yogyakarta, Indonesia',
    required_rank: 'Bronze',
    image: '/event-marathon.jpg',
    description: 'City marathon challenge open for most runners'
  },
  {
    id: 3,
    title: 'Night Run Challenge',
    tier: '5 KM',
    date: '20 Jan 2025',
    location: 'Jakarta, Indonesia',
    required_rank: 'Bronze',
    image: '/event-night.jpg',
    description: 'Evening city run under the stars'
  },
  {
    id: 4,
    title: 'Mountain Trail Run',
    tier: 'Elite Tier',
    date: '28 Jan 2025',
    location: 'Bandung, Indonesia',
    required_rank: 'Gold',
    image: '/event-trail.jpg',
    description: 'Challenging mountain trail for experienced runners'
  }
];

const userRank = 'Silver';
const rankOrder = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Elite'];

function isEventLocked(requiredRank: string, userRank: string): boolean {
  const userRankIndex = rankOrder.indexOf(userRank);
  const requiredRankIndex = rankOrder.indexOf(requiredRank);
  return userRankIndex < requiredRankIndex;
}

export default function EventList() {
  const unlockedEvents = dummyEvents.filter(event => !isEventLocked(event.required_rank, userRank));
  const lockedEvents = dummyEvents.filter(event => isEventLocked(event.required_rank, userRank));

  return (
    <div className="px-5">
      {/* User Rank Badge */}
      <div className="mb-5 flex items-center justify-between rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 p-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-medium text-white/80">Your Rank</p>
            <p className="text-base font-bold text-white">{userRank}</p>
          </div>
        </div>
        <button className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm transition-all hover:bg-white/30">
          Upgrade
        </button>
      </div>

      {/* Available Events */}
      {unlockedEvents.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-base font-bold text-gray-900">Available for You</h2>
          <div className="flex flex-col gap-3">
            {unlockedEvents.map((event) => (
              <EventCard
                key={event.id}
                {...event}
                isLocked={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Locked Events */}
      {lockedEvents.length > 0 && (
        <div>
          <h2 className="mb-3 text-base font-bold text-gray-900">Unlock with Higher Rank</h2>
          <div className="flex flex-col gap-3">
            {lockedEvents.map((event) => (
              <EventCard
                key={event.id}
                {...event}
                isLocked={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
