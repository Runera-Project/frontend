'use client';

import { useState } from 'react';
import BottomNavigation from '@/components/BottomNavigation';
import MarketHeader from '@/components/market/MarketHeader';
import ProfilePreview from '@/components/market/ProfilePreview';
import PreviewTabs from '@/components/market/PreviewTabs';
import { useCosmetics, CosmeticCategory } from '@/hooks/useCosmetics';
import { useMarketplace } from '@/hooks/useMarketplace';
import { Gem, ShoppingBag, ShoppingCart, Package, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function MarketPage() {
  const [activeTab, setActiveTab] = useState('Frames');
  const { cosmetics, isLoading } = useCosmetics();
  const { isBuying, handleBuyItem, getListingsByItem } = useMarketplace();

  // Category mapping
  const categoryMap: Record<string, CosmeticCategory> = {
    'Frames': CosmeticCategory.FRAME,
    'Backgrounds': CosmeticCategory.BACKGROUND,
    'Titles': CosmeticCategory.TITLE,
    'Badges': CosmeticCategory.BADGE,
  };

  const currentCategory = categoryMap[activeTab];

  // Get store items (not owned) for current category
  const storeItems = cosmetics.filter(item => !item.owned && item.category === currentCategory);

  const handleBuy = async (itemId: number) => {
    try {
      const listings = await getListingsByItem(itemId);
      if (listings.length === 0) {
        alert('Item ini belum tersedia di marketplace');
        return;
      }
      const cheapest = listings[0];
      await handleBuyItem(cheapest.listingId, 1, cheapest.totalPrice);
      alert('Purchase successful!');
    } catch (error) {
      console.error('Error:', error);
      alert('Gagal membeli item');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto max-w-md pb-28">
        <MarketHeader />
        <ProfilePreview selectedSkin={null} />
        
        {/* Store / Collection Tabs */}
        <div className="mx-6 mb-4 flex rounded-xl bg-white p-1 shadow-sm">
          <div className="flex-1 rounded-lg bg-blue-500 py-2.5 flex items-center justify-center gap-1.5">
            <ShoppingCart className="h-4 w-4 text-white" />
            <span className="text-sm font-semibold text-white">Store</span>
          </div>
          <Link href="/market/collection" className="flex-1 py-2.5 flex items-center justify-center gap-1.5 hover:bg-gray-50 rounded-lg">
            <Package className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-500">Collection</span>
          </Link>
        </div>

        {/* Category Tabs */}
        <PreviewTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Loading store...</p>
            </div>
          </div>
        ) : (
          <div className="px-6">
            {/* Items Grid */}
            {storeItems.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {storeItems.map((item) => (
                  <div 
                    key={item.itemId}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Preview */}
                    <div className={`h-28 bg-gradient-to-br ${item.gradient} relative`}>
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute inset-0" style={{
                          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
                          backgroundSize: '16px 16px'
                        }} />
                      </div>
                      
                      {/* Rarity */}
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${
                          item.rarity === 3 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                          item.rarity === 2 ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                          item.rarity === 1 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                          'bg-gray-500'
                        }`}>
                          {['Common', 'Rare', 'Epic', 'Legendary'][item.rarity]}
                        </span>
                      </div>

                      {/* Price */}
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center justify-center gap-1">
                          <Gem className="h-3 w-3 text-blue-500" />
                          <span className="text-xs font-bold text-gray-800">{item.price || '0.01 ETH'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <h3 className="font-semibold text-gray-900 text-sm mb-2 truncate">{item.name}</h3>
                      <button
                        onClick={() => handleBuy(item.itemId)}
                        disabled={isBuying}
                        className="w-full py-2 rounded-xl bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        {isBuying ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-3.5 w-3.5" />
                            <span>Buy Now</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">No items available</p>
                <p className="text-gray-400 text-sm mt-1">Check back later for new items!</p>
              </div>
            )}
          </div>
        )}
      </div>
      <BottomNavigation activeTab="Market" />
    </div>
  );
}
