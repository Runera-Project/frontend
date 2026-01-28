import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileIdentityCard from '@/components/profile/ProfileIdentityCard';
import RankProgressCard from '@/components/profile/RankProgressCard';
import StatsOverview from '@/components/profile/StatsOverview';
import AchievementsSection from '@/components/profile/AchievementsSection';
import BottomNavigation from '@/components/BottomNavigation';

export default function ProfilePage() {
  // TODO: Get selected banner skin from shared state/context
  const selectedBannerGradient = 'from-purple-600 via-pink-500 to-red-500';

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <div className="mx-auto max-w-md pb-28">
        <ProfileHeader />
        <ProfileIdentityCard bannerGradient={selectedBannerGradient} />
        <RankProgressCard />
        <StatsOverview />
        <AchievementsSection />
      </div>
      <BottomNavigation activeTab="User" />
    </div>
  );
}
