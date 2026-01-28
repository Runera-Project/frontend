import EventHeader from '@/components/event/EventHeader';
import SearchBar from '@/components/event/SearchBar';
import EventList from '@/components/event/EventList';
import BottomNavigation from '@/components/BottomNavigation';

export default function EventPage() {
  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <div className="mx-auto max-w-md pb-28">
        <EventHeader />
        <SearchBar />
        <EventList />
      </div>
      <BottomNavigation activeTab="Event" />
    </div>
  );
}
