'use client';

import { useState } from 'react';
import BottomNavigation from '@/components/BottomNavigation';
import MarketHeader from '@/components/market/MarketHeader';
import ProfilePreview from '@/components/market/ProfilePreview';
import PreviewTabs from '@/components/market/PreviewTabs';
import { useCosmetics, CosmeticCategory } from '@/hooks/useCosmetics';
import { Package, Check, ShoppingCart, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CollectionPage() {
  const [activeTab, setActiveTab] = useState('Frames');
  const { cosmetics, isLoading } = useCosmetics();
  
  // Local selection state (no transaction needed)
  const [selectedItems, setSelectedItems] = useState<Record<CosmeticCategory, number | null>>({
    [CosmeticCategory.FRAME]: null,
    [CosmeticCategory.BACKGROUND]: null,
    [CosmeticCategory.TITLE]: null,
    [CosmeticCategory.BADGE]: null,
  });

  // Category mapping
  const categoryMap: Record<string, CosmeticCategory> = {
    'Frames': CosmeticCategory.FRAME,
    'Backgrounds': CosmeticCategory.BACKGROUND,
    'Titles': CosmeticCategory.TITLE,
    'Badges': CosmeticCategory.BADGE,
  };

  const currentCategory = categoryMap[activeTab];

  // Get owned items for current category
  const ownedItems = cosmetics.filter(item => item.owned && item.category === currentCategory);

  // Get selected skin for preview
  const selectedSkin = cosmetics.find(item => item.itemId === selectedItems[currentCategory]);
  const selectedSkinForPreview = selectedSkin ? {
    name: selectedSkin.name,
    type: activeTab.toLowerCase().slice(0, -1),
    gradient: selectedSkin.gradient,
  } : null;

  const handleUseItem = (itemId: number) => {
    setSelectedItems(prev => ({
      ...prev,
      [currentCategory]: prev[currentCategory] === itemId ? null : itemId
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto max-w-md pb-28">
        <MarketHeader />
        <ProfilePreview selectedSkin={selectedSkinForPreview} />
        
        {/* Store / Collection Tabs */}
        <div className="mx-6 mb-4 flex rounded-xl bg-white p-1 shadow-sm">
          <Link href="/market" className="flex-1 py-2.5 flex items-center justify-center gap-1.5 hover:bg-gray-50 rounded-lg">
            <ShoppingCart className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-500">Store</span>
          </Link>
          <div className="flex-1 rounded-lg bg-blue-500 py-2.5 flex items-center justify-center gap-1.5">
            <Package className="h-4 w-4 text-white" />
            <span className="text-sm font-semibold text-white">Collection</span>
          </div>
        </div>

        {/* Category Tabs */}
        <PreviewTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Loading collection...</p>
            </div>
          </div>
        ) : (
          <div className="px-6">
            {/* Items Grid */}
            {ownedItems.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {ownedItems.map((item) => {
                  const isUsing = selectedItems[currentCategory] === item.itemId;
                  return (
                    <div 
                      key={item.itemId}
                      onClick={() => handleUseItem(item.itemId)}
                      className={`bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer transition-all ${
                        isUsing 
                          ? 'ring-2 ring-green-500 shadow-lg' 
                          : 'hover:shadow-md'
                      }`}
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

                        {/* Using Indicator */}
                        {isUsing && (
                          <div className="absolute top-2 left-2">
                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                              <Check className="h-4 w-4 text-white" strokeWidth={3} />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-3">
                        <h3 className="font-semibold text-gray-900 text-sm mb-2 truncate">{item.name}</h3>
                        <div
                          className={`w-full py-2 rounded-xl text-xs font-semibold text-center transition-all flex items-center justify-center gap-1 ${
                            isUsing
                              ? 'bg-green-500 text-white'
                              : 'bg-blue-50 text-blue-600'
                          }`}
                        >
                          {isUsing ? (
                            <>
                              <Check className="h-3.5 w-3.5" />
                              <span>Active</span>
                            </>
                          ) : (
                            <span>Use</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">No items in collection</p>
                <p className="text-gray-400 text-sm mt-1">Buy items from the Store!</p>
                <Link 
                  href="/market" 
                  className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-full bg-blue-500 text-white text-sm font-medium hover:bg-blue-600"
                >
                  <span>Go to Store</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
      <BottomNavigation activeTab="Market" />
    </div>
  );
}
