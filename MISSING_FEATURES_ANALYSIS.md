# 🔍 Missing Features Analysis - ABI2 vs Frontend

## 📊 Overview

**Last Updated**: After ABI2 migration complete

Analisis fitur-fitur yang tersedia di smart contract (ABI2) tapi belum diimplementasikan di frontend.

**Current Status**: Frontend uses dummy data for Events, Cosmetics, and Achievements. Profile integration is working with real contract data.

---

## 1. 👤 Profile System (RuneraProfileABI.json)

### ✅ Already Implemented:
- ✅ `hasProfile(address)` - Check if user has profile
- ✅ `getProfile(address)` - Get profile data (NEW ABI2 structure)
- ✅ `register()` - Create profile
- ✅ `getProfileTier(address)` - Get user tier
- ✅ `balanceOf(address, id)` - Check NFT balance
- ✅ Profile display with XP, level, tier, stats
- ✅ Tier calculation based on level

### ❌ NOT Implemented Yet:

#### 1.1 **Update Stats Function**
```typescript
updateStats(
  user: address,
  stats: ProfileStats,
  deadline: uint256,
  signature: bytes
)
```
**What it does**: Update user stats (xp, level, runCount, etc.) with backend signature
**Why needed**: To update profile after completing activities
**Priority**: 🔴 HIGH - Critical for activity tracking

**Implementation needed**:
- Backend API to generate signature
- Frontend function to call updateStats after activity
- UI feedback for stats update

#### 1.2 **Get Nonce Function**
```typescript
getNonce(user: address) → uint256
```
**What it does**: Get current nonce for signature verification
**Why needed**: Required for updateStats signature
**Priority**: 🟡 MEDIUM - Needed with updateStats

#### 1.3 **Tier Constants**
```typescript
TIER_BRONZE_VALUE() → uint8
TIER_SILVER_VALUE() → uint8
TIER_GOLD_VALUE() → uint8
TIER_PLATINUM_VALUE() → uint8
TIER_DIAMOND_VALUE() → uint8
TIER_BRONZE/SILVER/GOLD/PLATINUM/DIAMOND() → uint16
```
**What it does**: Get tier thresholds from contract
**Why needed**: Dynamic tier calculation instead of hardcoded
**Priority**: 🟢 LOW - Nice to have, currently using hardcoded values

---

## 2. 🏆 Achievement System (RuneraAchievementABI.json)

### ✅ Already Implemented:
- ✅ Achievement display with dummy data (17 achievements)
- ✅ Achievement progress tracking (frontend only)
- ✅ Achievement categories (Distance, Streak, Speed, Activities, Special)
- ✅ Achievement tiers (Bronze, Silver, Gold, Platinum, Diamond)
- ✅ XP reward system
- ✅ Achievement card component with 3 sizes

### ❌ NOT Implemented Yet:

#### 2.1 **Claim Achievement**
```typescript
claim(
  to: address,
  eventId: bytes32,
  tier: uint8,
  metadataHash: bytes32,
  deadline: uint256,
  signature: bytes
)
```
**What it does**: Claim achievement NFT with backend signature
**Why needed**: To mint achievement NFT when user completes achievement
**Priority**: 🔴 HIGH - Core achievement feature

**Implementation needed**:
- Backend API to verify achievement and generate signature
- Frontend "Claim" button on unlocked achievements
- Transaction flow with loading states
- Success notification

#### 2.2 **Get User Achievements**
```typescript
getUserAchievements(user: address) → bytes32[]
getUserAchievementCount(user: address) → uint256
hasAchievement(user: address, eventId: bytes32) → bool
getAchievement(user: address, eventId: bytes32) → AchievementData
```
**What it does**: Fetch user's claimed achievements from contract
**Why needed**: Display real achievements instead of dummy data
**Priority**: 🔴 HIGH - Replace dummy data

**Implementation needed**:
- Update `useAchievements` hook to fetch from contract
- Display claimed achievements with real data
- Show achievement NFT metadata

#### 2.3 **Get Achievement by Token ID**
```typescript
getAchievementByTokenId(tokenId: uint256) → AchievementData
getAchievementTokenId(user: address, eventId: bytes32) → uint256
```
**What it does**: Get achievement data by token ID
**Why needed**: Display achievement details in NFT gallery
**Priority**: 🟡 MEDIUM - For achievement gallery feature

