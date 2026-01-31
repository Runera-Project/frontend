# Tier System Fixed - Based on Level/XP (Not Distance)

## Problem
Frontend was calculating tier based on `totalDistanceMeters`, but smart contract calculates tier based on `level` (which comes from XP).

## Solution
Frontend now reads tier directly from smart contract using `getProfileTier()` function. Backend handles all XP → Level → Tier calculations.

## Changes Made

### 1. `lib/contracts.ts`
- Updated `TIER_REQUIREMENTS` to use level-based thresholds (1, 3, 5, 7, 9) instead of distance (50, 200, 500, 1000)
- Added `LEVEL_XP_REQUIREMENTS` constant for XP needed per level (0, 100, 250, 450, 700, ...)

### 2. `hooks/useProfile.ts`
- Added `getProfileTier()` call to read tier directly from smart contract
- Removed frontend tier calculation logic
- Now uses `tierData` from smart contract instead of calculating from level
- Added `level` and `xp` fields to profile stats
- Updated dummy profile to include `level` and `xp` fields

### 3. `components/profile/RankProgressCard.tsx`
- Updated to display progress based on level/XP instead of distance
- Shows level badge overlay on tier badge
- Shows XP progress bar for current level
- Shows "Next Tier: Reach Level X to unlock"
- Displays total distance as reference at bottom

## Smart Contract Tier Logic
```solidity
Bronze:   Level 1-2
Silver:   Level 3-4 (TIER_SILVER = 3)
Gold:     Level 5-6 (TIER_GOLD = 5)
Platinum: Level 7-8 (TIER_PLATINUM = 7)
Diamond:  Level 9+  (TIER_DIAMOND = 9)
```

## Backend Logic
When run is verified:
```javascript
const updatedExp = user.exp + XP_PER_VERIFIED_RUN;
const updatedLevel = calculateLevel(updatedExp);
const updatedTier = calculateTier(updatedLevel);
```

## Frontend Responsibility
Frontend only **displays** data from backend/smart contract:
- Read `xp` and `level` from `getProfile()`
- Read `tier` from `getProfileTier()`
- Show progress bars and tier badges
- **DO NOT** calculate tier on frontend

## Testing
1. User completes a run
2. Backend calculates XP → Level → Tier
3. Backend updates smart contract via `updateStats()`
4. Frontend reads updated tier from `getProfileTier()`
5. UI updates to show new tier/level/XP

## Status
✅ Tier system now matches smart contract logic
✅ Frontend reads tier from smart contract (not calculating)
✅ Level and XP displayed correctly
✅ Progress bars show XP progress within current level
