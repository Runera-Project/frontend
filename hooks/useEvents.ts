'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAccount } from 'wagmi';
import { CONTRACTS, ABIS } from '@/lib/contracts';
import { useState, useEffect } from 'react';

export interface EventData {
  eventId: string;
  name: string;
  startTime: bigint;
  endTime: bigint;
  maxParticipants: bigint;
  currentParticipants: bigint;
  isActive: boolean;
  // Frontend computed fields
  status: 'upcoming' | 'active' | 'ended';
  isFull: boolean;
  daysUntilStart?: number;
  daysUntilEnd?: number;
  participantsPercentage: number;
}

export function useEvents() {
  const { address } = useAccount();
  const [events, setEvents] = useState<EventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get total event count
  const { data: eventCount } = useReadContract({
    address: CONTRACTS.EventRegistry,
    abi: ABIS.EventRegistry,
    functionName: 'getEventCount',
  });

  // Dummy event IDs for MVP (since we don't have a way to iterate events)
  // In production, backend should provide event IDs or contract should have getAllEvents()
  const dummyEventIds = [
    '0x' + '1'.padStart(64, '0'), // Event 1
    '0x' + '2'.padStart(64, '0'), // Event 2
    '0x' + '3'.padStart(64, '0'), // Event 3
  ];

  useEffect(() => {
    // For MVP, use dummy data since contract doesn't have getAllEvents()
    // In production, fetch event IDs from backend or use contract events
    const now = Math.floor(Date.now() / 1000); // Convert to seconds (integer)
    
    const dummyEvents: EventData[] = [
      {
        eventId: dummyEventIds[0],
        name: 'Marathon Challenge',
        startTime: BigInt(now + 86400 * 7), // 7 days from now
        endTime: BigInt(now + 86400 * 14), // 14 days from now
        maxParticipants: BigInt(100),
        currentParticipants: BigInt(45),
        isActive: true,
        status: 'upcoming',
        isFull: false,
        daysUntilStart: 7,
        participantsPercentage: 45,
      },
      {
        eventId: dummyEventIds[1],
        name: '5K Sprint Series',
        startTime: BigInt(now - 86400), // Started yesterday
        endTime: BigInt(now + 86400 * 6), // 6 days left
        maxParticipants: BigInt(50),
        currentParticipants: BigInt(32),
        isActive: true,
        status: 'active',
        isFull: false,
        daysUntilEnd: 6,
        participantsPercentage: 64,
      },
      {
        eventId: dummyEventIds[2],
        name: 'Weekend Warrior',
        startTime: BigInt(now + 86400 * 2), // 2 days from now
        endTime: BigInt(now + 86400 * 4), // 4 days from now
        maxParticipants: BigInt(30),
        currentParticipants: BigInt(30),
        isActive: true,
        status: 'upcoming',
        isFull: true,
        daysUntilStart: 2,
        participantsPercentage: 100,
      },
    ];

    setEvents(dummyEvents);
    setIsLoading(false);
  }, []);

  // Join event function (placeholder for MVP)
  const joinEvent = async (eventId: string) => {
    console.log('Join event:', eventId);
    // TODO: Implement when contract has joinEvent function
    // For MVP, just show success message
    alert('Event join functionality coming soon! Contract integration needed.');
  };

  return {
    events,
    isLoading,
    eventCount: eventCount ? Number(eventCount) : 0,
    joinEvent,
  };
}
