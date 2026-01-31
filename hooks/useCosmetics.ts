'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { useAccount } from 'wagmi';
import { CONTRACTS, ABIS, RARITY_COLORS } from '@/lib/contracts';
import { useState, useEffect } from 'react';

// Category enum matching smart contract
export enum CosmeticCategory {
  FRAME = 0,
  BACKGROUND = 1,
  TITLE = 2,
  BADGE = 3,
}

// Rarity enum matching smart contract
export enum CosmeticRarity {
  COMMON = 0,
  RARE = 1,
  EPIC = 2,
  LEGENDARY = 3,
}

export interface CosmeticItem {
  itemId: number;
  name: string;
  category: CosmeticCategory;
  rarity: CosmeticRarity;
  // Frontend fields
  owned: boolean;
  equipped: boolean;
  gradient: string;
  price?: string; // For marketplace
  // Contract fields
  maxSupply?: number;
  currentSupply?: number;
  minTierRequired?: number;
}

export function useCosmetics() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [cosmetics, setCosmetics] = useState<CosmeticItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get equipped items for each category
  const { data: equippedFrame } = useReadContract({
    address: CONTRACTS.CosmeticNFT,
    abi: ABIS.CosmeticNFT,
    functionName: 'getEquipped',
    args: address ? [address, CosmeticCategory.FRAME] : undefined,
  });

  const { data: equippedBackground } = useReadContract({
    address: CONTRACTS.CosmeticNFT,
    abi: ABIS.CosmeticNFT,
    functionName: 'getEquipped',
    args: address ? [address, CosmeticCategory.BACKGROUND] : undefined,
  });

  const { data: equippedTitle } = useReadContract({
    address: CONTRACTS.CosmeticNFT,
    abi: ABIS.CosmeticNFT,
    functionName: 'getEquipped',
    args: address ? [address, CosmeticCategory.TITLE] : undefined,
  });

  const { data: equippedBadge } = useReadContract({
    address: CONTRACTS.CosmeticNFT,
    abi: ABIS.CosmeticNFT,
    functionName: 'getEquipped',
    args: address ? [address, CosmeticCategory.BADGE] : undefined,
  });

  // Equip item
  const { writeContract: equipItem, data: equipHash } = useWriteContract();
  const { isLoading: isEquipping, isSuccess: equipSuccess } = useWaitForTransactionReceipt({
    hash: equipHash,
  });

  // Unequip item
  const { writeContract: unequipItem, data: unequipHash } = useWriteContract();
  const { isLoading: isUnequipping, isSuccess: unequipSuccess } = useWaitForTransactionReceipt({
    hash: unequipHash,
  });

  useEffect(() => {
    async function fetchCosmetics() {
      // Cek apakah contract address valid
      if (!CONTRACTS.CosmeticNFT || CONTRACTS.CosmeticNFT === '0x0000000000000000000000000000000000000000') {
        console.warn('CosmeticNFT contract address not configured, using dummy data');
        setCosmetics(getDummyCosmetics());
        setIsLoading(false);
        return;
      }

      if (!publicClient) {
        console.warn('Public client not available, using dummy data');
        setCosmetics(getDummyCosmetics());
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      // Item IDs yang ada di contract (bisa didapat dari backend atau hardcode dulu)
      // Untuk MVP, kita coba fetch item 1-10
      const ITEM_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const items: CosmeticItem[] = [];

      for (const itemId of ITEM_IDS) {
        try {
          // 1. Cek apakah item exists
          const exists = await publicClient.readContract({
            address: CONTRACTS.CosmeticNFT,
            abi: ABIS.CosmeticNFT,
            functionName: 'itemExists',
            args: [BigInt(itemId)],
          }) as boolean;

          if (!exists) continue;

          // 2. Ambil data item dari contract
          const itemData = await publicClient.readContract({
            address: CONTRACTS.CosmeticNFT,
            abi: ABIS.CosmeticNFT,
            functionName: 'getItem',
            args: [BigInt(itemId)],
          }) as any;

          if (!itemData.exists) continue;

          // 3. Cek kepemilikan user (jika ada address)
          let owned = false;
          if (address) {
            const balance = await publicClient.readContract({
              address: CONTRACTS.CosmeticNFT,
              abi: ABIS.CosmeticNFT,
              functionName: 'balanceOf',
              args: [address, BigInt(itemId)],
            }) as bigint;
            owned = balance > BigInt(0);
          }

          // 4. Cek apakah item ini sedang di-equip
          const equipped = 
            (itemData.category === CosmeticCategory.FRAME && equippedFrame === BigInt(itemId)) ||
            (itemData.category === CosmeticCategory.BACKGROUND && equippedBackground === BigInt(itemId)) ||
            (itemData.category === CosmeticCategory.TITLE && equippedTitle === BigInt(itemId)) ||
            (itemData.category === CosmeticCategory.BADGE && equippedBadge === BigInt(itemId));

          // 5. Generate gradient berdasarkan rarity
          const gradient = RARITY_COLORS[itemData.rarity as keyof typeof RARITY_COLORS] || 'from-gray-400 to-gray-600';

          items.push({
            itemId,
            name: itemData.name,
            category: itemData.category,
            rarity: itemData.rarity,
            owned,
            equipped,
            gradient,
            maxSupply: Number(itemData.maxSupply),
            currentSupply: Number(itemData.currentSupply),
            minTierRequired: itemData.minTierRequired,
          });
        } catch (error) {
          console.error(`Error fetching item ${itemId}:`, error);
          // Skip item jika error
        }
      }

      // Jika tidak ada item dari contract, gunakan dummy data sebagai fallback
      if (items.length === 0) {
        console.warn('No items found from contract, using dummy data');
        setCosmetics(getDummyCosmetics());
      } else {
        console.log(`✅ Loaded ${items.length} cosmetic items from contract`);
        setCosmetics(items);
      }

      setIsLoading(false);
    }

    fetchCosmetics();
  }, [address, equippedFrame, equippedBackground, equippedTitle, equippedBadge, publicClient]);

  // Helper function untuk dummy data
  const getDummyCosmetics = (): CosmeticItem[] => {
    return [
      // FRAMES
      {
        itemId: 101,
        name: 'Golden Runner',
        category: CosmeticCategory.FRAME,
        rarity: CosmeticRarity.LEGENDARY,
        owned: true,
        equipped: equippedFrame === BigInt(101),
        gradient: 'from-yellow-400 via-amber-500 to-orange-600',
      },
      {
        itemId: 102,
        name: 'Neon Pulse',
        category: CosmeticCategory.FRAME,
        rarity: CosmeticRarity.EPIC,
        owned: true,
        equipped: equippedFrame === BigInt(102),
        gradient: 'from-pink-500 via-purple-500 to-indigo-500',
      },
      {
        itemId: 103,
        name: 'Silver Edge',
        category: CosmeticCategory.FRAME,
        rarity: CosmeticRarity.RARE,
        owned: true,
        equipped: equippedFrame === BigInt(103),
        gradient: 'from-gray-300 via-gray-400 to-gray-500',
      },
      {
        itemId: 104,
        name: 'Basic Frame',
        category: CosmeticCategory.FRAME,
        rarity: CosmeticRarity.COMMON,
        owned: true,
        equipped: equippedFrame === BigInt(104),
        gradient: 'from-slate-400 to-slate-600',
      },
      // BACKGROUNDS
      {
        itemId: 1,
        name: 'Spacy Warp',
        category: CosmeticCategory.BACKGROUND,
        rarity: CosmeticRarity.EPIC,
        owned: true,
        equipped: equippedBackground === BigInt(1),
        gradient: 'from-purple-900 via-blue-900 to-black',
      },
      {
        itemId: 2,
        name: 'Blurry Sunny',
        category: CosmeticCategory.BACKGROUND,
        rarity: CosmeticRarity.RARE,
        owned: true,
        equipped: equippedBackground === BigInt(2),
        gradient: 'from-orange-300 via-pink-300 to-purple-300',
      },
      {
        itemId: 3,
        name: 'Ocean Wave',
        category: CosmeticCategory.BACKGROUND,
        rarity: CosmeticRarity.RARE,
        owned: true,
        equipped: equippedBackground === BigInt(3),
        gradient: 'from-cyan-400 via-blue-500 to-indigo-600',
      },
      {
        itemId: 4,
        name: 'Sunset Glow',
        category: CosmeticCategory.BACKGROUND,
        rarity: CosmeticRarity.EPIC,
        owned: true,
        equipped: equippedBackground === BigInt(4),
        gradient: 'from-yellow-400 via-orange-500 to-red-600',
      },
      // TITLES
      {
        itemId: 201,
        name: 'Marathon King',
        category: CosmeticCategory.TITLE,
        rarity: CosmeticRarity.LEGENDARY,
        owned: true,
        equipped: equippedTitle === BigInt(201),
        gradient: 'from-amber-400 via-yellow-300 to-amber-500',
      },
      {
        itemId: 202,
        name: 'Speed Demon',
        category: CosmeticCategory.TITLE,
        rarity: CosmeticRarity.EPIC,
        owned: true,
        equipped: equippedTitle === BigInt(202),
        gradient: 'from-red-500 via-orange-500 to-yellow-500',
      },
      {
        itemId: 203,
        name: 'Trail Blazer',
        category: CosmeticCategory.TITLE,
        rarity: CosmeticRarity.RARE,
        owned: true,
        equipped: equippedTitle === BigInt(203),
        gradient: 'from-green-400 via-emerald-500 to-teal-500',
      },
      {
        itemId: 204,
        name: 'Rookie Runner',
        category: CosmeticCategory.TITLE,
        rarity: CosmeticRarity.COMMON,
        owned: true,
        equipped: equippedTitle === BigInt(204),
        gradient: 'from-blue-400 to-blue-600',
      },
      // BADGES
      {
        itemId: 301,
        name: 'Elite Champion',
        category: CosmeticCategory.BADGE,
        rarity: CosmeticRarity.LEGENDARY,
        owned: true,
        equipped: equippedBadge === BigInt(301),
        gradient: 'from-yellow-300 via-amber-400 to-orange-500',
      },
      {
        itemId: 302,
        name: 'Pro Athlete',
        category: CosmeticCategory.BADGE,
        rarity: CosmeticRarity.EPIC,
        owned: true,
        equipped: equippedBadge === BigInt(302),
        gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
      },
      {
        itemId: 303,
        name: 'Dedicated',
        category: CosmeticCategory.BADGE,
        rarity: CosmeticRarity.RARE,
        owned: true,
        equipped: equippedBadge === BigInt(303),
        gradient: 'from-sky-400 via-blue-500 to-indigo-500',
      },
      {
        itemId: 304,
        name: 'Starter',
        category: CosmeticCategory.BADGE,
        rarity: CosmeticRarity.COMMON,
        owned: true,
        equipped: equippedBadge === BigInt(304),
        gradient: 'from-gray-400 to-gray-500',
      },
      
      // ========== STORE ITEMS (not owned) ==========
      // FRAMES - Store
      {
        itemId: 105,
        name: 'Diamond Halo',
        category: CosmeticCategory.FRAME,
        rarity: CosmeticRarity.LEGENDARY,
        owned: false,
        equipped: false,
        gradient: 'from-cyan-300 via-blue-400 to-purple-500',
        price: '0.05 ETH',
      },
      {
        itemId: 106,
        name: 'Fire Ring',
        category: CosmeticCategory.FRAME,
        rarity: CosmeticRarity.EPIC,
        owned: false,
        equipped: false,
        gradient: 'from-red-500 via-orange-500 to-yellow-400',
        price: '0.02 ETH',
      },
      // BACKGROUNDS - Store
      {
        itemId: 5,
        name: 'Aurora Borealis',
        category: CosmeticCategory.BACKGROUND,
        rarity: CosmeticRarity.LEGENDARY,
        owned: false,
        equipped: false,
        gradient: 'from-green-400 via-cyan-500 to-purple-600',
        price: '0.08 ETH',
      },
      {
        itemId: 6,
        name: 'Midnight City',
        category: CosmeticCategory.BACKGROUND,
        rarity: CosmeticRarity.EPIC,
        owned: false,
        equipped: false,
        gradient: 'from-slate-900 via-purple-900 to-slate-900',
        price: '0.03 ETH',
      },
      // TITLES - Store
      {
        itemId: 205,
        name: 'Ultra Legend',
        category: CosmeticCategory.TITLE,
        rarity: CosmeticRarity.LEGENDARY,
        owned: false,
        equipped: false,
        gradient: 'from-rose-400 via-fuchsia-500 to-indigo-500',
        price: '0.1 ETH',
      },
      {
        itemId: 206,
        name: 'Iron Will',
        category: CosmeticCategory.TITLE,
        rarity: CosmeticRarity.RARE,
        owned: false,
        equipped: false,
        gradient: 'from-zinc-400 via-slate-500 to-zinc-600',
        price: '0.015 ETH',
      },
      // BADGES - Store
      {
        itemId: 305,
        name: 'Verified Pro',
        category: CosmeticCategory.BADGE,
        rarity: CosmeticRarity.LEGENDARY,
        owned: false,
        equipped: false,
        gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
        price: '0.06 ETH',
      },
      {
        itemId: 306,
        name: 'Rising Star',
        category: CosmeticCategory.BADGE,
        rarity: CosmeticRarity.RARE,
        owned: false,
        equipped: false,
        gradient: 'from-amber-300 via-yellow-400 to-orange-400',
        price: '0.02 ETH',
      },
    ];
  };

  const handleEquip = async (category: CosmeticCategory, itemId: number) => {
    if (!address) return;

    try {
      await equipItem({
        address: CONTRACTS.CosmeticNFT,
        abi: ABIS.CosmeticNFT,
        functionName: 'equipItem',
        args: [category, BigInt(itemId)],
      });
    } catch (error) {
      console.error('Error equipping item:', error);
      alert('Failed to equip item. Make sure you own it!');
    }
  };

  const handleUnequip = async (category: CosmeticCategory) => {
    if (!address) return;

    try {
      await unequipItem({
        address: CONTRACTS.CosmeticNFT,
        abi: ABIS.CosmeticNFT,
        functionName: 'unequipItem',
        args: [category],
      });
    } catch (error) {
      console.error('Error unequipping item:', error);
      alert('Failed to unequip item.');
    }
  };

  // Filter helpers
  const getByCategory = (category: CosmeticCategory) => {
    return cosmetics.filter(item => item.category === category);
  };

  const getOwned = () => {
    return cosmetics.filter(item => item.owned);
  };

  const getStore = () => {
    return cosmetics.filter(item => !item.owned);
  };

  const getEquipped = () => {
    return cosmetics.filter(item => item.equipped);
  };

  return {
    cosmetics,
    isLoading,
    isEquipping,
    isUnequipping,
    equipSuccess,
    unequipSuccess,
    equippedFrame: equippedFrame ? Number(equippedFrame) : 0,
    equippedBackground: equippedBackground ? Number(equippedBackground) : 0,
    equippedTitle: equippedTitle ? Number(equippedTitle) : 0,
    equippedBadge: equippedBadge ? Number(equippedBadge) : 0,
    handleEquip,
    handleUnequip,
    getByCategory,
    getOwned,
    getStore,
    getEquipped,
  };
}
