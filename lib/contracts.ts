import { Address } from 'viem';

// Contract Addresses (Update with actual deployed addresses)
export const CONTRACTS = {
  ProfileNFT: (process.env.NEXT_PUBLIC_CONTRACT_PROFILE_NFT || '0x0000000000000000000000000000000000000000') as Address,
  CosmeticNFT: (process.env.NEXT_PUBLIC_CONTRACT_COSMETIC_NFT || '0x0000000000000000000000000000000000000000') as Address,
  AchievementNFT: (process.env.NEXT_PUBLIC_CONTRACT_ACHIEVEMENT_NFT || '0x0000000000000000000000000000000000000000') as Address,
  EventRegistry: (process.env.NEXT_PUBLIC_CONTRACT_EVENT_REGISTRY || '0x0000000000000000000000000000000000000000') as Address,
  Marketplace: (process.env.NEXT_PUBLIC_CONTRACT_MARKETPLACE || '0x0000000000000000000000000000000000000000') as Address,
} as const;

// Import ABIs from ABI2 folder (updated ABIs from Foundry)
import ProfileABI from '@/ABI2/RuneraProfileABI.json';
import CosmeticABI from '@/ABI2/RuneraCosmeticNFTABI.json';
import AchievementABI from '@/ABI2/RuneraAchievementABI.json';
import EventABI from '@/ABI2/RuneraEventRegistryABI.json';
import MarketplaceABI from '@/ABI2/RuneraMarketplaceABI.json';

export const ABIS = {
  ProfileNFT: ProfileABI,
  CosmeticNFT: CosmeticABI,
  AchievementNFT: AchievementABI,
  EventRegistry: EventABI,
  Marketplace: MarketplaceABI,
} as const;

// Tier configuration
export const TIER_NAMES = {
  1: 'Bronze',
  2: 'Silver',
  3: 'Gold',
  4: 'Platinum',
  5: 'Diamond',
} as const;

export const TIER_REQUIREMENTS = {
  1: 0,      // Bronze - default
  2: 50,     // Silver - 50km
  3: 200,    // Gold - 200km
  4: 500,    // Platinum - 500km
  5: 1000,   // Diamond - 1000km
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
