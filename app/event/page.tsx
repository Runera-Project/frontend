import EventHeader from '@/components/event/EventHeader';
import SearchBar from '@/components/event/SearchBar';
import EventList from '@/components/event/EventList';
import BottomNavigation from '@/components/BottomNavigation';
import BackendStatus from '@/components/BackendStatus';

export default function EventPage() {
  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <div className="mx-auto max-w-md pb-28">
        <EventHeader />
        
        {/* Backend Status */}
        <div className="px-4 mb-4">
          <BackendStatus />
        </div>
        
        <SearchBar />
        <EventList />
      </div>
      <BottomNavigation activeTab="Event" />
    </div>
  );
}
