import { Settings } from 'lucide-react';

export default function ProfileHeader() {
  return (
    <header className="flex items-center justify-between px-6 pt-6 pb-4">
      <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
      <button className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm transition-all hover:shadow-md">
        <Settings className="h-6 w-6 text-gray-600" />
      </button>
    </header>
  );
}
