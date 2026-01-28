'use client';

import { useState, useEffect } from 'react';
import { Map, BarChart3, Play, Pause, Square } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';
import MapPreview from '@/components/record/MapPreview';
import StatsDisplay from '@/components/record/StatsDisplay';
import RecordControls from '@/components/record/RecordControls';
import { useRouter } from 'next/navigation';

type RecordState = 'idle' | 'recording' | 'paused';
type ViewMode = 'map' | 'stats';

export default function RecordPage() {
  const router = useRouter();
  const [recordState, setRecordState] = useState<RecordState>('idle');
  const [viewMode, setViewMode] = useState<ViewMode>('stats');
  const [timer, setTimer] = useState(0);
  const [distance, setDistance] = useState(0);
  const [pace, setPace] = useState('0:00');

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (recordState === 'recording') {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
        // Simulate distance increase (0.05 km per second = 3 km/h)
        setDistance((prev) => prev + 0.0008);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [recordState]);

  // Calculate pace
  useEffect(() => {
    if (distance > 0 && timer > 0) {
      const minutes = timer / 60;
      const paceValue = minutes / distance;
      const paceMinutes = Math.floor(paceValue);
      const paceSeconds = Math.floor((paceValue - paceMinutes) * 60);
      setPace(`${paceMinutes}:${paceSeconds.toString().padStart(2, '0')}`);
    }
  }, [distance, timer]);

  const handleStart = () => {
    setRecordState('recording');
  };

  const handlePause = () => {
    setRecordState('paused');
  };

  const handleResume = () => {
    setRecordState('recording');
  };

  const handleStop = () => {
    router.push(`/record/validate?time=${timer}&distance=${distance.toFixed(2)}&pace=${pace}`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'map' ? 'stats' : 'map');
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] pb-safe">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <header className="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Record</h1>
          </div>
          <button
            onClick={toggleViewMode}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm transition-all hover:shadow-md"
          >
            {viewMode === 'map' ? (
              <BarChart3 className="h-5 w-5 text-gray-600" />
            ) : (
              <Map className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </header>

        {/* Status Badge */}
        <div className="px-6 pb-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm">
            <div className={`h-2 w-2 rounded-full ${
              recordState === 'recording' ? 'bg-green-500 animate-pulse' : 
              recordState === 'paused' ? 'bg-yellow-500' : 
              'bg-gray-300'
            }`} />
            <span className="text-sm font-medium text-gray-600">
              {recordState === 'recording' ? 'Recording' : 
               recordState === 'paused' ? 'Paused' : 
               'Ready'}
            </span>
          </div>
        </div>

        {/* Map Preview (only in map view) */}
        {viewMode === 'map' && recordState !== 'idle' && (
          <MapPreview isRecording={recordState === 'recording'} />
        )}

        {/* Stats Display */}
        <StatsDisplay
          timer={formatTime(timer)}
          distance={distance.toFixed(2)}
          pace={pace}
          viewMode={viewMode}
          recordState={recordState}
        />

        {/* Record Controls */}
        <RecordControls
          recordState={recordState}
          onStart={handleStart}
          onPause={handlePause}
          onResume={handleResume}
          onStop={handleStop}
        />

        <BottomNavigation activeTab="Record" />
      </div>
    </div>
  );
}