---

## 3. 🎨 Cosmetic System (RuneraCosmeticNFTABI.json)

### ✅ Already Implemented:
- ✅ `getEquipped(user, category)` - Get equipped item
- ✅ `equipItem(category, itemId)` - Equip cosmetic
- ✅ `unequipItem(category)` - Unequip cosmetic
- ✅ `balanceOf(account, id)` - Check ownership
- ✅ Cosmetic display with dummy data (8 items)
- ✅ Category filtering (Frame, Background, Title, Badge)
- ✅ Rarity system (Common, Rare, Epic, Legendary)
- ✅ Equip/unequip UI with transaction handling

### ❌ NOT Implemented Yet:

#### 3.1 **Get Item Details**
```typescript
getItem(itemId: uint256) → CosmeticItem
itemExists(itemId: uint256) → bool
```
**What it does**: Get cosmetic item metadata from contract
**Why needed**: Display real item data instead of dummy data
**Priority**: 🔴 HIGH - Replace dummy cosmetic data

**Implementation needed**:
- Fetch item details from contract
- Display item name, category, rarity, tier requirement
- Show IPFS metadata (image, description)

#### 3.2 **Get All Equipped Items**
```typescript
getAllEquipped(user: address) → uint256[4]
```
**What it does**: Get all equipped items at once (Frame, Background, Title, Badge)
**Why needed**: More efficient than calling getEquipped 4 times
**Priority**: 🟡 MEDIUM - Performance optimization

**Implementation needed**:
- Update `useCosmetics` hook to use getAllEquipped
- Display all equipped items on profile

#### 3.3 **Mint Item** (Admin only)
```typescript
mintItem(to: address, itemId: uint256, amount: uint256)
```
**What it does**: Mint cosmetic items to user
**Why needed**: For rewards, purchases, or airdrops
**Priority**: 🟢 LOW - Admin function, not for regular users

#### 3.4 **Create Item** (Admin only)
```typescript
createItem(
  itemId: uint256,
  name: string,
  category: Category,
  rarity: Rarity,
  ipfsHash: bytes32,
  maxSupply: uint32,
  minTierRequired: uint8
)
```
**What it does**: Create new cosmetic items
**Why needed**: Admin panel to add new cosmetics
**Priority**: 🟢 LOW - Admin function

---

## 4. 📅 Event System (RuneraEventRegistryABI.json)

### ✅ Already Implemented:
- ✅ Event display with dummy data (3 events)
- ✅ Event status calculation (upcoming, active, ended)
- ✅ Participant tracking with percentage
- ✅ Event card component with countdown
- ⚠️ `getEvent(eventId)` - Available but not used yet
- ⚠️ `getEventCount()` - Available but not used yet
- ⚠️ `isEventActive(eventId)` - Available but not used yet

### ❌ NOT Implemented Yet:

#### 4.1 **Fetch Real Events**
```typescript
getEventCount() → uint256
getEventIdByIndex(index: uint256) → bytes32
getEvent(eventId: bytes32) → EventConfig
```
**What it does**: Fetch all events from contract
**Why needed**: Display real events instead of dummy data
**Priority**: 🔴 HIGH - Replace dummy event data

**Implementation needed**:
- Loop through all events using getEventCount and getEventIdByIndex
- Fetch event details with getEvent
- Display real event data on event page

#### 4.2 **Increment Participants** (Backend only)
```typescript
incrementParticipants(eventId: bytes32)
```
**What it does**: Increment participant count when user joins
**Why needed**: Track event participants
**Priority**: 🟡 MEDIUM - Backend integration needed

#### 4.3 **Create/Update Event** (Admin only)
```typescript
createEvent(eventId, name, startTime, endTime, maxParticipants)
updateEvent(eventId, name, startTime, endTime, maxParticipants, active)
```
**What it does**: Create and manage events
**Why needed**: Admin panel to manage events
**Priority**: 🟢 LOW - Admin function

---

## 5. 🛒 Marketplace System (RuneraMarketplaceABI.json)

