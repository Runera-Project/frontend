import { useState } from 'react';
import { useAccount } from 'wagmi';
import { joinEvent } from '@/lib/api';

export function useJoinEvent() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recordLocalJoin = (eventId: string) => {
    if (typeof window === 'undefined') {
      return false;
    }

    const joinedEvents = JSON.parse(localStorage.getItem('runera_joined_events') || '[]') as string[];
    if (joinedEvents.includes(eventId)) {
      return false;
    }

    joinedEvents.push(eventId);
    localStorage.setItem('runera_joined_events', JSON.stringify(joinedEvents));

    const participantBumps = JSON.parse(localStorage.getItem('runera_event_participant_bumps') || '{}') as Record<string, number>;
    participantBumps[eventId] = (participantBumps[eventId] || 0) + 1;
    localStorage.setItem('runera_event_participant_bumps', JSON.stringify(participantBumps));

    window.dispatchEvent(new CustomEvent('runera:joined_event', { detail: { eventId } }));
    return true;
  };

  const join = async (eventId: string) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Joining event:', eventId);
      
      // Try to join via backend
      try {
        const result = await joinEvent({
          userAddress: address,
          eventId,
        });
        recordLocalJoin(eventId);
        console.log('Join event result:', result);
        setIsLoading(false);
        return result;
      } catch (backendError: unknown) {
        const backendMessage =
          backendError instanceof Error ? backendError.message : 'Backend not available';
        console.warn('Backend not available, saving locally:', backendMessage);

        recordLocalJoin(eventId);

        setIsLoading(false);
        return {
          success: true,
          message: 'Joined event locally (backend unavailable)',
          eventId,
        };
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join event';
      console.error('Join event error:', errorMessage);
      setError(errorMessage);
      setIsLoading(false);
      throw new Error(errorMessage);
    }
  };

  return {
    join,
    isLoading,
    error,
  };
}
