'use client';

import EventCard from './EventCard';
import { Trophy } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useProfile } from '@/hooks/useProfile';

export default function EventList() {
  const { events, isLoading } = useEvents();
  const { profile } = useProfile();

  const userRank = profile?.tier || 'Bronze';

  if (isLoading) {
    return (
      <div className="px-5">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mb-3 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 mx-auto" />
            <p className="text-sm text-gray-500">Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  const activeEvents = events.filter(event => event.status === 'active' || event.status === 'upcoming');
  const endedEvents = events.filter(event => event.status === 'ended');

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

      {/* Active Events */}
      {activeEvents.length > 0 ? (
        <div className="mb-6">
          <h2 className="mb-3 text-base font-bold text-gray-900">
            Active Events ({activeEvents.length})
          </h2>
          <div className="flex flex-col gap-3">
            {activeEvents.map((event) => (
              <EventCard key={event.eventId} event={event} />
            ))}
          </div>
        </div>
      ) : (
        <div className="py-12 text-center">
          <div className="mb-3 text-5xl">📅</div>
          <p className="text-sm font-medium text-gray-500">No active events</p>
          <p className="text-xs text-gray-400 mt-1">Check back soon for new challenges!</p>
        </div>
      )}

      {/* Ended Events */}
      {endedEvents.length > 0 && (
        <div>
          <h2 className="mb-3 text-base font-bold text-gray-500">Past Events</h2>
          <div className="flex flex-col gap-3 opacity-60">
            {endedEvents.map((event) => (
              <EventCard key={event.eventId} event={event} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
