import Header from '@/components/Header';
import QuestCard from '@/components/QuestCard';
import ActivityFeed from '@/components/ActivityFeed';
import BottomNavigation from '@/components/BottomNavigation';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <div className="mx-auto max-w-md pb-28">
        <Header />
        <QuestCard />
        <ActivityFeed />
      </div>
      <BottomNavigation activeTab="Home" />
    </div>
  );
}
