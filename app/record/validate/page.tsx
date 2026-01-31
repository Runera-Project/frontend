'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, MapPin, Clock, TrendingUp, Share2 } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';
import { Suspense, useState } from 'react';
import { useAccount, useWriteContract, useSwitchChain } from 'wagmi';
import { submitRun } from '@/lib/api';
import { CONTRACTS, ABIS } from '@/lib/contracts';
import { baseSepolia } from 'viem/chains';
import { useModal } from '@/hooks/useModal';
import { useToast } from '@/components/ToastProvider';
import Modal from '@/components/Modal';

function ValidateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { address, chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const [title, setTitle] = useState('Morning Run');
  const [isPosting, setIsPosting] = useState(false);
  const [useDummyData, setUseDummyData] = useState(false);
  const { writeContractAsync } = useWriteContract();
  const modal = useModal();
  const toast = useToast();
  
  const time = searchParams.get('time') || '0';
  const distance = searchParams.get('distance') || '0.00';
  const pace = searchParams.get('pace') || '0:00';
  const startTime = searchParams.get('startTime') || String(Date.now() - parseInt(time) * 1000);
  const endTime = searchParams.get('endTime') || String(Date.now());
  const gpsDataStr = searchParams.get('gpsData') || '[]';
  
  let gpsData = [];
  try {
    gpsData = JSON.parse(decodeURIComponent(gpsDataStr));
  } catch (e) {
    console.error('Failed to parse GPS data:', e);
  }

  const formatTime = (seconds: string) => {
    const secs = parseInt(seconds);
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handleCancel = () => {
    // Kembali ke record page dengan state paused
    router.push('/record?state=paused');
  };

  const handlePost = async () => {
    if (!address) {
      modal.warning('Wallet Not Connected', 'Please connect your wallet first to post your activity.');
      return;
    }

    const storedWallet = typeof window !== 'undefined' ? localStorage.getItem('runera_wallet') : null;
    if (storedWallet && storedWallet.toLowerCase() !== address.toLowerCase()) {
      console.warn('Wallet address mismatch with JWT session. Resetting token.');
      localStorage.removeItem('runera_token');
      localStorage.setItem('runera_wallet', address.toLowerCase());
      alert('Wallet address changed.\n\nPlease login again to sync your session with the backend.');
      router.push('/login');
      return;
    }

    // Check if JWT token exists
    const token = localStorage.getItem('runera_token');
    console.log('🔐 JWT Token check:', token ? '✅ Token exists' : '❌ No token');
    
    if (!token) {
      console.warn('⚠️ No JWT token found!');
      modal.warning(
        'Authentication Required',
        'Please sign the message in your wallet to authenticate.\n\nRedirecting to login...',
        () => router.push('/login')
      );
      return;
    }

    console.log('📍 Wallet address:', address);
    console.log('🌐 Backend URL:', process.env.NEXT_PUBLIC_API_URL);

    setIsPosting(true);

    try {
      // Generate device hash (simple hash dari user agent + timestamp)
      const deviceInfo = `${navigator.userAgent}-${address}`;
      const deviceHash = btoa(deviceInfo).substring(0, 32);

      // Prepare data untuk backend
      let distanceInMeters, durationInSeconds, gpsDataToSend;
      
      if (useDummyData) {
        // ✅ DUMMY DATA - Guaranteed to pass validation
        console.log('🧪 Using DUMMY DATA for testing');
        
        distanceInMeters = 5000;  // 5km (well above 100m minimum)
        durationInSeconds = 1800; // 30 minutes (6 min/km pace - realistic)
        
        // Generate dummy GPS data (at least 2 points)
        gpsDataToSend = [
          {
            latitude: -6.2088,
            longitude: 106.8456,
            timestamp: Date.now() - 1800000,
            accuracy: 10
          },
          {
            latitude: -6.2100,
            longitude: 106.8470,
            timestamp: Date.now() - 1500000,
            accuracy: 10
          },
          {
            latitude: -6.2115,
            longitude: 106.8485,
            timestamp: Date.now() - 1200000,
            accuracy: 10
          },
          {
            latitude: -6.2130,
            longitude: 106.8500,
            timestamp: Date.now() - 900000,
            accuracy: 10
          },
          {
            latitude: -6.2145,
            longitude: 106.8515,
            timestamp: Date.now(),
            accuracy: 10
          }
        ];
        
        console.log('✅ Dummy data:', {
          distance: '5000m (5km)',
          duration: '1800s (30min)',
          pace: '6:00 min/km',
          gpsPoints: gpsDataToSend.length
        });
      } else {
        // Real data from GPS tracking
        distanceInMeters = Math.round(parseFloat(distance) * 1000);
        durationInSeconds = parseInt(time);
        
        // TEMPORARY: For testing, ensure minimum distance of 1 meter
        if (distanceInMeters === 0) {
          console.warn('Distance is 0, setting to 1 meter for testing');
          distanceInMeters = 1;
        }
        
        gpsDataToSend = gpsData.length > 0 ? gpsData : undefined;
      }
      
      const runData = {
        // walletAddress tidak perlu dikirim - backend akan extract dari JWT
        distanceMeters: distanceInMeters, // Backend expects distanceMeters (min 1)
        durationSeconds: durationInSeconds, // Backend expects durationSeconds
        startTime: useDummyData ? Date.now() - 1800000 : parseInt(startTime),
        endTime: useDummyData ? Date.now() : parseInt(endTime),
        deviceHash,
        gpsData: gpsDataToSend,
      };

      console.log('Submitting run to backend:', runData);

      // Submit ke backend /run/submit
      const result = await submitRun(runData);

      console.log('=== BACKEND RESPONSE ===');
      console.log('Full response:', JSON.stringify(result, null, 2));
      console.log('Status:', result.status);
      console.log('Reason Code:', result.reasonCode);
      console.log('Run ID:', result.runId);
      
      // Check if run was verified
      if (result.status !== 'VERIFIED') {
        console.warn('⚠️ Run was not verified!');
        console.warn('Status:', result.status);
        console.warn('Reason:', result.reasonCode);
        modal.warning(
          'Run Not Verified',
          `Status: ${result.status}\nReason: ${result.reasonCode || 'Unknown'}\n\nPlease check console for details.`,
          () => router.push('/')
        );
        return;
      }

      // Extract XP earned from this run
      // Backend gives 100 XP per verified run (XP_PER_VERIFIED_RUN)
      let xpEarned = 100; // Default XP per run
      
      // If backend provides the XP earned for this specific run
      if (result.run?.xpEarned) {
        xpEarned = result.run.xpEarned;
        console.log('✅ XP earned from run:', xpEarned);
      } else if (result.xpEarned) {
        xpEarned = result.xpEarned;
        console.log('✅ XP earned:', xpEarned);
      } else {
        // Fallback: Use default 100 XP
        console.log('ℹ️ Using default XP per run:', xpEarned);
      }
      
      // Log total XP for reference
      if (result.onchainSync?.stats?.xp) {
        console.log('📊 Total XP after this run:', result.onchainSync.stats.xp);
      }
      
      const runId = result.runId || result.run?.id || 'unknown';

      // ✅ IMPORTANT: Update smart contract with signature from backend
      if (result.onchainSync?.signature) {
        console.log('📝 Updating smart contract with backend signature...');
        console.log('🔍 Debug info:', {
          userAddress: address,
          stats: result.onchainSync.stats,
          nonce: result.onchainSync.nonce,
          deadline: result.onchainSync.deadline,
          signatureLength: result.onchainSync.signature.length,
          currentTime: Math.floor(Date.now() / 1000),
          timeUntilDeadline: result.onchainSync.deadline - Math.floor(Date.now() / 1000),
        });
        
        try {
          const { stats, signature, deadline, nonce } = result.onchainSync;
          
          // ⚠️ CRITICAL: Check and switch to Base Sepolia if needed
          console.log('🔍 Current chain:', chain?.id, chain?.name);
          console.log('🎯 Target chain:', baseSepolia.id, baseSepolia.name);
          
          if (chain?.id !== baseSepolia.id) {
            console.log('⚠️ Wrong network! Switching to Base Sepolia...');
            try {
              await switchChainAsync({ chainId: baseSepolia.id });
              console.log('✅ Switched to Base Sepolia!');
            } catch (switchError: any) {
              console.error('❌ Failed to switch network:', switchError);
              throw new Error(`Please switch to Base Sepolia network in your wallet!\n\nCurrent: ${chain?.name}\nRequired: Base Sepolia`);
            }
          } else {
            console.log('✅ Already on Base Sepolia');
          }
          
          // Log nonce from backend (we'll check it manually if needed)
          console.log('📊 Backend nonce:', nonce);
          console.log('⚠️ If transaction fails, check nonce mismatch using scripts/check-nonce.html');
          
          // Validate deadline hasn't expired
          const currentTime = Math.floor(Date.now() / 1000);
          if (deadline < currentTime) {
            throw new Error(`Signature expired! Deadline: ${deadline}, Current: ${currentTime}`);
          }

          // Check if user has profile registered
          console.log('🔍 Checking if user has profile...');
          try {
            if (!publicClient) {
              throw new Error('Public client not initialized');
            }
            const hasProfile = await publicClient.readContract({
              address: CONTRACTS.ProfileNFT,
              abi: ABIS.ProfileNFT,
              functionName: 'hasProfile',
              args: [address],
            });

            console.log('📊 Profile status:', {
              hasProfile,
              userAddress: address,
            });

            if (!hasProfile) {
              throw new Error('Profile not registered! Please register your profile first on the Profile page.');
            }
          } catch (profileError: any) {
            console.error('⚠️ Failed to check profile:', profileError);
            if (profileError.message?.includes('not registered')) {
              throw profileError;
            }
          }

          console.log('✅ All pre-flight checks passed, sending transaction...');
          
          // Call updateStats on smart contract
          const tx = await writeContractAsync({
            address: CONTRACTS.ProfileNFT,
            abi: ABIS.ProfileNFT,
            functionName: 'updateStats',
            args: [
              address, // user address
              {
                xp: BigInt(stats.xp),
                level: stats.level,
                runCount: stats.runCount,
                achievementCount: stats.achievementCount,
                totalDistanceMeters: BigInt(stats.totalDistanceMeters),
                longestStreakDays: stats.longestStreakDays,
                lastUpdated: BigInt(stats.lastUpdated),
              },
              BigInt(deadline),
              signature,
            ],
          });
          
          console.log('✅ Smart contract updated!');
          console.log('Transaction hash:', tx);
          console.log('View on BaseScan:', `https://sepolia.basescan.org/tx/${tx}`);
          
          toast.success(`On-chain update successful! XP: ${stats.xp}, Level: ${stats.level}`, 3000);
        } catch (error: any) {
          console.error('❌ Smart contract update failed:', error);
          
          // Parse error message for specific issues
          let errorMsg = error.message || 'Unknown error';
          let userFriendlyMsg = '';
          
          if (errorMsg.includes('InvalidSignature') || errorMsg.includes('InvalidSigner')) {
            userFriendlyMsg = '❌ Signature verification failed!\n\nThe backend signature is invalid or the backend wallet is not authorized.\n\nPlease contact support.';
          } else if (errorMsg.includes('SignatureExpired')) {
            userFriendlyMsg = '⏰ Signature expired!\n\nThe transaction took too long to process. Please try again.';
          } else if (errorMsg.includes('NotRegistered')) {
            userFriendlyMsg = '⚠️ Profile not registered!\n\nPlease register your profile first on the Profile page.';
          } else if (errorMsg.includes('user rejected') || errorMsg.includes('User denied')) {
            userFriendlyMsg = '🚫 Transaction cancelled by user.';
          } else {
            userFriendlyMsg = `⚠️ Backend updated but on-chain sync failed!\n\nYour XP is saved in backend, but not yet on blockchain.\n\nError: ${errorMsg.substring(0, 100)}`;
          }
          
          modal.error('Transaction Failed', userFriendlyMsg);
        }
      } else {
        console.warn('⚠️ No signature from backend, skipping on-chain update');
      }

      // Update streak - increment if user ran today
      const today = new Date();
      const todayStr = today.toDateString();
      const lastRunDate = localStorage.getItem('runera_last_run_date');
      
      // Check if this is a new day
      if (lastRunDate !== todayStr) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        
        let currentStreak = parseInt(localStorage.getItem('runera_streak') || '0');
        
        // If last run was yesterday, increment streak
        // If last run was today or earlier, start new streak
        if (lastRunDate === yesterdayStr) {
          // Consecutive day - increment
          currentStreak += 1;
        } else if (!lastRunDate || new Date(lastRunDate) < yesterday) {
          // Streak broken or first run - start at 1
          currentStreak = 1;
        }
        
        // Update streak
        localStorage.setItem('runera_streak', String(currentStreak));
        localStorage.setItem('runera_last_run_date', todayStr);
        
        // Update longest streak if current is higher
        const longestStreak = parseInt(localStorage.getItem('runera_longest_streak') || '0');
        if (currentStreak > longestStreak) {
          localStorage.setItem('runera_longest_streak', String(currentStreak));
          console.log(`🔥 New longest streak record: ${currentStreak} days!`);
        }
        
        console.log(`✅ Streak updated: ${currentStreak} days (Longest: ${Math.max(currentStreak, longestStreak)})`);
      } else {
        console.log(`ℹ️ Already ran today, streak unchanged`);
      }

      // Save activity to localStorage for XP tracking
      const activities = JSON.parse(localStorage.getItem('runera_activities') || '[]');
      
      // Use dummy data distance if test mode is enabled
      const savedDistance = useDummyData ? 5.0 : parseFloat(distance);
      const savedDuration = useDummyData ? 1800 : parseInt(time);
      const savedPace = useDummyData ? '6:00' : pace;
      
      activities.push({
        id: runId,
        title,
        distance: savedDistance, // Use dummy 5km if test mode
        duration: savedDuration,
        pace: savedPace,
        timestamp: Date.now(),
        xpEarned: xpEarned, // XP from backend
        status: result.status,
      });
      localStorage.setItem('runera_activities', JSON.stringify(activities));
      console.log(`💾 Activity saved to localStorage with ${xpEarned} XP and ${savedDistance}km distance`);

      // Show success message
      if (xpEarned > 0) {
        modal.success(
          'Activity Posted! 🎉',
          `+${xpEarned} XP earned!\n\nRun ID: ${runId}\nDistance: ${savedDistance}km`,
          () => router.push('/')
        );
      } else {
        modal.success(
          'Activity Posted! 🎉',
          `Run ID: ${runId}\nDistance: ${savedDistance}km`,
          () => router.push('/')
        );
      }
    } catch (error: any) {
      console.error('Post error:', error);
      
      // Show detailed error message
      const errorMsg = error.message || 'Unknown error';
      
      // Fallback: Save to localStorage
      console.warn('Backend error, saving locally');
      
      // Use dummy data if test mode is enabled
      const fallbackDistance = useDummyData ? 5.0 : parseFloat(distance);
      const fallbackDuration = useDummyData ? 1800 : parseInt(time);
      const fallbackPace = useDummyData ? '6:00' : pace;
      
      // Estimate XP based on distance (10 XP per km) or use 100 XP for dummy
      const estimatedXP = useDummyData ? 100 : Math.round(fallbackDistance * 10);
      
      const activities = JSON.parse(localStorage.getItem('runera_activities') || '[]');
      activities.push({
        id: Date.now(),
        title,
        distance: fallbackDistance,
        duration: fallbackDuration,
        pace: fallbackPace,
        timestamp: Date.now(),
        xpEarned: estimatedXP,
        gpsData: gpsData.length > 0 ? gpsData : undefined,
      });
      localStorage.setItem('runera_activities', JSON.stringify(activities));
      
      // Update streak (same logic as success case)
      const today = new Date();
      const todayStr = today.toDateString();
      const lastRunDate = localStorage.getItem('runera_last_run_date');
      
      if (lastRunDate !== todayStr) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        
        let currentStreak = parseInt(localStorage.getItem('runera_streak') || '0');
        
        if (lastRunDate === yesterdayStr) {
          currentStreak += 1;
        } else if (!lastRunDate || new Date(lastRunDate) < yesterday) {
          currentStreak = 1;
        }
        
        localStorage.setItem('runera_streak', String(currentStreak));
        localStorage.setItem('runera_last_run_date', todayStr);
        
        const longestStreak = parseInt(localStorage.getItem('runera_longest_streak') || '0');
        if (currentStreak > longestStreak) {
          localStorage.setItem('runera_longest_streak', String(currentStreak));
        }
      }
      
      modal.success(
        'Activity Saved Locally',
        `+${estimatedXP} XP earned!\n\nNote: Backend unavailable, data saved locally.`,
        () => router.push('/')
      );
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <div className="mx-auto max-w-md pb-28">
        {/* Header */}
        <header className="px-5 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-sm">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Great Job!</h1>
              <p className="text-xs text-gray-500">Review your activity</p>
            </div>
          </div>
        </header>

        {/* Network Warning */}
        {chain && chain.id !== baseSepolia.id && (
          <div className="mx-5 mb-5 rounded-xl bg-red-50 border-2 border-red-200 p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-red-900 mb-1">Wrong Network!</h3>
                <p className="text-xs text-red-700 mb-2">
                  You're on <span className="font-semibold">{chain.name}</span>. Please switch to <span className="font-semibold">Base Sepolia</span> to submit your run.
                </p>
                <button
                  onClick={async () => {
                    try {
                      await switchChainAsync({ chainId: baseSepolia.id });
                    } catch (error) {
                      console.error('Failed to switch network:', error);
                    }
                  }}
                  className="text-xs font-bold text-red-600 hover:text-red-800 underline"
                >
                  Switch to Base Sepolia
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Map Preview */}
        <div className="mx-5 mb-5 overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="flex h-full items-center justify-center">
              <MapPin className="h-10 w-10 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Activity Title */}
        <div className="mx-5 mb-5">
          <label className="mb-2 block text-xs font-semibold text-gray-700">Activity Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Enter activity title"
          />
        </div>

        {/* Stats Summary */}
        <div className="mx-5 mb-5 rounded-xl bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-gray-900">Summary</h3>
          
          <div className="mb-4 grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="mb-2 flex justify-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="mb-1 text-[10px] font-medium text-gray-500">Duration</p>
              <p className="text-lg font-bold text-gray-900">{formatTime(time)}</p>
            </div>

            <div className="text-center">
              <div className="mb-2 flex justify-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                  <MapPin className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <p className="mb-1 text-[10px] font-medium text-gray-500">Distance</p>
              <p className="text-lg font-bold text-gray-900">{distance}</p>
              <p className="text-[10px] text-gray-500">km</p>
            </div>

            <div className="text-center">
              <div className="mb-2 flex justify-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <p className="mb-1 text-[10px] font-medium text-gray-500">Avg Pace</p>
              <p className="text-lg font-bold text-gray-900">{pace}</p>
              <p className="text-[10px] text-gray-500">/km</p>
            </div>
          </div>

          {/* XP Earned - Will be calculated by backend */}
          <div className="mb-4 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 p-3 text-center">
            <p className="mb-1 text-xs font-medium text-orange-600">Estimated XP</p>
            <p className="text-2xl font-bold text-orange-700">+{Math.round(parseFloat(distance) * 10)} XP</p>
            <p className="text-[10px] text-orange-500 mt-1">Final XP will be calculated by backend</p>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="mb-1 text-[10px] font-medium text-gray-500">Calories</p>
              <p className="text-base font-bold text-gray-900">
                {Math.round(parseFloat(distance) * 65)} <span className="text-xs font-normal text-gray-500">kcal</span>
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="mb-1 text-[10px] font-medium text-gray-500">Elevation</p>
              <p className="text-base font-bold text-gray-900">
                {Math.round(parseFloat(distance) * 15)} <span className="text-xs font-normal text-gray-500">m</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mx-5 space-y-3">
          {/* Test Mode Toggle */}
          <div className="rounded-xl bg-yellow-50 border-2 border-yellow-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🧪</span>
                <span className="text-sm font-bold text-yellow-900">Test Mode</span>
              </div>
              <button
                onClick={() => setUseDummyData(!useDummyData)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  useDummyData ? 'bg-yellow-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    useDummyData ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-yellow-700">
              {useDummyData 
                ? '✅ Using dummy data (5km, 30min, 6:00 pace, GPS data)' 
                : 'Using real GPS tracking data'}
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              disabled={isPosting}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm transition-all hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
            <button
              onClick={handlePost}
              disabled={isPosting}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Share2 className="h-4 w-4" />
              {isPosting ? 'Posting...' : useDummyData ? 'Test Submit' : 'Post'}
            </button>
          </div>
        </div>
      </div>
      <BottomNavigation activeTab="Record" />
      
      {/* Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={modal.closeModal}
        title={modal.config.title}
        message={modal.config.message}
        type={modal.config.type}
        confirmText={modal.config.confirmText}
        cancelText={modal.config.cancelText}
        onConfirm={modal.config.onConfirm}
        showCancel={modal.config.showCancel}
      />
    </div>
  );
}

export default function ValidatePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fa]">
        <div className="text-gray-400">Loading...</div>
      </div>
    }>
      <ValidateContent />
    </Suspense>
  );
}
