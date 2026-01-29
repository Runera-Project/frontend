'use client';

import { useState } from 'react';
import MarketHeader from '@/components/market/MarketHeader';
import ProfilePreview from '@/components/market/ProfilePreview';
import PreviewTabs from '@/components/market/PreviewTabs';
import SkinCollection from '@/components/market/SkinCollection';
import BottomNavigation from '@/components/BottomNavigation';
import { useCosmetics, CosmeticCategory } from '@/hooks/useCosmetics';

export default function MarketPage() {
  const [activeTab, setActiveTab] = useState('Backgrounds');
  const { cosmetics, isLoading, getOwned, getStore, handleEquip } = useCosmetics();
  const [selectedSkinId, setSelectedSkinId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f7fa]">
        <div className="mx-auto max-w-md pb-28">
          <MarketHeader />
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mb-3 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 mx-auto" />
              <p className="text-sm text-gray-500">Loading cosmetics...</p>
            </div>
          </div>
        </div>
        <BottomNavigation activeTab="Market" />
      </div>
    );
  }

  // Filter by active tab
  const categoryMap: Record<string, CosmeticCategory> = {
    'Frames': CosmeticCategory.FRAME,
    'Backgrounds': CosmeticCategory.BACKGROUND,
    'Titles': CosmeticCategory.TITLE,
    'Badges': CosmeticCategory.BADGE,
  };

  const currentCategory = categoryMap[activeTab];
  const ownedSkins = getOwned().filter(item => item.category === currentCategory);
  const storeSkins = getStore().filter(item => item.category === currentCategory);

  const selectedSkin = cosmetics.find(item => item.itemId === selectedSkinId);

  const handleSelectSkin = (itemId: number) => {
    const skin = cosmetics.find(item => item.itemId === itemId);
    if (skin?.owned) {
      setSelectedSkinId(itemId);
      // Auto-equip when selected
      handleEquip(skin.category, itemId);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <div className="mx-auto max-w-md pb-28">
        <MarketHeader />
        <ProfilePreview selectedSkin={selectedSkin} />
        <PreviewTabs activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="px-5">
          {ownedSkins.length > 0 && (
            <SkinCollection
              title="My Collection"
              skins={ownedSkins.map(item => ({
                id: item.itemId,
                name: item.name,
                type: activeTab.toLowerCase().slice(0, -1),
                owned: true,
                rarity: ['Common', 'Rare', 'Epic', 'Legendary'][item.rarity],
                gradient: item.gradient,
              }))}
              selectedSkinId={selectedSkinId}
              onSelectSkin={handleSelectSkin}
            />
          )}
          
          {storeSkins.length > 0 && (
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
              onSelectSkin={handleSelectSkin}
            />
          )}

          {ownedSkins.length === 0 && storeSkins.length === 0 && (
            <div className="py-12 text-center">
              <div className="mb-3 text-5xl">🎨</div>
              <p className="text-sm font-medium text-gray-500">No {activeTab.toLowerCase()} available</p>
              <p className="text-xs text-gray-400 mt-1">Check back soon for new items!</p>
            </div>
          )}
        </div>
      </div>
      <BottomNavigation activeTab="Market" />
    </div>
  );
}
