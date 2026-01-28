'use client';

import { useState } from 'react';
import MarketHeader from '@/components/market/MarketHeader';
import ProfilePreview from '@/components/market/ProfilePreview';
import PreviewTabs from '@/components/market/PreviewTabs';
import SkinCollection from '@/components/market/SkinCollection';
import BottomNavigation from '@/components/BottomNavigation';

interface Skin {
  id: number;
  name: string;
  type: string;
  owned: boolean;
  rarity?: string;
  gradient: string;
}

const allSkins: Skin[] = [
  {
    id: 1,
    name: 'Spacy Warp',
    type: 'background',
    owned: true,
    rarity: 'Epic',
    gradient: 'from-purple-900 via-blue-900 to-black'
  },
  {
    id: 2,
    name: 'Blurry Sunny',
    type: 'background',
    owned: true,
    rarity: 'Rare',
    gradient: 'from-orange-300 via-pink-300 to-purple-300'
  },
  {
    id: 3,
    name: 'Ocean Wave',
    type: 'background',
    owned: true,
    rarity: 'Rare',
    gradient: 'from-cyan-400 via-blue-500 to-indigo-600'
  },
  {
    id: 4,
    name: 'Sunset Glow',
    type: 'background',
    owned: true,
    rarity: 'Epic',
    gradient: 'from-yellow-400 via-orange-500 to-red-600'
  },
  {
    id: 5,
    name: 'Neon Grid',
    type: 'frame',
    owned: false,
    rarity: 'Epic',
    gradient: 'from-green-400 via-cyan-500 to-blue-600'
  },
  {
    id: 6,
    name: 'Galaxy Ring',
    type: 'frame',
    owned: false,
    rarity: 'Legendary',
    gradient: 'from-purple-600 via-pink-600 to-red-600'
  },
  {
    id: 7,
    name: 'Aurora Borealis',
    type: 'background',
    owned: false,
    rarity: 'Legendary',
    gradient: 'from-green-300 via-blue-400 to-purple-500'
  },
  {
    id: 8,
    name: 'Cyber Punk',
    type: 'frame',
    owned: false,
    rarity: 'Epic',
    gradient: 'from-pink-500 via-purple-600 to-indigo-700'
  }
];

export default function MarketPage() {
  const [activeTab, setActiveTab] = useState('Frames');
  const [selectedSkin, setSelectedSkin] = useState<Skin | null>(null);

  const ownedSkins = allSkins.filter(skin => skin.owned);
  const storeSkins = allSkins.filter(skin => !skin.owned);

  const handleSelectSkin = (skin: Skin) => {
    if (skin.owned) {
      setSelectedSkin(skin);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <div className="mx-auto max-w-md pb-28">
        <MarketHeader />
        <ProfilePreview selectedSkin={selectedSkin} />
        <PreviewTabs activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="px-5">
          <SkinCollection
            title="My Collection"
            skins={ownedSkins}
            selectedSkinId={selectedSkin?.id || null}
            onSelectSkin={handleSelectSkin}
          />
          
          <SkinCollection
            title="Store"
            skins={storeSkins}
            selectedSkinId={null}
            onSelectSkin={handleSelectSkin}
          />
        </div>
      </div>
      <BottomNavigation activeTab="Market" />
    </div>
  );
}
