'use client';

import { Lock, Trophy, Zap } from 'lucide-react';
import type { Achievement } from '@/hooks/useAchievements';
import { useClaimAchievement } from '@/hooks/useClaimAchievement';
import { useState } from 'react';
import { useModal } from '@/hooks/useModal';
import Modal from './Modal';

interface AchievementCardProps {
  achievement: Achievement;
  size?: 'small' | 'medium' | 'large';
}

const TIER_COLORS = {
  1: 'from-amber-700 to-amber-900',   // Bronze
  2: 'from-gray-400 to-gray-600',     // Silver
  3: 'from-yellow-400 to-yellow-600', // Gold
  4: 'from-cyan-400 to-cyan-600',     // Platinum
  5: 'from-blue-400 to-purple-600',   // Diamond
};

const TIER_NAMES = {
  1: 'Bronze',
  2: 'Silver',
  3: 'Gold',
  4: 'Platinum',
  5: 'Diamond',
};

export default function AchievementCard({ achievement, size = 'medium' }: AchievementCardProps) {
  const progress = Math.min((achievement.progress / achievement.total) * 100, 100);
  const tierGradient = TIER_COLORS[achievement.tier];
  const modal = useModal();
  const tierName = TIER_NAMES[achievement.tier];
  const { claimAchievement, isLoading: isClaiming } = useClaimAchievement();
  const [claimed, setClaimed] = useState(false);

  const handleClaim = async () => {
    try {
      console.log('🎯 Claiming achievement:', achievement.id);
      
      // Call claim with achievement ID and tier
      // The hook will handle conversion to bytes32 and metadata hash generation
      const result = await claimAchievement(achievement.id, achievement.tier);
      
      setClaimed(true);
      
      modal.success(
        'Achievement Claimed! 🎉',
        `NFT minted successfully!\n\nAchievement: ${achievement.name}\nTier: ${TIER_NAMES[achievement.tier]}\nReward: +${achievement.reward.xp} XP\n\nTx: ${result.hash.slice(0, 10)}...`
      );
    } catch (error: any) {
      console.error('❌ Claim failed:', error);
      modal.error('Claim Failed', `Failed to claim achievement!\n\nError: ${error.message}`);
    }
  };

  if (size === 'small') {
    return (
      <div
        className={`relative overflow-hidden rounded-xl p-3 transition-all ${
          achievement.unlocked
            ? 'bg-gradient-to-br ' + tierGradient + ' shadow-lg'
            : 'bg-gray-100 opacity-60'
        }`}
      >
        {!achievement.unlocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Lock className="h-6 w-6 text-white" />
          </div>
        )}
        <div className="text-center">
          <div className="mb-1 text-2xl">{achievement.icon}</div>
          <p className={`text-xs font-semibold ${achievement.unlocked ? 'text-white' : 'text-gray-600'}`}>
            {achievement.name}
          </p>
        </div>
      </div>
    );
  }

  if (size === 'large') {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl p-6 transition-all ${
          achievement.unlocked
            ? 'bg-gradient-to-br ' + tierGradient + ' shadow-xl'
            : 'border-2 border-gray-200 bg-white'
        }`}
      >
        {!achievement.unlocked && (
          <div className="absolute right-4 top-4">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
        )}

        <div className="mb-4 flex items-start gap-4">
          <div
            className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl text-4xl ${
              achievement.unlocked ? 'bg-white/20' : 'bg-gray-100'
            }`}
          >
            {achievement.icon}
          </div>
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h3
                className={`text-lg font-bold ${
                  achievement.unlocked ? 'text-white' : 'text-gray-900'
                }`}
              >
                {achievement.name}
              </h3>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  achievement.unlocked
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tierName}
              </span>
            </div>
            <p
              className={`text-sm ${
                achievement.unlocked ? 'text-white/90' : 'text-gray-600'
              }`}
            >
              {achievement.description}
            </p>
          </div>
        </div>

        {!achievement.unlocked && (
          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-semibold text-gray-900">
                {achievement.progress.toFixed(0)} / {achievement.total} {achievement.requirement.unit}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className={`h-4 w-4 ${achievement.unlocked ? 'text-white' : 'text-yellow-500'}`} />
            <span
              className={`text-sm font-semibold ${
                achievement.unlocked ? 'text-white' : 'text-gray-900'
              }`}
            >
              +{achievement.reward.xp} XP
            </span>
          </div>
          {achievement.unlocked && !claimed && (
            <button
              onClick={handleClaim}
              disabled={isClaiming}
              className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm transition-all hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isClaiming ? 'Claiming...' : 'Claim NFT'}
            </button>
          )}
          {achievement.unlocked && claimed && (
            <span className="text-xs text-white/80">✓ Claimed</span>
          )}
          {achievement.unlocked && !claimed && achievement.unlockedAt && (
            <span className="text-xs text-white/80">
              Unlocked {achievement.unlockedAt.toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Medium size (default)
  return (
    <div
      className={`relative overflow-hidden rounded-xl p-4 transition-all ${
        achievement.unlocked
          ? 'bg-gradient-to-br ' + tierGradient + ' shadow-lg'
          : 'border-2 border-gray-200 bg-white'
      }`}
    >
      {!achievement.unlocked && (
        <div className="absolute right-3 top-3">
          <Lock className="h-4 w-4 text-gray-400" />
        </div>
      )}

      <div className="mb-3 flex items-center gap-3">
        <div
          className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-2xl ${
            achievement.unlocked ? 'bg-white/20' : 'bg-gray-100'
          }`}
        >
          {achievement.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className={`truncate text-sm font-bold ${
              achievement.unlocked ? 'text-white' : 'text-gray-900'
            }`}
          >
            {achievement.name}
          </h3>
          <p
            className={`truncate text-xs ${
              achievement.unlocked ? 'text-white/80' : 'text-gray-600'
            }`}
          >
            {achievement.description}
          </p>
        </div>
      </div>

      {!achievement.unlocked && (
        <div className="mb-2">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-gray-500">
              {achievement.progress.toFixed(0)} / {achievement.total}
            </span>
            <span className="font-semibold text-gray-700">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Zap className={`h-3.5 w-3.5 ${achievement.unlocked ? 'text-white' : 'text-yellow-500'}`} />
          <span
            className={`text-xs font-semibold ${
              achievement.unlocked ? 'text-white' : 'text-gray-900'
            }`}
          >
            +{achievement.reward.xp} XP
          </span>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            achievement.unlocked
              ? 'bg-white/20 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {tierName}
        </span>
      </div>
      
      {/* Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={modal.closeModal}
        title={modal.config.title}
        message={modal.config.message}
        type={modal.config.type}
        confirmText={modal.config.confirmText}
        cancelText={modal.config.cancelText}
        onConfirm={modal.config.onConfirm}
        showCancel={modal.config.showCancel}
      />
    </div>
  );
}
