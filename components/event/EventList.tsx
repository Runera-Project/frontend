'use client';

import EventCard from './EventCard';
import { useEvents } from '@/hooks/useEvents';
import { useProfile } from '@/hooks/useProfile';
import { useState } from 'react';
import { useAccount, useWriteContract, usePublicClient } from 'wagmi';
import { Trophy } from 'lucide-react';
import { CONTRACTS, ABIS, TIER_COLORS } from '@/lib/contracts';
import { keccak256, toBytes } from 'viem';

function stringToBytes32(str: string): `0x${string}` {
  return keccak256(toBytes(str));
}

export default function EventList() {
  const { events, isLoading, isEventManager, isCheckingRole, refetchEvents } = useEvents();
  const { address } = useAccount();
  const { profile } = useProfile(address);
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const [name, setName] = useState('');
  const [startInHours, setStartInHours] = useState('');
  const [durationHours, setDurationHours] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Get user's tier
  const tierName = profile?.tierName || 'Bronze';
  const tier = profile?.tier || 1;
  const tierGradient = TIER_COLORS[tier as keyof typeof TIER_COLORS] || TIER_COLORS[1];

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

  const handleCreateEvent = async () => {
    if (!isEventManager || isCreating) {
      return;
    }

    if (!name.trim()) {
      alert('Event name is required');
      return;
    }

    const startHours = Number(startInHours || '0');
    const duration = Number(durationHours || '0');

    if (!Number.isFinite(startHours) || !Number.isFinite(duration) || duration <= 0) {
      alert('Start time and duration must be valid numbers, duration > 0');
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    const startTime = BigInt(now + startHours * 3600);
    const endTime = BigInt(now + (startHours + duration) * 3600);

    let max = BigInt(0);
    if (maxParticipants.trim()) {
      const parsed = Number(maxParticipants);
      if (!Number.isFinite(parsed) || parsed < 0) {
        alert('Max participants must be a non-negative number');
        return;
      }
      max = BigInt(parsed);
    }

    const eventId = stringToBytes32(`${name}-${Date.now()}`);

    try {
      setIsCreating(true);

      const hash = await writeContractAsync({
        address: CONTRACTS.EventRegistry,
        abi: ABIS.EventRegistry,
        functionName: 'createEvent',
        args: [eventId, name, startTime, endTime, max],
      });

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      alert('Event created successfully');
      await refetchEvents();
      setName('');
      setStartInHours('');
      setDurationHours('');
      setMaxParticipants('');
    } catch (error: any) {
      const message = error?.shortMessage || error?.message || 'Failed to create event';
      alert(message);
    } finally {
      setIsCreating(false);
    }
  };

  const activeEvents = events.filter(event => event.status === 'active' || event.status === 'upcoming');
  const endedEvents = events.filter(event => event.status === 'ended');

  return (
    <div className="px-5">
      {isEventManager && (
        <div className="mb-5 rounded-xl bg-white p-4 shadow-sm border border-gray-200">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500">Event Manager</p>
              <p className="text-sm font-bold text-gray-900">Create New Event</p>
            </div>
          </div>
          <div className="space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Event name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                value={startInHours}
                onChange={(e) => setStartInHours(e.target.value)}
                placeholder="Starts in (hours)"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                placeholder="Duration (hours)"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <input
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
              placeholder="Max participants (0 = unlimited)"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleCreateEvent}
              disabled={isCreating || isCheckingRole}
              className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </div>
      )}
      <div className={`mb-5 flex items-center justify-between rounded-xl bg-gradient-to-r ${tierGradient} p-4 shadow-sm`}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-medium text-white/80">Your Rank</p>
            <p className="text-base font-bold text-white">{tierName}</p>
          </div>
        </div>
        <button className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm transition-all hover:bg-white/30">
          Upgrade
        </button>
      </div>

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
