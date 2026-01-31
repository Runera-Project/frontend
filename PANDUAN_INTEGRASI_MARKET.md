# 🛒 Panduan Integrasi Market dengan Smart Contract

**Untuk**: Mengubah Market dari dummy data ke data real dari smart contract

---

## 📋 Yang Perlu Diganti

### 1. **File yang Perlu Diubah**:
- ✅ `hooks/useCosmetics.ts` - Ganti dummy data dengan data real dari contract
- ✅ `lib/contracts.ts` - Tambah address Marketplace contract
- ✅ Buat `hooks/useMarketplace.ts` - Hook baru untuk marketplace
- ✅ `app/market/page.tsx` - Update untuk support marketplace listings
- ✅ `components/market/SkinCard.tsx` - Tambah tombol "Buy" untuk item di store

---

## 🔧 Langkah 1: Update `lib/contracts.ts`

Tambahkan address Marketplace contract:

```typescript
// Di lib/contracts.ts
import MarketplaceABI from '@/ABI2/RuneraMarketplaceABI.json';

export const CONTRACTS = {
  ProfileNFT: '0xa26dD3dbD2d2D08a2AAb43B638643dDd1Ec55321' as Address,
  AchievementNFT: '0x...' as Address, // Isi dengan address yang benar
  CosmeticNFT: '0x...' as Address, // Isi dengan address yang benar
  EventRegistry: '0x...' as Address, // Isi dengan address yang benar
  Marketplace: '0x...' as Address, // TAMBAHKAN INI - address marketplace contract
};

export const ABIS = {
  ProfileNFT: ProfileABI,
  AchievementNFT: AchievementABI,
  CosmeticNFT: CosmeticABI,
  EventRegistry: EventABI,
  Marketplace: MarketplaceABI, // TAMBAHKAN INI
};
```

---

## 🔧 Langkah 2: Update `hooks/useCosmetics.ts`

Ganti dummy data dengan data real dari contract:

```typescript
// Di hooks/useCosmetics.ts

export function useCosmetics() {
  const { address } = useAccount();
  const [cosmetics, setCosmetics] = useState<CosmeticItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // TAMBAHKAN: Daftar item ID yang ada di contract
  // Ini bisa didapat dari backend atau hardcode dulu
  const ITEM_IDS = [1, 2, 3, 4, 5, 6, 7, 8]; // Sesuaikan dengan item yang ada

  // Get equipped items (sudah ada)
  const { data: equippedFrame } = useReadContract({...});
  const { data: equippedBackground } = useReadContract({...});
  const { data: equippedTitle } = useReadContract({...});
  const { data: equippedBadge } = useReadContract({...});

  useEffect(() => {
    async function fetchCosmetics() {
      if (!address) {
        setIsLoading(false);
        return;
      }

      const items: CosmeticItem[] = [];

      // Loop semua item ID dan ambil data dari contract
      for (const itemId of ITEM_IDS) {
        try {
          // 1. Ambil data item dari contract
          const itemData = await readContract({
            address: CONTRACTS.CosmeticNFT,
            abi: ABIS.CosmeticNFT,
            functionName: 'getItem',
            args: [BigInt(itemId)],
          });

          if (!itemData.exists) continue;

          // 2. Cek kepemilikan user
          const balance = await readContract({
            address: CONTRACTS.CosmeticNFT,
            abi: ABIS.CosmeticNFT,
            functionName: 'balanceOf',
            args: [address, BigInt(itemId)],
          });

          const owned = balance > 0n;

          // 3. Cek apakah item ini sedang di-equip
          const equipped = 
            (itemData.category === CosmeticCategory.FRAME && equippedFrame === BigInt(itemId)) ||
            (itemData.category === CosmeticCategory.BACKGROUND && equippedBackground === BigInt(itemId)) ||
            (itemData.category === CosmeticCategory.TITLE && equippedTitle === BigInt(itemId)) ||
            (itemData.category === CosmeticCategory.BADGE && equippedBadge === BigInt(itemId));

          // 4. Generate gradient berdasarkan rarity (frontend only)
          const gradient = getGradientByRarity(itemData.rarity);

          items.push({
            itemId,
            name: itemData.name,
            category: itemData.category,
            rarity: itemData.rarity,
            owned,
            equipped,
            gradient,
            // Jika tidak owned, bisa tampilkan harga dari marketplace
          });
        } catch (error) {
          console.error(`Error fetching item ${itemId}:`, error);
        }
      }

      setCosmetics(items);
      setIsLoading(false);
    }

    fetchCosmetics();
  }, [address, equippedFrame, equippedBackground, equippedTitle, equippedBadge]);

  // Helper function untuk gradient
  const getGradientByRarity = (rarity: CosmeticRarity) => {
    switch (rarity) {
      case CosmeticRarity.LEGENDARY:
        return 'from-yellow-400 via-orange-500 to-red-600';
      case CosmeticRarity.EPIC:
        return 'from-purple-600 via-pink-600 to-red-600';
      case CosmeticRarity.RARE:
        return 'from-blue-500 via-cyan-500 to-indigo-600';
      default:
        return 'from-gray-400 via-gray-500 to-gray-600';
    }
  };

  // ... rest of the code (handleEquip, handleUnequip, etc.)
}
```

