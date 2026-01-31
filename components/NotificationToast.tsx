'use client';

import { useEffect, useState } from 'react';
import { X, Trophy, TrendingUp, Award, Zap } from 'lucide-react';

export type NotificationType = 'achievement' | 'tier_upgrade' | 'quest_complete' | 'event_joined';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  xp?: number;
  icon?: string;
}

interface NotificationToastProps {
  notification: Notification;
  onClose: (id: string) => void;
}

export function NotificationToast({ notification, onClose }: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Slide in animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto close after 5 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(notification.id);
    }, 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'achievement':
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 'tier_upgrade':
        return <TrendingUp className="h-6 w-6 text-purple-500" />;
      case 'quest_complete':
        return <Award className="h-6 w-6 text-blue-500" />;
      case 'event_joined':
        return <Zap className="h-6 w-6 text-green-500" />;
      default:
        return <Trophy className="h-6 w-6 text-gray-500" />;
    }
  };

  const getGradient = () => {
    switch (notification.type) {
      case 'achievement':
        return 'from-yellow-400 to-orange-500';
      case 'tier_upgrade':
        return 'from-purple-400 to-pink-500';
      case 'quest_complete':
        return 'from-blue-400 to-cyan-500';
      case 'event_joined':
        return 'from-green-400 to-emerald-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <div
      className={`fixed top-20 right-5 z-50 w-80 max-w-[calc(100vw-2.5rem)] transform transition-all duration-300 ${
        isVisible && !isExiting
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      }`}
    >
      <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Gradient Header */}
        <div className={`h-1.5 bg-gradient-to-r ${getGradient()}`} />
        
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${getGradient()}`}>
              {notification.icon ? (
                <span className="text-2xl">{notification.icon}</span>
              ) : (
                getIcon()
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-gray-900 mb-0.5">
                {notification.title}
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                {notification.message}
              </p>
              {notification.xp && (
                <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-1">
                  <Zap className="h-3 w-3 text-yellow-600" />
                  <span className="text-xs font-bold text-yellow-700">
                    +{notification.xp} XP
                  </span>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="flex-shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Toast Container Component
interface ToastContainerProps {
  notifications: Notification[];
  onClose: (id: string) => void;
}

export function ToastContainer({ notifications, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-0 right-0 z-50 pointer-events-none">
      <div className="pointer-events-auto space-y-3">
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            style={{ marginTop: index * 8 }}
          >
            <NotificationToast
              notification={notification}
              onClose={onClose}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const showAchievement = (name: string, xp: number, icon?: string) => {
    addNotification({
      type: 'achievement',
      title: '🎉 Achievement Unlocked!',
      message: name,
      xp,
      icon,
    });
  };

  const showTierUpgrade = (newTier: string) => {
    addNotification({
      type: 'tier_upgrade',
      title: '⬆️ Tier Upgraded!',
      message: `Congratulations! You've reached ${newTier} tier!`,
    });
  };

  const showQuestComplete = (questName: string, xp: number) => {
    addNotification({
      type: 'quest_complete',
      title: '✅ Quest Completed!',
      message: questName,
      xp,
    });
  };

  const showEventJoined = (eventName: string) => {
    addNotification({
      type: 'event_joined',
      title: '🎯 Event Joined!',
      message: `You've joined ${eventName}`,
    });
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    showAchievement,
    showTierUpgrade,
    showQuestComplete,
    showEventJoined,
  };
}
