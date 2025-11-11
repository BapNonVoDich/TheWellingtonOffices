'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function SessionTimeout() {
  const { data: session, update } = useSession();
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!session?.expires) return;

    const checkSession = () => {
      const expires = new Date(session.expires).getTime();
      const now = Date.now();
      const remaining = Math.floor((expires - now) / 1000); // seconds

      if (remaining <= 0) {
        // Session expired
        signOut({ redirect: true, callbackUrl: '/login' });
        return;
      }

      setTimeRemaining(remaining);

      // Show warning when less than 5 minutes remaining
      if (remaining < 5 * 60 && remaining > 0) {
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    };

    // Check immediately
    checkSession();

    // Check every 30 seconds
    const interval = setInterval(checkSession, 30000);

    // Try to refresh session if it's about to expire (within 10 minutes)
    const refreshInterval = setInterval(async () => {
      const expires = new Date(session.expires).getTime();
      const now = Date.now();
      const remaining = Math.floor((expires - now) / 1000);

      // Refresh if less than 10 minutes remaining
      if (remaining < 10 * 60 && remaining > 0) {
        try {
          await update(); // Refresh session
        } catch (error) {
          console.error('Failed to refresh session:', error);
        }
      }
    }, 60000); // Check every minute

    return () => {
      clearInterval(interval);
      clearInterval(refreshInterval);
    };
  }, [session, update]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleExtendSession = async () => {
    try {
      await update();
      setShowWarning(false);
    } catch (error) {
      console.error('Failed to extend session:', error);
    }
  };

  if (!session || !showWarning) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-yellow-800 mb-1">
            Phiên đăng nhập sắp hết hạn
          </h3>
          <p className="text-xs text-yellow-700 mb-2">
            Phiên đăng nhập của bạn sẽ hết hạn sau: <strong>{formatTime(timeRemaining || 0)}</strong>
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleExtendSession}
              className="px-3 py-1.5 text-xs font-medium bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
            >
              Gia hạn phiên
            </button>
            <button
              onClick={() => {
                setShowWarning(false);
                signOut({ redirect: true, callbackUrl: '/login' });
              }}
              className="px-3 py-1.5 text-xs font-medium bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowWarning(false)}
          className="ml-2 text-yellow-600 hover:text-yellow-800"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