---

## 🔧 Langkah 3: Buat `hooks/useMarketplace.ts`

Hook baru untuk marketplace functionality:

```typescript
'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAccount } from 'wagmi';
import { CONTRACTS, ABIS } from '@/lib/contracts';
import { useState, useEffect } from 'react';
import { formatEther, parseEther } from 'viem';

export enum ListingStatus {
  ACTIVE = 0,
  SOLD = 1,
  CANCELLED = 2,
}

export interface MarketplaceListing {
  listingId: number;
  seller: string;
  itemId: number;
  amount: number;
  pricePerUnit: bigint;
  status: ListingStatus;
  createdAt: number;
  soldAt: number;
  // Frontend computed
  totalPrice: string; // in ETH
  itemName?: string;
  itemRarity?: number;
}

export function useMarketplace() {
  const { address } = useAccount();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get platform fee
  const { data: platformFee } = useReadContract({
    address: CONTRACTS.Marketplace,
    abi: ABIS.Marketplace,
    functionName: 'getPlatformFee',
  });

  // Create listing
  const { writeContract: createListing, data: createHash } = useWriteContract();
  const { isLoading: isCreating, isSuccess: createSuccess } = useWaitForTransactionReceipt({
    hash: createHash,
  });

  // Buy item
  const { writeContract: buyItem, data: buyHash } = useWriteContract();
  const { isLoading: isBuying, isSuccess: buySuccess } = useWaitForTransactionReceipt({
    hash: buyHash,
  });

  // Cancel listing
  const { writeContract: cancelListing, data: cancelHash } = useWriteContract();
  const { isLoading: isCancelling, isSuccess: cancelSuccess } = useWaitForTransactionReceipt({
    hash: cancelHash,
  });

  // Fetch all active listings
  useEffect(() => {
    async function fetchListings() {
      // TODO: Implement fetching listings
      // Karena contract tidak punya getAllListings(), 
      // kita perlu track listing IDs dari events atau backend
      
      // Untuk MVP, bisa pakai dummy data dulu atau
      // fetch dari backend yang listen ke events
      setIsLoading(false);
    }

    fetchListings();
  }, []);

  // Create new listing
  const handleCreateListing = async (
    itemId: number,
    amount: number,
    pricePerUnit: string // in ETH
  ) => {
    if (!address) return;

    try {
      // 1. Approve marketplace to transfer NFT
      // (User perlu approve dulu sebelum create listing)
      
      // 2. Create listing
      await createListing({
        address: CONTRACTS.Marketplace,
        abi: ABIS.Marketplace,
        functionName: 'createListing',
        args: [
          BigInt(itemId),
          BigInt(amount),
          parseEther(pricePerUnit), // Convert ETH to wei
        ],
      });
    } catch (error) {
      console.error('Error creating listing:', error);
      throw error;
    }
  };

  // Buy item from listing
  const handleBuyItem = async (listingId: number, amount: number, totalPrice: string) => {
    if (!address) return;

    try {
      await buyItem({
        address: CONTRACTS.Marketplace,
        abi: ABIS.Marketplace,
        functionName: 'buyItem',
        args: [BigInt(listingId), BigInt(amount)],
        value: parseEther(totalPrice), // Send ETH
      });
    } catch (error) {
      console.error('Error buying item:', error);
      throw error;
    }
  };

  // Cancel own listing
  const handleCancelListing = async (listingId: number) => {
    if (!address) return;

    try {
      await cancelListing({
        address: CONTRACTS.Marketplace,
        abi: ABIS.Marketplace,
        functionName: 'cancelListing',
        args: [BigInt(listingId)],
      });
    } catch (error) {
      console.error('Error cancelling listing:', error);
      throw error;
    }
  };

  // Get listings by item
  const getListingsByItem = async (itemId: number) => {
    try {
      const listingIds = await readContract({
        address: CONTRACTS.Marketplace,
        abi: ABIS.Marketplace,
        functionName: 'getListingsByItem',
        args: [BigInt(itemId)],
      });

      // Fetch each listing detail
      const listingDetails = await Promise.all(
        listingIds.map(async (id: bigint) => {
          const listing = await readContract({
            address: CONTRACTS.Marketplace,
            abi: ABIS.Marketplace,
            functionName: 'getListing',
            args: [id],
          });
          return {
            listingId: Number(id),
            ...listing,
            totalPrice: formatEther(listing.pricePerUnit * BigInt(listing.amount)),
          };
        })
      );

      return listingDetails.filter(l => l.status === ListingStatus.ACTIVE);
    } catch (error) {
      console.error('Error fetching listings:', error);
      return [];
    }
  };

  // Get user's listings
  const getMyListings = async () => {
    if (!address) return [];

    try {
      const listingIds = await readContract({
        address: CONTRACTS.Marketplace,
        abi: ABIS.Marketplace,
        functionName: 'getListingsBySeller',
        args: [address],
      });

      const listingDetails = await Promise.all(
        listingIds.map(async (id: bigint) => {
          const listing = await readContract({
            address: CONTRACTS.Marketplace,
            abi: ABIS.Marketplace,
            functionName: 'getListing',
            args: [id],
          });
          return {
            listingId: Number(id),
            ...listing,
            totalPrice: formatEther(listing.pricePerUnit * BigInt(listing.amount)),
          };
        })
      );

      return listingDetails;
    } catch (error) {
      console.error('Error fetching my listings:', error);
      return [];
    }
  };

  return {
    listings,
    isLoading,
    platformFee: platformFee ? Number(platformFee) / 100 : 2.5, // Default 2.5%
    isCreating,
    isBuying,
    isCancelling,
    createSuccess,
    buySuccess,
    cancelSuccess,
    handleCreateListing,
    handleBuyItem,
    handleCancelListing,
    getListingsByItem,
    getMyListings,
  };
}
```

