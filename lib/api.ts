/**
 * API Client untuk Backend Integration
 * Base URL: https://backend-production-dfd3.up.railway.app
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * Get JWT token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('runera_token');
}

/**
 * Helper function untuk fetch dengan error handling
 */
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const token = getAuthToken();
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      // Try to get error message from response body
      let errorMessage = `HTTP ${response.status}`;
      let errorDetails = null;
      
      try {
        const responseText = await response.text();
        console.log('=== BACKEND ERROR RESPONSE (RAW) ===');
        console.log('Status:', response.status);
        console.log('Response Text:', responseText);
        
        try {
          errorDetails = JSON.parse(responseText);
          console.log('Parsed JSON:', errorDetails);
          errorMessage = errorDetails.message || errorDetails.error || responseText;
        } catch {
          errorMessage = responseText || response.statusText;
        }
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      
      // Create error with the message we built
      console.log('Final error message:', errorMessage);
      
      const err = new Error(errorMessage);
      (err as any).details = errorDetails;
      (err as any).status = response.status;
      throw err;
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

/**
 * ============================================
 * AUTHENTICATION API
 * ============================================
 */

export interface RequestNonceRequest {
  walletAddress: string;
}

export interface RequestNonceResponse {
  nonce: string;
  message: string;
}

export interface ConnectRequest {
  walletAddress: string;
  signature: string;
  message: string;
  nonce: string;
}

export interface ConnectResponse {
  token: string;
  user: {
    walletAddress: string;
    nonce: string;
  };
}

export interface FaucetRequest {
  walletAddress: string;
}

export interface FaucetResponse {
  success: boolean;
  txHash?: string;
  amountWei?: string;
  walletAddress: string;
}

/**
 * Request nonce for wallet authentication
 * POST /auth/nonce
 */
export async function requestNonce(
  data: RequestNonceRequest
): Promise<RequestNonceResponse> {
  return fetchAPI<RequestNonceResponse>('/auth/nonce', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Connect wallet and get JWT token
 * POST /auth/connect
 */
export async function connectWallet(
  data: ConnectRequest
): Promise<ConnectResponse> {
  const response = await fetchAPI<ConnectResponse>('/auth/connect', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  // Save token to localStorage
  if (response.token) {
    localStorage.setItem('runera_token', response.token);
    localStorage.setItem('runera_wallet', response.user.walletAddress.toLowerCase());
    console.log('✅ JWT token saved to localStorage');
  }
  
  return response;
}

export async function requestFaucet(
  data: FaucetRequest
): Promise<FaucetResponse> {
  return fetchAPI<FaucetResponse>('/faucet/request', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * ============================================
 * RUN SUBMISSION API
 * ============================================
 */

export interface RunSubmitRequest {
  // walletAddress is now optional - backend will extract from JWT
  walletAddress?: string;
  distanceMeters: number; // in meters
  durationSeconds: number; // in seconds
  startTime: number; // unix timestamp
  endTime: number; // unix timestamp
  deviceHash: string; // hash of device info
  gpsData?: Array<{
    latitude: number;
    longitude: number;
    timestamp: number;
    accuracy?: number;
  }>;
}

export interface RunSubmitResponse {
  success?: boolean;
  message?: string;
  runId: string;
  status: string;
  reasonCode: string | null;
  onchainSync?: {
    signature: string;
    deadline: number;
    stats: ProfileStats;
  };
  // Legacy fields (might not be present)
  run?: {
    id: string;
    distance: number;
    duration: number;
    xpEarned: number;
  };
  signature?: {
    signature: string;
    deadline: number;
    stats: ProfileStats;
  };
}

/**
 * Submit completed run to backend
 * POST /run/submit
 */
export async function submitRun(
  data: RunSubmitRequest
): Promise<RunSubmitResponse> {
  return fetchAPI<RunSubmitResponse>('/run/submit', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * ============================================
 * PROFILE API
 * ============================================
 */

export interface ProfileStats {
  xp: number;
  level: number;
  runCount: number;
  achievementCount: number;
  totalDistanceMeters: number;
  longestStreakDays: number;
  lastUpdated: number;
}

export interface UpdateStatsRequest {
  userAddress: string;
  stats: ProfileStats;
}

export interface UpdateStatsResponse {
  success: boolean;
  signature: string;
  deadline: number;
  stats: ProfileStats;
}

/**
 * Request signature untuk update profile stats
 * POST /api/profile/update-stats
 */
export async function requestUpdateStatsSignature(
  data: UpdateStatsRequest
): Promise<UpdateStatsResponse> {
  return fetchAPI<UpdateStatsResponse>('/api/profile/update-stats', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * ============================================
 * ACHIEVEMENT API
 * ============================================
 */

export interface ClaimAchievementRequest {
  userAddress: string;
  eventId: string;
  tier: number;
  metadataHash: string;
}

export interface ClaimAchievementResponse {
  success: boolean;
  signature: string;
  deadline: number;
  eventId: string;
  tier: number;
  metadataHash: string;
}

/**
 * Request signature untuk claim achievement
 * POST /api/achievements/claim
 */
export async function requestClaimAchievementSignature(
  data: ClaimAchievementRequest
): Promise<ClaimAchievementResponse> {
  return fetchAPI<ClaimAchievementResponse>('/api/achievements/claim', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * ============================================
 * EVENT API
 * ============================================
 */

export interface JoinEventRequest {
  userAddress: string;
  eventId: string;
}

export interface JoinEventResponse {
  success: boolean;
  message: string;
  eventId: string;
}

/**
 * Join event
 * POST /api/events/join
 */
export async function joinEvent(
  data: JoinEventRequest
): Promise<JoinEventResponse> {
  return fetchAPI<JoinEventResponse>('/api/events/join', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * ============================================
 * ACTIVITY API (GPS Tracking)
 * ============================================
 */

export interface StartActivityRequest {
  userAddress: string;
  activityType: 'run' | 'walk' | 'cycle';
}

export interface StartActivityResponse {
  success: boolean;
  activityId: string;
  startTime: number;
}

export interface UpdateActivityRequest {
  activityId: string;
  gpsData: {
    latitude: number;
    longitude: number;
    timestamp: number;
    accuracy?: number;
  }[];
}

export interface UpdateActivityResponse {
  success: boolean;
  activityId: string;
  pointsRecorded: number;
}

export interface EndActivityRequest {
  activityId: string;
  userAddress: string;
}

export interface EndActivityResponse {
  success: boolean;
  activityId: string;
  stats: {
    distance: number;
    duration: number;
    avgSpeed: number;
  };
  xpEarned: number;
}

/**
 * Start new activity
 * POST /api/activities/start
 */
export async function startActivity(
  data: StartActivityRequest
): Promise<StartActivityResponse> {
  return fetchAPI<StartActivityResponse>('/api/activities/start', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update activity with GPS data
 * POST /api/activities/update
 */
export async function updateActivity(
  data: UpdateActivityRequest
): Promise<UpdateActivityResponse> {
  return fetchAPI<UpdateActivityResponse>('/api/activities/update', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * End activity and get stats
 * POST /api/activities/end
 */
export async function endActivity(
  data: EndActivityRequest
): Promise<EndActivityResponse> {
  return fetchAPI<EndActivityResponse>('/api/activities/end', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * ============================================
 * HEALTH CHECK
 * ============================================
 */

export interface HealthCheckResponse {
  status: string;
  timestamp: number;
  version?: string;
}

/**
 * Check backend health
 * GET /health
 */
export async function checkHealth(): Promise<HealthCheckResponse> {
  return fetchAPI<HealthCheckResponse>('/health');
}

/**
 * ============================================
 * HELPER FUNCTIONS
 * ============================================
 */

/**
 * Get API base URL
 */
export function getAPIUrl(): string {
  return API_URL;
}

/**
 * Check if backend is available
 */
export async function isBackendAvailable(): Promise<boolean> {
  try {
    await checkHealth();
    return true;
  } catch (error) {
    console.error('Backend not available:', error);
    return false;
  }
}
