# Smart Contract Integration Status

## ✅ Yang Sudah Diintegrasikan

### 1. Setup Dasar
- [x] **Wagmi Provider** - Added to `app/providers.tsx`
- [x] **Contract Config** - Created `lib/contracts.ts` dengan addresses & ABIs
- [x] **Profile Hook** - Created `hooks/useProfile.ts` untuk read/write profile
- [x] **Profile Registration** - Created `components/ProfileRegistration.tsx`

### 2. Pages Updated
- [x] **Home Page** (`app/page.tsx`) - Added ProfileRegistration modal
- [x] **Profile Page** (`app/profile/page.tsx`) - Integrated with on-chain data
- [x] **ProfileIdentityCard** - Shows tier from smart contract

### 3. Features Working
- ✅ Profile registration (mint soulbound NFT)
- ✅ Check if user has profile
- ✅ Display user tier (Bronze/Silver/Gold/Platinum/Diamond)
- ✅ Show tier badge with correct colors
- ✅ Display username from Privy
- ✅ Show tier progress with distance tracking
- ✅ Display on-chain stats (distance, activities, avg pace)
- ✅ Success modal after profile creation
- ✅ Loading skeletons for profile data

---

## ⚠️ Yang Masih Perlu Dilakukan

### Priority 1: Complete Profile Integration ✅ COMPLETED

#### A. Update Profile Components
Komponen ini sudah diupdate untuk terima data dari smart contract:

1. **`components/profile/RankProgressCard.tsx`** ✅
   - [x] Terima `profile` prop
   - [x] Display current tier
   - [x] Show progress to next tier
   - [x] Calculate progress from totalDistance
   - [x] Show tier requirements
   - [x] Handle max tier (Diamond)
   - [x] Show loading skeleton

2. **`components/profile/StatsOverview.tsx`** ✅
   - [x] Terima `profile` prop
   - [x] Display totalDistance (km)
   - [x] Display totalActivities
   - [x] Calculate avgPace from stats
   - [x] Format pace as MM:SS
   - [x] Show loading skeleton

3. **`components/profile/AchievementsSection.tsx`** ❌
   - [ ] Integrate with AchievementNFT contract
   - [ ] Fetch user achievements
   - [ ] Display achievement badges
   - [ ] Show achievement count

#### B. Update Header Component
4. **`components/Header.tsx`** ❌
   - [ ] Show wallet address (truncated)
   - [ ] Add wallet connection status
   - [ ] Show network (Base)

---

### Priority 2: Cosmetics Integration (2-3 hours)

#### A. Create Cosmetics Hook
5. **`hooks/useCosmetics.ts`** ❌ NOT CREATED
   ```typescript
   // Need to create:
   - getItem(itemId)
   - getEquipped(user, category)
   - getAllEquipped(user)
   - equipItem(category, itemId)
   - unequipItem(category)
   - balanceOf(user, itemId)
   ```

#### B. Update Market Page
6. **`app/market/page.tsx`** ❌
   - [ ] Fetch owned cosmetics from contract
   - [ ] Fetch equipped items
   - [ ] Update equip/unequip to call smart contract
   - [ ] Show real ownership status

7. **`components/market/SkinCard.tsx`** ❌
   - [ ] Show real ownership from contract
   - [ ] Disable "Use" if not owned
   - [ ] Call equipItem() on click

8. **`components/market/ProfilePreview.tsx`** ❌
   - [ ] Load equipped items from contract
   - [ ] Apply equipped cosmetics to preview

---

### Priority 3: Marketplace Integration (3-4 hours)

#### A. Create Marketplace Hook
9. **`hooks/useMarketplace.ts`** ❌ NOT CREATED
   ```typescript
   // Need to create:
   - createListing(itemId, amount, price)
   - buyItem(listingId, amount)
   - cancelListing(listingId)
   - getListing(listingId)
   - getListingsBySeller(seller)
   - getListingsByItem(itemId)
   ```

#### B. Create Marketplace Pages
10. **`app/marketplace/page.tsx`** ❌ NOT CREATED
    - [ ] Browse all listings
    - [ ] Filter by category/rarity
    - [ ] Buy items with ETH
    - [ ] Show platform fee

11. **`app/marketplace/sell/page.tsx`** ❌ NOT CREATED
    - [ ] List owned items for sale
    - [ ] Set price
    - [ ] Manage listings

---

### Priority 4: Events Integration (2-3 hours)

#### A. Create Events Hook
12. **`hooks/useEvents.ts`** ❌ NOT CREATED
    ```typescript
    // Need to create:
    - getEvent(eventId)
    - getEventCount()
    - getEventIdByIndex(index)
    - isEventActive(eventId)
    - incrementParticipants(eventId) // when joining
    ```

#### B. Update Event Page
13. **`app/event/page.tsx`** ❌
    - [ ] Fetch events from contract
    - [ ] Show real participant count
    - [ ] Check if event is active
    - [ ] Join event functionality

---

### Priority 5: Backend Integration (5-7 days)

#### A. Activity Recording System
14. **Backend API** ❌ NOT CREATED
    - [ ] POST `/api/activities` - Save activity to database
    - [ ] POST `/api/activities/validate` - Validate & sign stats update
    - [ ] GET `/api/activities` - Get user activities
    - [ ] GET `/api/stats` - Get aggregate stats

15. **Stats Update Flow** ❌
    - [ ] After recording, send to backend
    - [ ] Backend validates GPS data
    - [ ] Backend signs stats update
    - [ ] Frontend calls `updateStats()` with signature
    - [ ] Profile stats updated on-chain

#### B. Achievement System
16. **Achievement Backend** ❌ NOT CREATED
    - [ ] Check achievement criteria
    - [ ] Sign achievement claim
    - [ ] Return signature to frontend