---

## 🔧 Langkah 4: Update `app/market/page.tsx`

Tambahkan support untuk marketplace listings:

```typescript
'use client';

import { useState } from 'react';
import MarketHeader from '@/components/market/MarketHeader';
import ProfilePreview from '@/components/market/ProfilePreview';
import PreviewTabs from '@/components/market/PreviewTabs';
import SkinCollection from '@/components/market/SkinCollection';
import BottomNavigation from '@/components/BottomNavigation';
import { useCosmetics, CosmeticCategory } from '@/hooks/useCosmetics';
import { useMarketplace } from '@/hooks/useMarketplace'; // TAMBAHKAN INI

export default function MarketPage() {
  const [activeTab, setActiveTab] = useState('Backgrounds');
  const { cosmetics, isLoading, getOwned, getStore, handleEquip } = useCosmetics();
  const { getListingsByItem, handleBuyItem } = useMarketplace(); // TAMBAHKAN INI
  const [selectedSkinId, setSelectedSkinId] = useState<number | null>(null);

  // ... rest of the code

  // TAMBAHKAN: Handler untuk buy item
  const handleBuySkin = async (itemId: number) => {
    try {
      // 1. Get listings for this item
      const listings = await getListingsByItem(itemId);
      
      if (listings.length === 0) {
        alert('No listings available for this item');
        return;
      }

      // 2. Get cheapest listing
      const cheapestListing = listings.reduce((prev, curr) => 
        BigInt(curr.pricePerUnit) < BigInt(prev.pricePerUnit) ? curr : prev
      );

      // 3. Buy item
      await handleBuyItem(
        cheapestListing.listingId,
        1, // amount
        cheapestListing.totalPrice
      );

      alert('Purchase successful!');
    } catch (error) {
      console.error('Error buying item:', error);
      alert('Failed to buy item');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      {/* ... existing code ... */}
      
      <SkinCollection
        title="Store"
        skins={storeSkins.map(item => ({
          id: item.itemId,
          name: item.name,
          type: activeTab.toLowerCase().slice(0, -1),
          owned: false,
          rarity: ['Common', 'Rare', 'Epic', 'Legendary'][item.rarity],
          gradient: item.gradient,
          price: item.price,
        }))}
        selectedSkinId={null}
        onSelectSkin={handleBuySkin} // UBAH INI untuk buy
      />
    </div>
  );
}
```

---

## 🔧 Langkah 5: Update `components/market/SkinCard.tsx`

Tambahkan tombol "Buy" untuk item yang tidak dimiliki:

