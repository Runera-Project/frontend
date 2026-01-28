import RecordHeader from '@/components/record/RecordHeader';
import StatsOverview from '@/components/record/StatsOverview';
import ActivityTabs from '@/components/record/ActivityTabs';
import ActivityList from '@/components/record/ActivityList';
import BottomNavigation from '@/components/BottomNavigation';

export default function ActivitiesPage() {
  return (
    <div className="min-h-screen bg-[#f5f7fa] pb-safe">
      <div className="mx-auto max-w-md">
        <RecordHeader />
        <StatsOverview />
        <ActivityTabs />
        <ActivityList />
        <BottomNavigation activeTab="Record" />
      </div>
    </div>
  );
}
