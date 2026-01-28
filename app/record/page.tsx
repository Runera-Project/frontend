'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';
import { useRouter } from 'next/navigation';

type RecordState = 'idle' | 'recording' | 'paused';

export default function RecordPage() {
  const router = useRouter();
  const [recordState, setRecordState] = useState<RecordState>('idle');
  const [timer, setTimer] = useState(0);
  const [distance, setDistance] = useState(0);
  const [pace, setPace] = useState('0:00');
  const [showMap, setShowMap] = useState(true); // Default show map on idle

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (recordState === 'recording') {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
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
    setShowMap(true); // Always show map when recording
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

  const isIdle = recordState === 'idle';
  const isRecording = recordState === 'recording';

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col pb-28">
        
        {/* Idle State with Map (Default) */}
        {isIdle && showMap && (
          <>
            {/* Full Map - Fullscreen */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200">
              {/* Mock Map Background - Full Screen */}
              <div className="absolute inset-0">
                <svg className="h-full w-full" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#999" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="400" height="600" fill="url(#grid)" />
                  <text x="50" y="150" fontSize="10" fill="#666" opacity="0.6">Jl. Nusantara</text>
                  <text x="200" y="300" fontSize="10" fill="#666" opacity="0.6">Quest House</text>
                  <text x="100" y="450" fontSize="10" fill="#666" opacity="0.6">Jl. Taman Bungur</text>
                </svg>
              </div>

              {/* Stats Overlay on Map - Much Lower position */}
              <div className="absolute bottom-32 left-4 right-4">
                <div className="rounded-2xl bg-white/95 p-5 shadow-lg backdrop-blur-sm">
                  {/* Collapse Button at Top of Card */}
                  <div className="mb-3 flex justify-center">
                    <button
                      onClick={() => setShowMap(false)}
                      className="flex items-center justify-center text-blue-500"
                    >
                      <ChevronDown className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="mb-5 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">00:00</div>
                      <div className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Time</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-gray-900">0</div>
                      <div className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Distance (KM)</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">--</div>
                      <div className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Speed (KM/H)</div>
                    </div>
                  </div>
                  {/* Play Button inside card */}
                  <div className="flex justify-center">
                    <button
                      onClick={handleStart}
                      className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg transition-all hover:scale-105"
                    >
                      <svg className="h-8 w-8 text-white" fill="white" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Idle State without Map (Collapsed) */}
        {isIdle && !showMap && (
          <>
            {/* Expand Button at Top */}
            <div className="flex justify-center pt-5 pb-2">
              <button
                onClick={() => setShowMap(true)}
                className="flex items-center justify-center text-blue-500"
              >
                <ChevronUp className="h-6 w-6" />
              </button>
            </div>

            {/* Status Badge */}
            <div className="flex justify-center pb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm">
                <div className="h-2 w-2 rounded-full bg-gray-300" />
                <span className="text-xs font-medium text-gray-600">READY</span>
              </div>
            </div>

            {/* Center Stats Display */}
            <div className="flex flex-1 flex-col items-center justify-center px-5">
              <div className="mb-12 text-center">
                <div className="mb-2 text-7xl font-bold text-gray-900">00:00</div>
                <div className="text-xs font-medium uppercase tracking-wide text-gray-400">Time Elapsed</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-6xl font-bold text-gray-900">0.00</div>
                <div className="text-xs font-medium uppercase tracking-wide text-gray-400">Kilometers</div>
              </div>
            </div>

            {/* Play Button */}
            <div className="flex justify-center px-5">
              <button
                onClick={handleStart}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg transition-all hover:scale-105"
              >
                <svg className="h-10 w-10 text-white" fill="white" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          </>
        )}

        {/* Recording/Paused State */}
        {!isIdle && (
          <>
            {/* Map View */}
            {showMap && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200">
                {/* Mock Map Background - Full Screen */}
                <div className="absolute inset-0">
                  <svg className="h-full w-full" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice">
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#999" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="400" height="600" fill="url(#grid)" />
                    <text x="50" y="150" fontSize="10" fill="#666" opacity="0.6">Jl. Nusantara</text>
                    <text x="200" y="300" fontSize="10" fill="#666" opacity="0.6">Quest House</text>
                    <text x="100" y="450" fontSize="10" fill="#666" opacity="0.6">Jl. Taman Bungur</text>
                  </svg>
                </div>

                {/* Running Route - Full Screen */}
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice">
                  <path
                    d="M 80 300 Q 120 220, 180 260 T 280 290 Q 320 320, 320 400 L 280 440 Q 240 470, 180 430 T 100 370 Q 80 340, 80 300"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={isRecording ? 'animate-pulse' : ''}
                  />
                  <circle cx="80" cy="300" r="8" fill="#10B981" stroke="white" strokeWidth="3" />
                  {isRecording && (
                    <g>
                      <circle cx="320" cy="400" r="10" fill="#3B82F6" opacity="0.3">
                        <animate attributeName="r" from="10" to="20" dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.3" to="0" dur="1.5s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="320" cy="400" r="8" fill="#3B82F6" stroke="white" strokeWidth="3" />
                    </g>
                  )}
                </svg>

                {/* Stats Overlay on Map - Much Lower position */}
                <div className="absolute bottom-32 left-4 right-4">
                  <div className="rounded-2xl bg-white/95 p-5 shadow-lg backdrop-blur-sm">
                    {/* Collapse Button at Top of Card */}
                    <div className="mb-3 flex justify-center">
                      <button
                        onClick={() => setShowMap(false)}
                        className="flex items-center justify-center text-blue-500"
                      >
                        <ChevronDown className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="mb-5 grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{formatTime(timer)}</div>
                        <div className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Time</div>
                      </div>
                      <div>
                        <div className="text-4xl font-bold text-gray-900">{Math.floor(distance)}</div>
                        <div className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Distance (KM)</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">--</div>
                        <div className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Speed (KM/H)</div>
                      </div>
                    </div>
                    {/* Control Buttons inside card */}
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={handleStop}
                        className="flex h-14 w-28 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-red-600 shadow-md transition-all hover:scale-105"
                      >
                        <div className="h-4 w-4 rounded bg-white" />
                      </button>
                      <button
                        onClick={isRecording ? handlePause : handleResume}
                        className="flex h-14 w-28 items-center justify-center gap-2 rounded-full bg-white shadow-md transition-all hover:scale-105"
                      >
                        {isRecording ? (
                          <svg className="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                          </svg>
                        ) : (
                          <svg className="h-6 w-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stats View (when map collapsed) */}
            {!showMap && (
              <>
                {/* Expand Button at Top */}
                <div className="flex justify-center pt-5 pb-2">
                  <button
                    onClick={() => setShowMap(true)}
                    className="flex items-center justify-center text-blue-500"
                  >
                    <ChevronUp className="h-6 w-6" />
                  </button>
                </div>

                {/* Status Badge */}
                <div className="flex justify-center pb-6">
                  <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm">
                    <div className={`h-2 w-2 rounded-full ${isRecording ? 'bg-blue-500 animate-pulse' : 'bg-yellow-500'}`} />
                    <span className="text-xs font-bold uppercase text-blue-600">{isRecording ? 'Running' : 'Paused'}</span>
                  </div>
                </div>

                {/* Large Stats */}
                <div className="flex flex-1 flex-col items-center justify-center px-5">
                  <div className="mb-8 text-center">
                    <div className="mb-2 text-7xl font-bold text-gray-900">{formatTime(timer)}</div>
                    <div className="text-sm font-medium uppercase tracking-wide text-blue-500">Time Elapsed</div>
                  </div>
                  <div className="mb-8 text-center">
                    <div className="mb-2 text-6xl font-bold text-gray-900">{distance.toFixed(2)}</div>
                    <div className="text-sm font-medium uppercase tracking-wide text-blue-500">Kilometers</div>
                  </div>
                  <div className="grid grid-cols-2 gap-8 text-center">
                    <div>
                      <div className="mb-1 text-3xl font-bold text-gray-900">{pace}</div>
                      <div className="text-xs font-medium uppercase tracking-wide text-gray-400">Avg Pace</div>
                    </div>
                    <div>
                      <div className="mb-1 text-3xl font-bold text-gray-900">0.00</div>
                      <div className="text-xs font-medium uppercase tracking-wide text-gray-400">BPM</div>
                    </div>
                  </div>
                </div>

                {/* Control Buttons for collapsed view */}
                <div className="px-5">
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={handleStop}
                      className="flex h-16 w-32 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-red-600 shadow-lg transition-all hover:scale-105"
                    >
                      <div className="h-5 w-5 rounded bg-white" />
                    </button>
                    <button
                      onClick={isRecording ? handlePause : handleResume}
                      className="flex h-16 w-32 items-center justify-center gap-2 rounded-full bg-white shadow-lg transition-all hover:scale-105"
                    >
                      {isRecording ? (
                        <svg className="h-8 w-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                      ) : (
                        <svg className="h-8 w-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      <BottomNavigation activeTab="Record" />
    </div>
  );
}
