# Runera Smart Contract Analysis & Integration Guide

## 📋 Overview

Analisa lengkap smart contract Runera berdasarkan ABI files yang tersedia dan panduan integrasi ke frontend.

---

## 🔍 Smart Contract Architecture

### Contracts Overview

Runera menggunakan **6 smart contracts** yang saling terintegrasi:

1. **RuneraAccessControl** - Role-based access control
2. **RuneraProfileDynamicNFT** - User profile NFT (soulbound)
3. **RuneraAchievementDynamicNFT** - Achievement badges NFT
4. **RuneraCosmeticNFT** - Cosmetic items (marketplace)
5. **RuneraEventRegistry** - Event management
6. **RuneraMarketplace** - NFT marketplace

---

## 1️⃣ RuneraAccessControl

### Purpose
Mengelola role-based permissions untuk semua contracts.

### Roles
```solidity
- DEFAULT_ADMIN_ROLE: Super admin
- ADMIN_ROLE: Admin operations
- BACKEND_SIGNER_ROLE: Backend signature verification
- EVENT_MANAGER_ROLE: Event creation/management
```

### Key Functions

#### Check Roles
```typescript
// Check if address has admin role
isAdmin(address: string): Promise<boolean>

// Check if address is backend signer
isBackendSigner(address: string): Promise<boolean>

// Check if address is event manager
isEventManager(address: string): Promise<boolean>
```

### Frontend Integration
**Not needed** - This is for backend/admin only.

---

## 2️⃣ RuneraProfileDynamicNFT ⭐ IMPORTANT

### Purpose
User profile sebagai **soulbound NFT** (tidak bisa ditransfer). Menyimpan stats dan tier user.

### Profile Tiers
```typescript
enum Tier {
  BRONZE = 1,   // Default
  SILVER = 2,   // 50km total
  GOLD = 3,     // 200km total
  PLATINUM = 4, // 500km total
  DIAMOND = 5   // 1000km total
}
```

### Profile Stats Structure
```typescript
interface ProfileStats {
  totalDistance: bigint;      // Total distance in meters
  totalActivities: bigint;    // Total number of activities
  totalDuration: bigint;      // Total duration in seconds
  currentStreak: bigint;      // Current daily streak
  longestStreak: bigint;      // Longest streak achieved
  lastActivityTimestamp: bigint; // Last activity timestamp
}

interface ProfileData {
  tier: number;               // Current tier (1-5)
  stats: ProfileStats;
  registeredAt: bigint;       // Registration timestamp
  tokenId: bigint;            // NFT token ID
}
```

### Key Functions

#### Register Profile
```typescript
// Register new user profile (mint soulbound NFT)
register(): Promise<void>

// Check if user has profile
hasProfile(address: string): Promise<boolean>

// Get user profile data
getProfile(address: string): Promise<ProfileData>

// Get user tier
getProfileTier(address: string): Promise<number>
```

#### Update Stats (Backend Signed)
```typescript
// Update user stats with backend signature
updateStats(
  user: string,
  stats: ProfileStats,
  deadline: bigint,
  signature: string
): Promise<void>
```

**Signature Required**: Backend must sign the stats update to prevent cheating.

### Frontend Integration Priority: **HIGH** ⭐

**Use Cases**:
1. Register user saat first login
2. Display user tier di profile page
3. Show stats (total distance, activities, streaks)
4. Track tier progression

---

## 3️⃣ RuneraAchievementDynamicNFT

### Purpose
Achievement badges sebagai NFT. User bisa claim achievements berdasarkan aktivitas mereka.

### Achievement Structure
```typescript
interface AchievementData {
  achievementId: bytes32;     // Unique achievement ID
  tier: number;               // Achievement tier (1-5)
  claimedAt: bigint;          // Claim timestamp
  tokenId: bigint;            // NFT token ID
}
```

### Achievement Tiers
```typescript
enum AchievementTier {
  BRONZE = 1,
  SILVER = 2,
  GOLD = 3,
  PLATINUM = 4,
  DIAMOND = 5
}
```

### Key Functions

#### Claim Achievement
```typescript
// Claim achievement with backend signature
claim(
  user: string,
  achievementId: bytes32,
  tier: number,
  nonce: bytes32,
  deadline: bigint,
  signature: string
): Promise<void>

// Check if user has achievement
hasAchievement(user: string, achievementId: bytes32): Promise<boolean>

// Get user's achievements
getUserAchievements(user: string): Promise<bytes32[]>

// Get achievement details
getAchievement(user: string, achievementId: bytes32): Promise<AchievementData>

// Get achievement count
getUserAchievementCount(user: string): Promise<bigint>
```

### Frontend Integration Priority: **MEDIUM**

