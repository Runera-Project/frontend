import { Calendar, MapPin, Lock, Users, Award } from 'lucide-react';
import Image from 'next/image';

interface EventCardProps {
  title: string;
  tier: string;
  date: string;
  location: string;
  required_rank: string;
  image: string;
  description: string;
  isLocked: boolean;
}

export default function EventCard({
  title,
  tier,
  date,
  location,
  required_rank,
  isLocked
}: EventCardProps) {
  const isEliteTier = tier.includes('Elite');
  
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-md transition-shadow hover:shadow-lg">
      {/* Event Image with Tier Badge */}
      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.15) 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
        </div>
        
        {/* Event Visual */}
        <div className={`relative flex h-full items-center justify-center transition-opacity ${isLocked ? 'opacity-50' : ''}`}>
          <div className="text-center">
            <div className="mb-3 text-6xl">
              {isEliteTier ? '⭐' : '🏃‍♂️'}
            </div>
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${
              isEliteTier 
                ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg' 
                : 'bg-blue-500 text-white shadow-md'
            }`}>
              <Award className="h-4 w-4" />
              {tier}
            </div>
          </div>
        </div>
        
        {/* Tier Badge - Top Left */}
        <div className="absolute left-3 top-3">
          <div className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold shadow-md backdrop-blur-sm ${
            isEliteTier 
              ? 'bg-white/95 text-gray-800' 
              : 'bg-blue-600/95 text-white'
          }`}>
            <Users className="h-3.5 w-3.5" />
            {isEliteTier ? 'ELITE TIER' : 'OPEN EVENT'}
          </div>
        </div>

        {/* Lock Overlay */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
            <div className="rounded-full bg-white/90 p-4 shadow-xl">
              <Lock className="h-8 w-8 text-gray-600" />
            </div>
          </div>
        )}
      </div>

      {/* Event Details */}
      <div className="p-5">
        <h3 className="mb-3 text-xl font-bold text-gray-900">{title}</h3>
        
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <span className="font-medium">{date}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
              <MapPin className="h-4 w-4 text-green-600" />
            </div>
            <span className="font-medium">{location}</span>
          </div>
        </div>

        {/* Action Section */}
        <div className="flex items-center justify-between pt-2">
          {isLocked ? (
            <>
              <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2">
                <Award className="h-4 w-4 text-red-500" />
                <span className="text-sm font-bold text-red-600">
                  {required_rank} Required
                </span>
              </div>
              <button
                disabled
                className="flex items-center gap-2 rounded-full bg-gray-200 px-6 py-2.5 text-sm font-bold text-gray-500 shadow-sm"
              >
                <Lock className="h-4 w-4" />
                Locked
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 ring-2 ring-white" />
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 ring-2 ring-white" />
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-400 text-xs font-bold text-white ring-2 ring-white">
                    +99
                  </div>
                </div>
              </div>
              <button className="rounded-full bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-3 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:scale-105">
                Join Now
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