### ✅ Already Implemented:
- ✅ Market page UI with cosmetic preview
- ✅ Profile preview with equipped cosmetics
- ✅ Skin collection display
- ⚠️ All data is dummy - no contract integration yet

### ❌ NOT Implemented Yet:

#### 5.1 **Create Listing**
```typescript
createListing(
  itemId: uint256,
  amount: uint256,
  pricePerUnit: uint256
) → uint256 listingId
```
**What it does**: List cosmetic item for sale
**Why needed**: Users can sell their cosmetics
**Priority**: 🟡 MEDIUM - Marketplace feature

**Implementation needed**:
- "Sell" button on owned cosmetics
- Form to set price and amount
- Transaction flow
- Listing confirmation

#### 5.2 **Buy Item**
```typescript
buyItem(listingId: uint256, amount: uint256) payable
```
**What it does**: Buy cosmetic from marketplace
**Why needed**: Users can buy cosmetics from others
**Priority**: 🟡 MEDIUM - Marketplace feature

**Implementation needed**:
- Browse marketplace listings
- "Buy" button with ETH payment
- Transaction flow
- Purchase confirmation

#### 5.3 **Get Listings**
```typescript
getListing(listingId: uint256) → Listing
getListingsByItem(itemId: uint256) → uint256[]
getListingsBySeller(seller: address) → uint256[]
```
**What it does**: Fetch marketplace listings
**Why needed**: Display items for sale
**Priority**: 🟡 MEDIUM - Marketplace feature

**Implementation needed**:
- Marketplace page to browse listings
- Filter by item, seller, price
- Sort by price, date

#### 5.4 **Cancel Listing**
```typescript
cancelListing(listingId: uint256)
```
**What it does**: Cancel own listing
**Why needed**: Users can remove their listings
**Priority**: 🟡 MEDIUM - Marketplace feature

#### 5.5 **Platform Fee**
```typescript
getPlatformFee() → uint256
getAccumulatedFees() → uint256
```
**What it does**: Get platform fee percentage and accumulated fees
**Why needed**: Display fee to users, admin can view earnings
**Priority**: 🟢 LOW - Info display

---

## 📊 Priority Summary

### 🔴 HIGH Priority (Must Have):

1. **Profile: updateStats()** - Update profile after activities
2. **Achievement: claim()** - Claim achievement NFTs
3. **Achievement: getUserAchievements()** - Display real achievements
4. **Cosmetic: getItem()** - Display real cosmetic data
5. **Event: Fetch real events** - Display real events from contract

### 🟡 MEDIUM Priority (Should Have):

6. **Profile: getNonce()** - For updateStats signature
7. **Achievement: getAchievementByTokenId()** - Achievement gallery
8. **Cosmetic: getAllEquipped()** - Performance optimization
9. **Event: incrementParticipants()** - Track participants
10. **Marketplace: All functions** - Buy/sell cosmetics

### 🟢 LOW Priority (Nice to Have):

11. **Profile: Tier constants** - Dynamic tier thresholds
12. **Cosmetic: Admin functions** - Create/mint items
13. **Event: Admin functions** - Create/update events
14. **Marketplace: Admin functions** - Manage fees

---

## 🎯 Implementation Roadmap

### Phase 1: Replace Dummy Data (Week 1)
**Goal**: Use real data from smart contracts

1. **Events Integration** (1 day)
   - Fetch events from contract
   - Display real event data
   - Update event status dynamically

2. **Cosmetics Integration** (1 day)
   - Fetch cosmetic items from contract
   - Display real item metadata
   - Show IPFS images

3. **Achievements Integration** (1 day)
   - Fetch user achievements from contract
   - Display claimed achievements
   - Show achievement progress

### Phase 2: Core Functionality (Week 2)
**Goal**: Implement critical user actions

4. **Update Stats** (2 days)
   - Backend API for signature generation
   - Frontend integration
   - Update profile after activities

5. **Claim Achievements** (2 days)
   - Backend API for achievement verification
   - Frontend claim flow
   - Transaction handling

6. **Profile Display** (1 day)
   - Show equipped cosmetics on profile
   - Display achievement badges
   - XP and level progress bars

### Phase 3: Marketplace (Week 3)
**Goal**: Enable buying and selling

7. **Marketplace Listings** (2 days)
   - Browse marketplace
   - Filter and sort listings
   - Display item details

