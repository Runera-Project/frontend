'use client';

import SkinCard from './SkinCard';

interface Skin {
  id: number;
  name: string;
  type: string;
  owned: boolean;
  rarity?: string;
  gradient: string;
}

interface SkinCollectionProps {
  title: string;
  skins: Skin[];
  selectedSkinId: number | null;
  onSelectSkin: (skin: Skin) => void;
}

export default function SkinCollection({
  title,
  skins,
  selectedSkinId,
  onSelectSkin
}: SkinCollectionProps) {
  return (
    <div className="mb-8">
      <h2 className="mb-4 text-lg font-bold text-gray-900">{title}</h2>
      <div className="grid grid-cols-2 gap-4">
        {skins.map((skin) => (
          <SkinCard
            key={skin.id}
            {...skin}
            isSelected={selectedSkinId === skin.id}
            onSelect={() => onSelectSkin(skin)}
          />
        ))}
      </div>
    </div>
  );
}
