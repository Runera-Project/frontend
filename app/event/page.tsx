import EventHeader from '@/components/event/EventHeader';
import SearchBar from '@/components/event/SearchBar';
import EventList from '@/components/event/EventList';
import BottomNavigation from '@/components/BottomNavigation';

export default function EventPage() {
  return (
    <div className="min-h-screen bg-[#f5f7fa] pb-safe">
      <div className="mx-auto max-w-md">
        <EventHeader />
        <SearchBar />
        <EventList />
        <BottomNavigation activeTab="Event" />
      </div>
    </div>
  );
}
