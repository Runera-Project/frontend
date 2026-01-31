'use client';

import { Calendar, MapPin, Users, Award, Clock, Flame, CalendarDays, CheckCircle, Check } from 'lucide-react';
import { EventData } from '@/hooks/useEvents';
import { useJoinEvent } from '@/hooks/useJoinEvent';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ToastProvider';

interface EventCardProps {
  event: EventData;
}

export default function EventCard({ event }: EventCardProps) {
  const { join, isLoading } = useJoinEvent();
  const [joined, setJoined] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    const joinedEvents = JSON.parse(localStorage.getItem('runera_joined_events') || '[]') as string[];
    return joinedEvents.includes(event.eventId);
  });

  const toast = useToast();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const joinedEvents = JSON.parse(localStorage.getItem('runera_joined_events') || '[]') as string[];
    setJoined(joinedEvents.includes(event.eventId));
  }, [event.eventId]);
  
  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusColor = () => {
    if (event.status === 'active') return 'from-green-500 to-emerald-500';
    if (event.status === 'upcoming') return 'from-blue-500 to-purple-500';
    return 'from-gray-400 to-gray-500';
  };

  const getStatusText = () => {
    if (event.status === 'active') return 'LIVE NOW';
    if (event.status === 'upcoming') return `STARTS IN ${event.daysUntilStart} DAYS`;
    return 'ENDED';
  };

  const handleJoin = async () => {
    try {
      await join(event.eventId);
      setJoined(true);
      toast.success('Successfully joined event! 🎉', 3000);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to join event';
      toast.error(`Failed to join event: ${message}`, 3000);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-md transition-shadow hover:shadow-lg">
      {/* Event Header with Status */}
      <div className={`relative h-52 overflow-hidden bg-gradient-to-br ${getStatusColor()}`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
        </div>
        
        {/* Event Visual */}
        <div className="relative flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mb-3 flex justify-center">
              {event.status === 'active' ? (
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Flame className="h-8 w-8 text-white" />
                </div>
              ) : event.status === 'upcoming' ? (
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <CalendarDays className="h-8 w-8 text-white" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
              )}
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{event.name}</h3>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-2 text-sm font-bold text-white shadow-lg">
              <Clock className="h-4 w-4" />
              {getStatusText()}
            </div>
          </div>
        </div>

        {/* Participants Badge - Top Right */}
        <div className="absolute right-3 top-3">
          <div className="flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-bold text-gray-800 shadow-md backdrop-blur-sm">
            <Users className="h-3.5 w-3.5" />
            {Number(event.currentParticipants)}/{Number(event.maxParticipants)}
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div className="p-5">
        <div className="mb-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Starts</p>
              <p className="font-medium">{formatDate(event.startTime)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Ends</p>
              <p className="font-medium">{formatDate(event.endTime)}</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-gray-500">Participants</span>
            <span className="font-bold text-gray-700">{event.participantsPercentage}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div 
              className={`h-full rounded-full bg-gradient-to-r ${getStatusColor()} transition-all`}
              style={{ width: `${event.participantsPercentage}%` }}
            />
          </div>
        </div>

        {/* Action Section */}
        <div className="flex items-center justify-between pt-2">
          {event.isFull ? (
            <>
              <div className="flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2">
                <Users className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-bold text-orange-600">Event Full</span>
              </div>
              <button
                disabled
                className="rounded-full bg-gray-200 px-6 py-2.5 text-sm font-bold text-gray-500 shadow-sm"
              >
                Full
              </button>
            </>
          ) : event.status === 'ended' ? (
            <>
              <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                <Award className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-bold text-gray-600">Completed</span>
              </div>
              <button
                disabled
                className="rounded-full bg-gray-200 px-6 py-2.5 text-sm font-bold text-gray-500 shadow-sm"
              >
                Ended
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 ring-2 ring-white" />
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 ring-2 ring-white" />
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-400 text-xs font-bold text-white ring-2 ring-white">
                    +{Number(event.currentParticipants)}
                  </div>
                </div>
              </div>
              <button 
                onClick={handleJoin}
                disabled={isLoading || joined}
                className={`rounded-full bg-gradient-to-r ${getStatusColor()} px-8 py-3 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? 'Joining...' : joined ? (
                  <><Check className="inline h-4 w-4 mr-1" /> Joined</>
                ) : event.status === 'active' ? 'Join Now' : 'Register'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