**Use Cases**:
1. Display achievement badges di profile
2. Show achievement progress
3. Claim achievements dengan signature
4. Achievement notifications

---

## 4️⃣ RuneraCosmeticNFT

### Purpose
Cosmetic items (skins) untuk profile customization. Bisa di-equip dan di-trade di marketplace.

### Cosmetic Categories
```typescript
enum Category {
  FRAME = 0,      // Profile frame/border
  BACKGROUND = 1, // Profile background
  TITLE = 2,      // Profile title
  BADGE = 3       // Profile badge
}
```

### Rarity Levels
```typescript
enum Rarity {
  COMMON = 0,
  RARE = 1,
  EPIC = 2,
  LEGENDARY = 3
}
```

### Cosmetic Item Structure
```typescript
interface CosmeticItem {
  itemId: bigint;
  name: string;
  category: Category;
  rarity: Rarity;
  requiredTier: bytes32;      // Required profile tier
  maxSupply: number;
  currentSupply: number;
  tierRequirement: number;    // Tier level required (1-5)
}
```

### Key Functions

#### Item Management
```typescript
// Get item details
getItem(itemId: bigint): Promise<CosmeticItem>

// Check if item exists
itemExists(itemId: bigint): Promise<boolean>

// Mint item to user (admin/marketplace only)
mintItem(to: string, itemId: bigint, amount: bigint): Promise<void>
```

#### Equip System
```typescript
// Equip item to profile
equipItem(category: Category, itemId: bigint): Promise<void>

// Unequip item
unequipItem(category: Category): Promise<void>

// Get equipped item for category
getEquipped(user: string, category: Category): Promise<bigint>

// Get all equipped items
getAllEquipped(user: string): Promise<[bigint, bigint, bigint, bigint]>
```

### Frontend Integration Priority: **HIGH** ⭐

**Use Cases**:
1. Display owned cosmetics di market page
2. Equip/unequip items
3. Show equipped items di profile
4. Preview cosmetics before buying

---

## 5️⃣ RuneraEventRegistry

### Purpose
Mengelola running events (challenges, competitions).

### Event Structure
```typescript
interface EventConfig {
  eventId: bytes32;
  name: string;
  startTime: bigint;
  endTime: bigint;
  maxParticipants: bigint;
  currentParticipants: bigint;
  isActive: boolean;
}
```

### Key Functions

#### Event Management
```typescript
// Create event (event manager only)
createEvent(
  eventId: bytes32,
  name: string,
  startTime: bigint,
  endTime: bigint,
  maxParticipants: bigint
): Promise<void>

// Update event
updateEvent(
  eventId: bytes32,
  name: string,
  startTime: bigint,
  endTime: bigint,
  maxParticipants: bigint,
  isActive: boolean
): Promise<void>

// Get event details
getEvent(eventId: bytes32): Promise<EventConfig>

// Check if event exists
eventExists(eventId: bytes32): Promise<boolean>

// Check if event is active
isEventActive(eventId: bytes32): Promise<boolean>

// Get total event count
getEventCount(): Promise<bigint>

// Get event ID by index
getEventIdByIndex(index: bigint): Promise<bytes32>

// Increment participants (when user joins)
incrementParticipants(eventId: bytes32): Promise<void>
```

### Frontend Integration Priority: **MEDIUM**

**Use Cases**:
1. Display available events
2. Show event details (time, participants)
3. Join event functionality
4. Event countdown timer

---

## 6️⃣ RuneraMarketplace

### Purpose
Marketplace untuk trading cosmetic NFTs.

### Listing Structure
```typescript
interface Listing {
  listingId: bigint;
  seller: string;
  itemId: bigint;
  amount: bigint;
  pricePerItem: bigint;
  isActive: boolean;
  createdAt: bigint;
}
```

### Key Functions

#### Create & Manage Listings
```typescript
// Create listing
createListing(
  itemId: bigint,
  amount: bigint,
  pricePerItem: bigint
): Promise<bigint> // Returns listingId

// Cancel listing
cancelListing(listingId: bigint): Promise<void>

// Get listing details
getListing(listingId: bigint): Promise<Listing>

// Get listings by seller
getListingsBySeller(seller: string): Promise<bigint[]>

// Get listings by item
getListingsByItem(itemId: bigint): Promise<bigint[]>
```

#### Buy Items
```typescript
// Buy item from listing
buyItem(listingId: bigint, amount: bigint): Promise<void>
// Must send ETH value = pricePerItem * amount
```

#### Platform Fees
```typescript
// Get platform fee (in basis points, e.g., 250 = 2.5%)
getPlatformFee(): Promise<bigint>

// Get accumulated fees
getAccumulatedFees(): Promise<bigint>

// Withdraw fees (admin only)
withdrawFees(recipient: string): Promise<void>
```

