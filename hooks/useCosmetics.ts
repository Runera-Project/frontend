'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAccount } from 'wagmi';
import { CONTRACTS, ABIS } from '@/lib/contracts';
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
}

export function useCosmetics() {
  const { address } = useAccount();
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
    // For MVP, use dummy data
    // In production, fetch from contract or backend
    const dummyCosmetics: CosmeticItem[] = [
      // Backgrounds
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
      {
        itemId: 7,
        name: 'Aurora Borealis',
        category: CosmeticCategory.BACKGROUND,
        rarity: CosmeticRarity.LEGENDARY,
        owned: false,
        equipped: false,
        gradient: 'from-green-300 via-blue-400 to-purple-500',
        price: '0.01 ETH',
      },
      // Frames
      {
        itemId: 5,
        name: 'Neon Grid',
        category: CosmeticCategory.FRAME,
        rarity: CosmeticRarity.EPIC,
        owned: false,
        equipped: false,
        gradient: 'from-green-400 via-cyan-500 to-blue-600',
        price: '0.005 ETH',
      },
      {
        itemId: 6,
        name: 'Galaxy Ring',
        category: CosmeticCategory.FRAME,
        rarity: CosmeticRarity.LEGENDARY,
        owned: false,
        equipped: false,
        gradient: 'from-purple-600 via-pink-600 to-red-600',
        price: '0.02 ETH',
      },
      {
        itemId: 8,
        name: 'Cyber Punk',
        category: CosmeticCategory.FRAME,
        rarity: CosmeticRarity.EPIC,
        owned: false,
        equipped: false,
        gradient: 'from-pink-500 via-purple-600 to-indigo-700',
        price: '0.008 ETH',
      },
    ];

    setCosmetics(dummyCosmetics);
    setIsLoading(false);
  }, [equippedFrame, equippedBackground, equippedTitle, equippedBadge]);

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
