# Fix Streak Counter - Current Streak vs Longest Streak

## Problem
Streak menunjukkan "00 Days" padahal user sudah melakukan run. 

## Root Cause
1. Backend hanya menghitung `longestStreakDays` (streak terpanjang sepanjang masa)
2. Frontend mencoba membaca `currentStreak` yang tidak ada di backend
3. Tidak ada logika untuk menghitung **current active streak**

## Solution
Tambahkan fungsi `calculateCurrentStreak` di backend yang menghitung streak aktif saat ini.

### Current Streak vs Longest Streak

**Current Streak**: Berapa hari berturut-turut user run sampai hari ini
- Contoh: User run 3 hari berturut-turut → Current Streak = 3
- Jika user skip 1 hari → Current Streak = 0 (reset)

**Longest Streak**: Streak terpanjang yang pernah dicapai
- Contoh: User pernah run 10 hari berturut-turut → Longest Streak = 10
- Longest streak tidak pernah turun

## Implementation

### 1. Update Backend - Add Current Streak Calculation

**File:** `Backend/src/utils/levelTier.js`

```javascript
// Add new function
function calculateCurrentStreak(dates) {
  if (!dates || dates.length === 0) {
    return 0;
  }

  // Convert to day numbers and sort descending (newest first)
  const uniqueDays = Array.from(
    new Set(dates.map((date) => toDayNumber(date))),
  ).sort((a, b) => b - a);

  // Get today's day number
  const today = toDayNumber(new Date());
  
  // Check if user ran today or yesterday (streak is still active)
  const lastRunDay = uniqueDays[0];
  if (lastRunDay < today - 1) {
    // Last run was more than 1 day ago, streak is broken
    return 0;
  }

  // Count consecutive days from most recent
  let streak = 0;
  let expectedDay = today;
  
  for (const day of uniqueDays) {
    if (day === expectedDay || day === expectedDay - 1) {
      streak += 1;
      expectedDay = day - 1;
    } else {
      break;
    }
  }

  return streak;
}

module.exports = {
  calculateLevel,
  calculateTier,
  calculateLongestStreakDays,
  calculateCurrentStreak, // Export new function
};
```

### 2. Update Backend - Use Current Streak

**File:** `Backend/src/server.js`

```javascript
const {
  calculateLevel,
  calculateTier,
  calculateLongestStreakDays,
  calculateCurrentStreak, // Import new function
} = require("./utils/levelTier");

// In /run/submit endpoint, after calculating longestStreakDays:
const longestStreakDays = calculateLongestStreakDays(
  verifiedRuns.map((item) => item.endTime),
);

// Add current streak calculation
const currentStreakDays = calculateCurrentStreak(
  verifiedRuns.map((item) => item.endTime),
);

// Update database with both streaks
await tx.user.update({
  where: { id: user.id },
  data: {
    exp: updatedExp,
    level: updatedLevel,
    tier: updatedTier,
    runCount: updatedRunCount,
    verifiedRunCount: updatedVerifiedRunCount,
    totalDistanceMeters: updatedTotalDistance,
    longestStreakDays,
    currentStreakDays, // Add this field
    onchainNonce: nextNonce,
    lastOnchainSyncAt: CAN_SIGN_PROFILE ? now : user.lastOnchainSyncAt,
  },
});
```

### 3. Update Database Schema

**File:** `Backend/prisma/schema.prisma`

```prisma
model User {
  id                   String   @id @default(cuid())
  walletAddress        String   @unique
  nonce                String?
  
  // Stats
  exp                  Int      @default(0)
  level                Int      @default(1)
  tier                 Int      @default(1)
  runCount             Int      @default(0)
  verifiedRunCount     Int      @default(0)
  totalDistanceMeters  Int      @default(0)
  longestStreakDays    Int      @default(0)
  currentStreakDays    Int      @default(0) // ADD THIS
  
  // Profile NFT
  profileTokenId       Int?
  onchainNonce         Int      @default(0)
  lastOnchainSyncAt    DateTime?
  
  // Timestamps
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
  
  // Relations
  runs                 Run[]
  achievements         Achievement[]
  eventParticipations  EventParticipation[]
  authNonces           AuthNonce[]
}
```

Run migration:
```bash
cd Backend
npx prisma migrate dev --name add_current_streak
```

### 4. Update Frontend - Use Current Streak

**File:** `hooks/useProfile.ts`

Update the profile stats interface:

```typescript
export interface ProfileStats {
  xp: number;
  level: number;
  runCount: number;
  achievementCount: number;
  totalDistanceMeters: number;
  longestStreakDays: number;
  currentStreakDays: number; // ADD THIS
  lastUpdated: number;
  currentStreak: number; // Alias for currentStreakDays
  longestStreak: number; // Alias for longestStreakDays
}

// In the hook, map the data:
const stats: ProfileStats = {
  xp: user.exp || 0,
  level: user.level || 1,
  runCount: user.verifiedRunCount || 0,
  achievementCount: user.achievements?.length || 0,
  totalDistanceMeters: user.totalDistanceMeters || 0,
  longestStreakDays: user.longestStreakDays || 0,
  currentStreakDays: user.currentStreakDays || 0, // ADD THIS
  lastUpdated: Math.floor(Date.now() / 1000),
  currentStreak: user.currentStreakDays || 0, // Alias
  longestStreak: user.longestStreakDays || 0, // Alias
};
```

### 5. Update Backend API Response

**File:** `Backend/src/server.js`

In `/auth/connect` endpoint, include currentStreakDays:

```javascript
return res.json({
  token,
  user: {
    id: user.id,
    walletAddress: user.walletAddress,
    tier: user.tier,
    exp: user.exp,
    totalDistanceMeters: user.totalDistanceMeters,
    runCount: user.runCount,
    verifiedRunCount: user.verifiedRunCount,
    profileTokenId: user.profileTokenId,
    longestStreakDays: user.longestStreakDays,
    currentStreakDays: user.currentStreakDays, // ADD THIS
  },
});
```

## Testing

### Test Scenario 1: New User
```
Day 1: User runs → Current Streak = 1, Longest Streak = 1
Day 2: User runs → Current Streak = 2, Longest Streak = 2
Day 3: User runs → Current Streak = 3, Longest Streak = 3
```

### Test Scenario 2: Streak Break
```
Day 1-3: User runs → Current Streak = 3, Longest Streak = 3
Day 4: User skips
Day 5: User runs → Current Streak = 1, Longest Streak = 3 (unchanged)
```

### Test Scenario 3: Comeback
```
Day 1-5: User runs → Current Streak = 5, Longest Streak = 5
Day 6-7: User skips
Day 8-12: User runs → Current Streak = 5, Longest Streak = 5 (tied)
Day 13: User runs → Current Streak = 6, Longest Streak = 6 (new record!)
```

## Migration Steps

1. ✅ Add `calculateCurrentStreak` function to `levelTier.js`
2. ✅ Add `currentStreakDays` field to Prisma schema
3. Run Prisma migration
4. Update `/run/submit` endpoint to calculate current streak
5. Update `/auth/connect` response to include current streak
6. Update frontend `useProfile` hook to use current streak
7. Test with multiple scenarios

## Expected Result

After fix:
- Streak counter shows current active streak
- Resets to 0 if user skips a day
- Increments by 1 each day user runs
- Longest streak preserved separately

## Notes

- Current streak resets if user doesn't run for 1 day
- Longest streak never decreases
- Both streaks stored in database
- Frontend displays current streak in QuestCard
- Profile page can show both current and longest streak
