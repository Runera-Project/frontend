'use client';

import { useReadContract, useReadContracts } from 'wagmi';
import { useAccount } from 'wagmi';
import { CONTRACTS, ABIS } from '@/lib/contracts';
import { useEffect, useMemo, useState } from 'react';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export interface EventData {
  eventId: string;
  name: string;
  startTime: bigint;
  endTime: bigint;
  maxParticipants: bigint;
  currentParticipants: bigint;
  isActive: boolean;
  status: 'upcoming' | 'active' | 'ended';
  isFull: boolean;
  daysUntilStart?: number;
  daysUntilEnd?: number;
  participantsPercentage: number;
}

export function useEvents() {
  const { address } = useAccount();

  const { data: eventCount } = useReadContract({
    address: CONTRACTS.EventRegistry,
    abi: ABIS.EventRegistry,
    functionName: 'getEventCount',
  });

  const { data: isEventManagerData, isLoading: isCheckingRole } = useReadContract({
    address: CONTRACTS.AccessControl,
    abi: ABIS.AccessControl,
    functionName: 'isEventManager',
    args: address && CONTRACTS.AccessControl !== ZERO_ADDRESS ? [address] : undefined,
    query: {
      enabled: !!address && CONTRACTS.AccessControl !== ZERO_ADDRESS,
    },
  });

  const dummyEventIds = [
    '0x' + '1'.padStart(64, '0'),
    '0x' + '2'.padStart(64, '0'),
    '0x' + '3'.padStart(64, '0'),
  ];

  const dummyEvents = useMemo<EventData[]>(() => {
    const now = Math.floor(Date.now() / 1000);

    return [
      {
        eventId: dummyEventIds[0],
        name: 'Marathon Challenge',
        startTime: BigInt(now + 86400 * 7),
        endTime: BigInt(now + 86400 * 14),
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
        startTime: BigInt(now - 86400),
        endTime: BigInt(now + 86400 * 6),
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
        startTime: BigInt(now + 86400 * 2),
        endTime: BigInt(now + 86400 * 4),
        maxParticipants: BigInt(30),
        currentParticipants: BigInt(30),
        isActive: true,
        status: 'upcoming',
        isFull: true,
        daysUntilStart: 2,
        participantsPercentage: 100,
      },
    ];
  });

  const eventCountNumber = eventCount ? Number(eventCount) : 0;
  const indices = useMemo(() => Array.from({ length: eventCountNumber }, (_, i) => i), [eventCountNumber]);

  const [localParticipantBumps, setLocalParticipantBumps] = useState<Record<string, number>>(() => {
    if (typeof window === 'undefined') {
      return {};
    }

    const stored = localStorage.getItem('runera_event_participant_bumps');
    if (!stored) {
      return {};
    }

    try {
      return JSON.parse(stored) as Record<string, number>;
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ eventId?: string }>;
      const eventId = customEvent.detail?.eventId;
      if (!eventId) {
        return;
      }
      setLocalParticipantBumps((prev) => ({
        ...prev,
        [eventId]: (prev[eventId] || 0) + 1,
      }));
    };

    window.addEventListener('runera:joined_event', handler);
    return () => window.removeEventListener('runera:joined_event', handler);
  }, []);

  const { data: eventIdResults, isLoading: isLoadingEventIds, refetch: refetchEventIds } = useReadContracts({
    contracts: indices.map((index) => ({
      address: CONTRACTS.EventRegistry,
      abi: ABIS.EventRegistry,
      functionName: 'getEventIdByIndex',
      args: [BigInt(index)],
    })),
    query: {
      enabled: indices.length > 0,
    },
  });

  const eventIds = useMemo(() => {
    return (eventIdResults ?? [])
      .map((item) => item.result)
      .filter((value): value is `0x${string}` => Boolean(value));
  }, [eventIdResults]);

  type EventConfig = {
    eventId: `0x${string}`;
    name: string;
    startTime: bigint;
    endTime: bigint;
    maxParticipants: bigint;
    currentParticipants: bigint;
    active: boolean;
  };

  const { data: eventConfigs, isLoading: isLoadingEvents, refetch: refetchEvents } = useReadContracts({
    contracts: eventIds.map((eventId) => ({
      address: CONTRACTS.EventRegistry,
      abi: ABIS.EventRegistry,
      functionName: 'getEvent',
      args: [eventId],
    })),
    query: {
      enabled: eventIds.length > 0,
    },
  });

  const onchainEvents = useMemo<EventData[]>(() => {
    const now = Math.floor(Date.now() / 1000);

    return (eventConfigs ?? [])
      .map((item) => item.result as EventConfig | undefined)
      .filter((config): config is EventConfig => Boolean(config))
      .map((config) => {
        const toBigInt = (value: bigint | number | string) =>
          typeof value === 'bigint' ? value : BigInt(value);

        const currentParticipants = toBigInt(config.currentParticipants);
        const maxParticipants = toBigInt(config.maxParticipants);
        const localBump = BigInt(localParticipantBumps[config.eventId] || 0);
        const adjustedCurrentParticipants = currentParticipants + localBump;
        const startTime = Number(config.startTime);
        const endTime = Number(config.endTime);
        const isFull = maxParticipants > 0n && adjustedCurrentParticipants >= maxParticipants;
        const isActive = config.active && now >= startTime && now <= endTime && !isFull;
        const status: EventData['status'] =
          now < startTime ? 'upcoming' : now > endTime ? 'ended' : 'active';
        const daysUntilStart = status === 'upcoming' ? Math.max(0, Math.ceil((startTime - now) / 86400)) : undefined;
        const daysUntilEnd = status === 'active' ? Math.max(0, Math.ceil((endTime - now) / 86400)) : undefined;
        const participantsPercentage =
          maxParticipants === 0n
            ? 0
            : Math.min(100, Math.round((Number(adjustedCurrentParticipants) / Number(maxParticipants)) * 100));

        return {
          eventId: config.eventId,
          name: config.name,
          startTime: config.startTime,
          endTime: config.endTime,
          maxParticipants,
          currentParticipants: adjustedCurrentParticipants,
          isActive,
          status,
          isFull,
          daysUntilStart,
          daysUntilEnd,
          participantsPercentage,
        };
      });
  }, [eventConfigs, localParticipantBumps]);

  const events = useMemo(() => {
    const applyBump = (event: EventData) => {
      const bump = BigInt(localParticipantBumps[event.eventId] || 0);
      if (bump === 0n) {
        return event;
      }
      const currentParticipants = BigInt(event.currentParticipants);
      const maxParticipants = BigInt(event.maxParticipants);
      const adjustedCurrent = currentParticipants + bump;
      const isFull = maxParticipants > 0n && adjustedCurrent >= maxParticipants;
      const participantsPercentage =
        maxParticipants === 0n
          ? 0
          : Math.min(100, Math.round((Number(adjustedCurrent) / Number(maxParticipants)) * 100));
      return {
        ...event,
        currentParticipants: adjustedCurrent,
        maxParticipants,
        isFull,
        participantsPercentage,
      };
    };

    const map = new Map<string, EventData>();
    onchainEvents.forEach((event) => {
      map.set(event.eventId, event);
    });
    dummyEvents.forEach((event) => {
      if (!map.has(event.eventId)) {
        map.set(event.eventId, applyBump(event));
      }
    });
    return Array.from(map.values());
  }, [onchainEvents, dummyEvents, localParticipantBumps]);

  const isLoading = isLoadingEventIds || isLoadingEvents;

  const joinEvent = async (eventId: string) => {
    console.log('Join event:', eventId);
    alert('Event join functionality coming soon! Contract integration needed.');
  };

  return {
    events,
    isLoading,
    eventCount: eventCountNumber,
    joinEvent,
    isEventManager: Boolean(isEventManagerData),
    isCheckingRole,
    refetchEvents: async () => {
      await refetchEventIds();
      await refetchEvents();
    },
  };
}