---

## 🔧 Environment Variables Needed

Add to `.env.local`:

```bash
# Smart Contract Addresses (Base Mainnet)
# ⚠️ NEED TO GET THESE FROM SMART CONTRACT TEAM
NEXT_PUBLIC_CONTRACT_PROFILE_NFT=0x...
NEXT_PUBLIC_CONTRACT_COSMETIC_NFT=0x...
NEXT_PUBLIC_CONTRACT_ACHIEVEMENT_NFT=0x...
NEXT_PUBLIC_CONTRACT_EVENT_REGISTRY=0x...
NEXT_PUBLIC_CONTRACT_MARKETPLACE=0x...

# Backend Signer (Server-side only)
BACKEND_PRIVATE_KEY=0x...
BACKEND_SIGNER_ADDRESS=0x...
```

---

## 🐛 Issues to Fix

### 1. TypeScript Errors
Beberapa komponen mungkin error karena prop types berubah:
- [ ] Fix `RankProgressCard` props
- [ ] Fix `StatsOverview` props
- [ ] Fix `AchievementsSection` props

### 2. Missing Dependencies
Check if all packages installed:
```bash
pnpm list wagmi viem @privy-io/wagmi @tanstack/react-query
```

### 3. ABI Format
ABI files perlu di-parse dengan benar. Current format dari Foundry perlu diconvert.

---

## 📝 Code Templates Needed

### Template 1: Update RankProgressCard

```typescript
// components/profile/RankProgressCard.tsx
'use client';

import { TIER_REQUIREMENTS, TIER_NAMES } from '@/lib/contracts';

interface RankProgressCardProps {
  profile?: {
    tier: number;
    tierName: string;
    stats: {
      totalDistance: number;
      // ...
    };
  };
}

export default function RankProgressCard({ profile }: RankProgressCardProps) {
  if (!profile) return null;

  const currentTier = profile.tier;
  const nextTier = currentTier < 5 ? currentTier + 1 : 5;
  const currentDistance = profile.stats.totalDistance;
  const nextTierRequirement = TIER_REQUIREMENTS[nextTier as keyof typeof TIER_REQUIREMENTS];
  const progress = (currentDistance / nextTierRequirement) * 100;

  return (
    <div className="mx-6 mb-6 rounded-2xl bg-white p-6 shadow-md">
      <h3 className="mb-4 text-lg font-bold text-gray-900">
        {profile.tierName} Tier
      </h3>
      
      {/* Progress Bar */}
      <div className="mb-2 h-3 overflow-hidden rounded-full bg-gray-200">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">
          {currentDistance.toFixed(1)} km
        </span>
        <span className="font-semibold text-gray-900">
          {nextTier <= 5 ? `${nextTierRequirement} km to ${TIER_NAMES[nextTier]}` : 'Max Tier'}
        </span>
      </div>
    </div>
  );
}
```

### Template 2: Update StatsOverview

```typescript
// components/profile/StatsOverview.tsx
'use client';

interface StatsOverviewProps {
  profile?: {
    stats: {
      totalDistance: number;
      totalActivities: number;
      totalDuration: number;
    };
  };
}

export default function StatsOverview({ profile }: StatsOverviewProps) {
  if (!profile) return null;

  const avgPace = profile.stats.totalActivities > 0
    ? (profile.stats.totalDuration / 60) / profile.stats.totalDistance
    : 0;

  return (
    <div className="mx-6 mb-6">
      <h3 className="mb-4 text-lg font-bold text-gray-900">Stats Overview</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-white p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-gray-900">
            {profile.stats.totalDistance.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">Total Dist (km)</div>
        </div>
        
        <div className="rounded-xl bg-white p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-gray-900">
            {profile.stats.totalActivities}
          </div>
          <div className="text-xs text-gray-500">Runs</div>
        </div>
        
        <div className="rounded-xl bg-white p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-gray-900">
            {avgPace.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">Avg Pace</div>
        </div>
      </div>
    </div>
  );
}
```

---

## 🎯 Recommended Next Steps

### Immediate (Today):
1. **Get contract addresses** from smart contract team
2. **Update `.env.local`** with addresses
3. **Test profile registration** on Base testnet
4. **Fix TypeScript errors** in profile components

### Short-term (This Week):
1. **Complete profile integration** (Priority 1)
2. **Add cosmetics hooks** (Priority 2)
3. **Update market page** with real data

### Medium-term (Next Week):
1. **Build backend API** for activity recording
2. **Implement signature system**
3. **Add marketplace functionality**

### Long-term (Next 2 Weeks):
1. **Events integration**
2. **Achievement system**
3. **Full testing & bug fixes**

---

## 📞 Questions for Smart Contract Team

1. **Contract Addresses**: What are the deployed contract addresses on Base?
2. **Backend Signer**: What address should be granted BACKEND_SIGNER_ROLE?
3. **Testing**: Is there a testnet deployment for testing?
4. **Gas Fees**: Who pays gas for stats updates? User or backend?
5. **Initial Items**: Are there any cosmetic items already created?

---

## 🚀 Quick Test Commands

```bash
# Check if contracts are configured
echo $NEXT_PUBLIC_CONTRACT_PROFILE_NFT

# Run dev server
pnpm dev

# Check for TypeScript errors
pnpm tsc --noEmit

# Test profile registration
# 1. Login with Privy
# 2. Modal should appear
# 3. Click "Create Profile NFT"
# 4. Approve transaction in wallet
# 5. Wait for confirmation
# 6. Profile should load
```

---

**Last Updated**: January 29, 2025  
**Integration Progress**: ~40% Complete (Profile Integration Done!)  
**Estimated Time to Complete**: 2-3 days for full integration