8. **Buy/Sell Flow** (2 days)
   - Create listing form
   - Buy item with ETH
   - Transaction handling

9. **My Listings** (1 day)
   - View own listings
   - Cancel listings
   - Sales history

---

## 📝 Implementation Checklist

### Profile System:
- [ ] Implement updateStats() with backend signature
- [ ] Add getNonce() for signature verification
- [ ] Fetch tier constants from contract (optional)
- [ ] Show XP progress bar
- [ ] Show level badge
- [ ] Update stats after activity completion

### Achievement System:
- [ ] Implement claim() with backend signature
- [ ] Fetch getUserAchievements() from contract
- [ ] Replace dummy achievement data
- [ ] Add "Claim" button on unlocked achievements
- [ ] Show claimed achievement NFTs
- [ ] Achievement notification on unlock
- [ ] Achievement gallery page

### Cosmetic System:
- [ ] Fetch getItem() for all cosmetics
- [ ] Replace dummy cosmetic data
- [ ] Display IPFS metadata and images
- [ ] Implement getAllEquipped() for efficiency
- [ ] Show equipped cosmetics on profile card
- [ ] Visual preview of equipped items

### Event System:
- [ ] Fetch all events from contract
- [ ] Replace dummy event data
- [ ] Display real event details
- [ ] Implement join event flow (backend)
- [ ] Track participant count
- [ ] Event countdown timer
- [ ] Event completion status

### Marketplace System:
- [ ] Create `useMarketplace` hook
- [ ] Implement createListing()
- [ ] Implement buyItem()
- [ ] Fetch and display listings
- [ ] Filter by item/seller/price
- [ ] Sort by price/date
- [ ] Cancel listing functionality
- [ ] Display platform fee
- [ ] My listings page
- [ ] Purchase history

---

## 🎨 UI Components Needed

### New Components:
1. **ClaimAchievementButton** - Button to claim achievement with transaction flow
2. **UpdateStatsButton** - Button to sync stats with contract (admin/debug)
3. **MarketplaceListing** - Display marketplace listing card
4. **CreateListingModal** - Modal to create new listing
5. **BuyItemModal** - Modal to buy item with ETH payment
6. **MyListingsPage** - Page to manage user's listings
7. **XPProgressBar** - Show XP progress to next level
8. **LevelBadge** - Display user level badge
9. **EquippedCosmetics** - Show equipped items on profile
10. **AchievementGallery** - Grid view of all achievements

### Updated Components:
1. **AchievementsSection** - Add claim button, fetch real data
2. **ProfileIdentityCard** - Show equipped cosmetics
3. **MarketPage** - Add marketplace tab, fetch real items
4. **EventList** - Fetch real events, join flow
5. **StatsOverview** - Add XP and level display

---

## 🔧 Backend Requirements

### APIs Needed:
1. **POST /api/profile/update-stats** - Generate signature for updateStats
2. **POST /api/achievements/claim** - Verify and generate signature for claim
3. **POST /api/events/join** - Register user for event
4. **GET /api/cosmetics/metadata/:itemId** - Get IPFS metadata
5. **GET /api/marketplace/listings** - Get all active listings

### Signature Generation:
- EIP-712 typed data signing
- Nonce management
- Deadline validation
- Signer verification

---

## 📊 Estimated Completion Time

**Total**: 3-4 weeks

- **Phase 1** (Replace Dummy Data): 3 days
- **Phase 2** (Core Functionality): 5 days
- **Phase 3** (Marketplace): 5 days
- **Testing & Polish**: 3-5 days

**Current Progress**: 90% (UI complete, smart contract integration partial)
**After Implementation**: 100% (Full MVP with all features)

---

## 🎯 Recommendation

**Start with Phase 1** - Replace dummy data with real contract data. This will:
- Make the app feel more real
- Test contract integration
- Identify any ABI issues early
- Provide foundation for Phase 2

**Priority Order**:
1. Events (easiest, read-only)
2. Cosmetics (medium, read + equip)
3. Achievements (complex, requires backend)
4. Profile Stats (complex, requires backend)
5. Marketplace (optional, can be Phase 3)

---

**Ready to implement? Let's start with Phase 1!** 🚀
