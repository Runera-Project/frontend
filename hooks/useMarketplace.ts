'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount, usePublicClient } from 'wagmi';
import { CONTRACTS, ABIS } from '@/lib/contracts';
import { useState } from 'react';
import { formatEther, parseEther, Address } from 'viem';

export enum ListingStatus {
  ACTIVE = 0,
  SOLD = 1,
  CANCELLED = 2,
}

export interface MarketplaceListing {
  listingId: number;
  seller: Address;
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
  const publicClient = usePublicClient();
  const [isLoading, setIsLoading] = useState(false);

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

  // Approve marketplace
  const { writeContract: approveMarketplace, data: approveHash } = useWriteContract();
  const { isLoading: isApproving, isSuccess: approveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Approve marketplace to transfer NFTs
  const handleApproveMarketplace = async () => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    try {
      await approveMarketplace({
        address: CONTRACTS.CosmeticNFT,
        abi: ABIS.CosmeticNFT,
        functionName: 'setApprovalForAll',
        args: [CONTRACTS.Marketplace, true],
      });
    } catch (error) {
      console.error('Error approving marketplace:', error);
      throw error;
    }
  };

  // Create new listing
  const handleCreateListing = async (
    itemId: number,
    amount: number,
    pricePerUnit: string // in ETH
  ) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    try {
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
    if (!address) {
      throw new Error('Wallet not connected');
    }

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
    if (!address) {
      throw new Error('Wallet not connected');
    }

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
  const getListingsByItem = async (itemId: number): Promise<MarketplaceListing[]> => {
    if (!publicClient) {
      console.error('Public client not available');
      return [];
    }

    try {
      setIsLoading(true);
      
      const listingIds = await publicClient.readContract({
        address: CONTRACTS.Marketplace,
        abi: ABIS.Marketplace,
        functionName: 'getListingsByItem',
        args: [BigInt(itemId)],
      }) as bigint[];

      if (!listingIds || listingIds.length === 0) {
        return [];
      }

      // Fetch each listing detail
      const listingDetails = await Promise.all(
        listingIds.map(async (id: bigint) => {
          try {
            const listing = await publicClient.readContract({
              address: CONTRACTS.Marketplace,
              abi: ABIS.Marketplace,
              functionName: 'getListing',
              args: [id],
            }) as any;

            if (!listing) return null;

            return {
              listingId: Number(id),
              seller: listing.seller,
              itemId: Number(listing.itemId),
              amount: Number(listing.amount),
              pricePerUnit: listing.pricePerUnit,
              status: listing.status,
              createdAt: Number(listing.createdAt),
              soldAt: Number(listing.soldAt),
              totalPrice: formatEther(listing.pricePerUnit * BigInt(listing.amount)),
            } as MarketplaceListing;
          } catch (error) {
            console.error(`Error fetching listing ${id}:`, error);
            return null;
          }
        })
      );

      return listingDetails.filter((l): l is MarketplaceListing => 
        l !== null && l.status === ListingStatus.ACTIVE
      );
    } catch (error) {
      console.error('Error fetching listings:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Get user's listings
  const getMyListings = async (): Promise<MarketplaceListing[]> => {
    if (!address || !publicClient) return [];

    try {
      setIsLoading(true);

      const listingIds = await publicClient.readContract({
        address: CONTRACTS.Marketplace,
        abi: ABIS.Marketplace,
        functionName: 'getListingsBySeller',
        args: [address],
      }) as bigint[];

      if (!listingIds || listingIds.length === 0) {
        return [];
      }

      const listingDetails = await Promise.all(
        listingIds.map(async (id: bigint) => {
          try {
            const listing = await publicClient.readContract({
              address: CONTRACTS.Marketplace,
              abi: ABIS.Marketplace,
              functionName: 'getListing',
              args: [id],
            }) as any;

            if (!listing) return null;

            return {
              listingId: Number(id),
              seller: listing.seller,
              itemId: Number(listing.itemId),
              amount: Number(listing.amount),
              pricePerUnit: listing.pricePerUnit,
              status: listing.status,
              createdAt: Number(listing.createdAt),
              soldAt: Number(listing.soldAt),
              totalPrice: formatEther(listing.pricePerUnit * BigInt(listing.amount)),
            } as MarketplaceListing;
          } catch (error) {
            console.error(`Error fetching listing ${id}:`, error);
            return null;
          }
        })
      );

      return listingDetails.filter((l): l is MarketplaceListing => l !== null);
    } catch (error) {
      console.error('Error fetching my listings:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    platformFee: platformFee ? Number(platformFee) / 100 : 2.5, // Default 2.5%
    isCreating,
    isBuying,
    isCancelling,
    isApproving,
    createSuccess,
    buySuccess,
    cancelSuccess,
    approveSuccess,
    handleApproveMarketplace,
    handleCreateListing,
    handleBuyItem,
    handleCancelListing,
    getListingsByItem,
    getMyListings,
  };
}
