'use client';

import { useEffect, useState } from 'react';
import { useToast } from './ToastProvider';

export default function BackendStatus() {
  const [hasShownStatus, setHasShownStatus] = useState(false);
  const toast = useToast();

  useEffect(() => {
    // Only check once on mount
    if (hasShownStatus) return;

    const checkBackend = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`);
        if (response.ok) {
          toast.success('Backend connected', 2000);
        } else {
          toast.warning('Backend connection unstable', 3000);
        }
      } catch (error) {
        toast.error('Backend offline', 3000);
      } finally {
        setHasShownStatus(true);
      }
    };

    // Check after a short delay to avoid showing too many toasts at once
    const timer = setTimeout(checkBackend, 1500);
    return () => clearTimeout(timer);
  }, [hasShownStatus, toast]);

  // This component doesn't render anything visible
  return null;
}