### Frontend Integration Priority: **HIGH** ⭐

**Use Cases**:
1. List cosmetics for sale
2. Browse marketplace listings
3. Buy cosmetics
4. Manage user's listings
5. Show platform fee

---

## 🔗 Contract Interactions Flow

### User Registration Flow
```
1. User logs in with Privy
   ↓
2. Check hasProfile(userAddress)
   ↓
3. If false → Call register()
   ↓
4. Profile NFT minted (tier: BRONZE)
   ↓
5. User can now use app
```

### Activity Recording Flow
```
1. User completes run (GPS tracking)
   ↓
2. Frontend sends data to backend
   ↓
3. Backend validates activity
   ↓
4. Backend signs stats update
   ↓
5. Frontend calls updateStats() with signature
   ↓
6. Profile stats updated on-chain
   ↓
7. Check if tier upgrade needed
   ↓
8. Check if achievements unlocked
```

### Cosmetic Purchase Flow
```
1. User browses marketplace
   ↓
2. Select item to buy
   ↓
3. Call buyItem() with ETH payment
   ↓
4. NFT transferred to user
   ↓
5. User can equip item
   ↓
6. Call equipItem()
   ↓
7. Item displayed on profile
```

---

## 🛠️ Frontend Integration Guide

### 1. Setup Wagmi & Viem

```typescript
// lib/contracts.ts
import { Address } from 'viem';

export const CONTRACTS = {
  AccessControl: '0x...' as Address,
  ProfileNFT: '0x...' as Address,
  AchievementNFT: '0x...' as Address,
  CosmeticNFT: '0x...' as Address,
  EventRegistry: '0x...' as Address,
  Marketplace: '0x...' as Address,
} as const;

// Import ABIs dari ABI2 (GUNAKAN INI!)
import ProfileABI from '@/ABI2/RuneraProfileABI.json';
import AchievementABI from '@/ABI2/RuneraAchievementABI.json';
import CosmeticABI from '@/ABI2/RuneraCosmeticNFTABI.json';
import EventABI from '@/ABI2/RuneraEventRegistryABI.json';
import MarketplaceABI from '@/ABI2/RuneraMarketplaceABI.json';

export const ABIS = {
  ProfileNFT: ProfileABI,
  AchievementNFT: AchievementABI,
  CosmeticNFT: CosmeticABI,
  EventRegistry: EventABI,
  Marketplace: MarketplaceABI,
} as const;
```

### 2. Create Contract Hooks

```typescript
// hooks/useProfile.ts
import { useReadContract, useWriteContract } from 'wagmi';
import { CONTRACTS, ABIS } from '@/lib/contracts';

export function useProfile(address?: Address) {
  // Read profile data
  const { data: profile } = useReadContract({
    address: CONTRACTS.ProfileNFT,
    abi: ABIS.ProfileNFT,
    functionName: 'getProfile',
    args: address ? [address] : undefined,
  });

  // Check if has profile
  const { data: hasProfile } = useReadContract({
    address: CONTRACTS.ProfileNFT,
    abi: ABIS.ProfileNFT,
    functionName: 'hasProfile',
    args: address ? [address] : undefined,
  });

  // Register profile
  const { writeContract: register } = useWriteContract();

  const registerProfile = () => {
    register({
      address: CONTRACTS.ProfileNFT,
      abi: ABIS.ProfileNFT,
      functionName: 'register',
    });
  };

  return {
    profile,
    hasProfile,
    registerProfile,
  };
}
```

### 3. Profile Registration Component

```typescript
// components/ProfileRegistration.tsx
'use client';

import { useAccount } from 'wagmi';
import { useProfile } from '@/hooks/useProfile';

export function ProfileRegistration() {
  const { address } = useAccount();
  const { hasProfile, registerProfile } = useProfile(address);

  if (hasProfile) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md">
        <h2 className="text-2xl font-bold mb-4">Create Your Profile</h2>
        <p className="text-gray-600 mb-6">
          Create your Runera profile to start tracking your runs and earning rewards!
        </p>
        <button
          onClick={registerProfile}
          className="w-full bg-blue-600 text-white py-3 rounded-full font-semibold"
        >
          Create Profile
        </button>
      </div>
    </div>
  );
}
```

### 4. Display Profile Stats