```typescript
export default function SkinCard({
  name,
  owned,
  rarity,
  gradient,
  isSelected,
  price, // TAMBAHKAN INI
  onSelect
}: SkinCardProps) {
  return (
    <div className={...}>
      {/* ... existing code ... */}
      
      <div className="p-3">
        <h4 className="mb-2 text-sm font-bold text-gray-900">{name}</h4>
        
        {/* UBAH BUTTON INI */}
        <button
          onClick={onSelect}
          disabled={!owned && !price} // Disable jika tidak owned dan tidak ada price
          className={`w-full rounded-lg py-2 text-sm font-semibold transition-all ${
            owned
              ? isSelected
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              : price
              ? 'bg-green-500 text-white hover:bg-green-600' // Tombol Buy
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {owned 
            ? (isSelected ? 'Using' : 'Use') 
            : price 
            ? `Buy ${price}` 
            : 'Locked'
          }
        </button>
      </div>
    </div>
  );
}
```

---

## 📊 Ringkasan Perubahan

### Yang Perlu Diganti:

1. **`lib/contracts.ts`**
   - ✅ Tambah address Marketplace contract
   - ✅ Import MarketplaceABI

2. **`hooks/useCosmetics.ts`**
   - ✅ Ganti dummy data dengan `getItem()` dari contract
   - ✅ Cek kepemilikan dengan `balanceOf()`
   - ✅ Loop semua item ID yang ada

3. **`hooks/useMarketplace.ts`** (BARU)
   - ✅ Create listing
   - ✅ Buy item
   - ✅ Cancel listing
   - ✅ Get listings by item
   - ✅ Get user's listings

4. **`app/market/page.tsx`**
   - ✅ Import useMarketplace
   - ✅ Tambah handler untuk buy item
   - ✅ Fetch listings untuk item di store

5. **`components/market/SkinCard.tsx`**
   - ✅ Tambah prop `price`
   - ✅ Ubah button jadi "Buy" untuk item yang tidak dimiliki

---

## 🎯 Flow Marketplace

### 1. **Melihat Item di Store**:
```
User buka Market → useCosmetics fetch semua item → 
Filter item yang tidak dimiliki → Tampilkan di "Store" section
```

### 2. **Membeli Item**:
```
User klik "Buy" → getListingsByItem(itemId) → 
Ambil listing termurah → handleBuyItem() → 
Transfer ETH + NFT → Item masuk ke "My Collection"
```

### 3. **Menjual Item** (Opsional):
```
User punya item → Klik "Sell" → Input harga → 
Approve Marketplace → handleCreateListing() → 
Item muncul di marketplace
```

---

## ⚠️ Catatan Penting

### 1. **Item IDs**:
- Saat ini kita hardcode `ITEM_IDS = [1, 2, 3, 4, 5, 6, 7, 8]`
- Idealnya, backend yang provide list item IDs yang ada
- Atau bisa listen ke event `ItemCreated` dari contract

### 2. **Approval**:
- Sebelum create listing, user harus approve Marketplace contract
- Gunakan `setApprovalForAll(MARKETPLACE_ADDRESS, true)`

### 3. **Platform Fee**:
- Marketplace charge fee (default 2.5%)
- Fee otomatis dipotong saat buy item
- Tampilkan fee ke user sebelum buy

### 4. **Listing Discovery**:
- Contract tidak punya `getAllListings()`
- Perlu track listing IDs dari events atau backend
- Untuk MVP, bisa fetch per item dengan `getListingsByItem()`

---

## 🚀 Langkah Implementasi

### Fase 1: Cosmetics Real Data (1-2 jam)
1. Update `lib/contracts.ts` dengan address yang benar
2. Update `useCosmetics.ts` untuk fetch dari contract
3. Test di Market page

### Fase 2: Marketplace Basic (2-3 jam)
1. Buat `hooks/useMarketplace.ts`
2. Implement buy functionality
3. Update UI untuk show price dan buy button

### Fase 3: Marketplace Advanced (3-4 jam)
1. Implement create listing
2. Implement cancel listing
3. Buat page "My Listings"

---

## 📝 Checklist

- [ ] Update `lib/contracts.ts` dengan Marketplace address
- [ ] Update `useCosmetics.ts` untuk fetch real data
- [ ] Buat `hooks/useMarketplace.ts`
- [ ] Update `app/market/page.tsx` untuk support buy
- [ ] Update `SkinCard.tsx` dengan tombol Buy
- [ ] Test buy functionality
- [ ] Implement create listing (opsional)
- [ ] Implement cancel listing (opsional)

---

**Siap untuk mulai? Mulai dari Fase 1 - fetch cosmetics real data!** 🎨
