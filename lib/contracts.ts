import { Address } from 'viem';

export const CONTRACTS = {
  ProfileNFT: (process.env.NEXT_PUBLIC_CONTRACT_PROFILE_NFT || '0x0000000000000000000000000000000000000000') as Address,
  CosmeticNFT: (process.env.NEXT_PUBLIC_CONTRACT_COSMETIC_NFT || '0x0000000000000000000000000000000000000000') as Address,
  AchievementNFT: (process.env.NEXT_PUBLIC_CONTRACT_ACHIEVEMENT_NFT || '0x0000000000000000000000000000000000000000') as Address,
  EventRegistry: (process.env.NEXT_PUBLIC_CONTRACT_EVENT_REGISTRY || '0x0000000000000000000000000000000000000000') as Address,
  Marketplace: (process.env.NEXT_PUBLIC_CONTRACT_MARKETPLACE || '0x0000000000000000000000000000000000000000') as Address,
  AccessControl: (process.env.NEXT_PUBLIC_ACCESS_CONTROL_ADDRESS || '0x0000000000000000000000000000000000000000') as Address,
} as const;

import ProfileABI from '@/ABI2/RuneraProfileABI.json';
import CosmeticABI from '@/ABI2/RuneraCosmeticNFTABI.json';
import AchievementABI from '@/ABI2/RuneraAchievementABI.json';
import EventABI from '@/ABI2/RuneraEventRegistryABI.json';
import MarketplaceABI from '@/ABI2/RuneraMarketplaceABI.json';
import AccessControlABI from '@/ABI2/RuneraAccessControlABI.json';

export const ABIS = {
  ProfileNFT: ProfileABI,
  CosmeticNFT: CosmeticABI,
  AchievementNFT: AchievementABI,
  EventRegistry: EventABI,
  Marketplace: MarketplaceABI,
  AccessControl: AccessControlABI,
} as const;

// Tier configuration (based on LEVEL, not distance)
export const TIER_NAMES = {
  1: 'Bronze',
  2: 'Silver',
  3: 'Gold',
  4: 'Platinum',
  5: 'Diamond',
} as const;

// Tier requirements based on LEVEL (matching smart contract logic)
export const TIER_REQUIREMENTS = {
  1: 1,   // Bronze - Level 1-2
  2: 3,   // Silver - Level 3-4 (TIER_SILVER = 3)
  3: 5,   // Gold - Level 5-6 (TIER_GOLD = 5)
  4: 7,   // Platinum - Level 7-8 (TIER_PLATINUM = 7)
  5: 9,   // Diamond - Level 9+ (TIER_DIAMOND = 9)
} as const;

// XP requirements per level (backend calculates this, but useful for frontend display)
export const LEVEL_XP_REQUIREMENTS = {
  1: 0,
  2: 100,
  3: 250,
  4: 450,
  5: 700,
  6: 1000,
  7: 1350,
  8: 1750,
  9: 2200,
  10: 2700,
  11: 3250,
  12: 3850,
  13: 4500,
  14: 5200,
  15: 5950,
  16: 6750,
  17: 7600,
  18: 8500,
  19: 9450,
  20: 10450,
} as const;

export const TIER_COLORS = {
  1: 'from-amber-700 to-amber-900',   // Bronze
  2: 'from-gray-400 to-gray-600',     // Silver
  3: 'from-yellow-400 to-yellow-600', // Gold
  4: 'from-cyan-400 to-cyan-600',     // Platinum
  5: 'from-blue-400 to-purple-600',   // Diamond
} as const;

// Cosmetic categories
export const COSMETIC_CATEGORIES = {
  0: 'Frame',
  1: 'Background',
  2: 'Title',
  3: 'Badge',
} as const;

// Cosmetic rarities
export const COSMETIC_RARITIES = {
  0: 'Common',
  1: 'Rare',
  2: 'Epic',
  3: 'Legendary',
} as const;

export const RARITY_COLORS = {
  0: 'from-gray-400 to-gray-600',      // Common
  1: 'from-blue-400 to-blue-600',      // Rare
  2: 'from-purple-400 to-purple-600',  // Epic
  3: 'from-orange-400 to-yellow-500',  // Legendary
} as const;