```typescript
// components/ProfileStats.tsx
'use client';

import { useAccount } from 'wagmi';
import { useProfile } from '@/hooks/useProfile';
import { formatUnits } from 'viem';

export function ProfileStats() {
  const { address } = useAccount();
  const { profile } = useProfile(address);

  if (!profile) return <div>Loading...</div>;

  const totalKm = Number(formatUnits(profile.stats.totalDistance, 3)); // meters to km
  const totalActivities = Number(profile.stats.totalActivities);
  const currentStreak = Number(profile.stats.currentStreak);

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white rounded-xl p-4">
        <div className="text-3xl font-bold">{totalKm.toFixed(1)}</div>
        <div className="text-sm text-gray-500">Total KM</div>
      </div>
      <div className="bg-white rounded-xl p-4">
        <div className="text-3xl font-bold">{totalActivities}</div>
        <div className="text-sm text-gray-500">Activities</div>
      </div>
      <div className="bg-white rounded-xl p-4">
        <div className="text-3xl font-bold">{currentStreak}</div>
        <div className="text-sm text-gray-500">Day Streak</div>
      </div>
    </div>
  );
}
```

---

## 🔐 Backend Signature System

### Why Signatures?
Untuk prevent cheating, stats updates dan achievement claims harus di-sign oleh backend setelah validasi.

### Signature Flow

```typescript
// Backend (Node.js)
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

const account = privateKeyToAccount(process.env.BACKEND_PRIVATE_KEY);
const client = createWalletClient({
  account,
  chain: base,
  transport: http(),
});

// Sign stats update
async function signStatsUpdate(
  userAddress: string,
  stats: ProfileStats,
  deadline: bigint
) {
  const domain = {
    name: 'RuneraProfile',
    version: '1',
    chainId: base.id,
    verifyingContract: CONTRACTS.ProfileNFT,
  };

  const types = {
    StatsUpdate: [
      { name: 'user', type: 'address' },
      { name: 'totalDistance', type: 'uint256' },
      { name: 'totalActivities', type: 'uint256' },
      { name: 'totalDuration', type: 'uint256' },
      { name: 'currentStreak', type: 'uint256' },
      { name: 'longestStreak', type: 'uint256' },
      { name: 'lastActivityTimestamp', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
  };

  const message = {
    user: userAddress,
    ...stats,
    deadline,
  };

  const signature = await client.signTypedData({
    domain,
    types,
    primaryType: 'StatsUpdate',
    message,
  });

  return signature;
}
```

### Frontend Usage

```typescript
// After activity completion
const updateUserStats = async (activityData) => {
  // 1. Send activity to backend for validation
  const response = await fetch('/api/activities/validate', {
    method: 'POST',
    body: JSON.stringify(activityData),
  });

  const { stats, deadline, signature } = await response.json();

  // 2. Call smart contract with signature
  await updateStats({
    address: CONTRACTS.ProfileNFT,
    abi: ABIS.ProfileNFT,
    functionName: 'updateStats',
    args: [userAddress, stats, deadline, signature],
  });
};
```

---

## 📊 Priority Implementation Order

### Phase 1: Profile System (Week 1) ⭐
1. Setup wagmi & contract configs
2. Profile registration flow
3. Display profile stats
4. Tier display & progression

### Phase 2: Cosmetics & Marketplace (Week 2) ⭐
1. Display owned cosmetics
2. Equip/unequip system
3. Marketplace browsing
4. Buy cosmetics

### Phase 3: Achievements (Week 3)
1. Display achievements
2. Achievement claiming
3. Achievement notifications

### Phase 4: Events (Week 4)
1. Display events
2. Join event functionality
3. Event leaderboard

---

## 🔑 Required Environment Variables

```bash
# Contract Addresses (Base Mainnet)
NEXT_PUBLIC_CONTRACT_ACCESS_CONTROL=0x...
NEXT_PUBLIC_CONTRACT_PROFILE_NFT=0x...
NEXT_PUBLIC_CONTRACT_ACHIEVEMENT_NFT=0x...
NEXT_PUBLIC_CONTRACT_COSMETIC_NFT=0x...
NEXT_PUBLIC_CONTRACT_EVENT_REGISTRY=0x...
NEXT_PUBLIC_CONTRACT_MARKETPLACE=0x...

# Backend Signer (Server-side only)
BACKEND_PRIVATE_KEY=0x...
BACKEND_SIGNER_ADDRESS=0x...
```

---

## 🎯 Next Steps

1. **Get Contract Addresses** - Deploy contracts atau dapatkan addresses dari team
2. **Update Privy Config** - Add wagmi connector
3. **Create Contract Hooks** - Build reusable hooks
4. **Implement Profile Registration** - First user interaction
5. **Build Profile Stats Display** - Show on-chain data
6. **Add Cosmetics System** - Marketplace integration

---

**Last Updated**: January 29, 2025  
**Status**: Ready for Integration  
**Priority**: Start with Profile System (Phase 1)
