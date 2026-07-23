'use client';

import React, { useState, useEffect } from 'react';
import { useRoomStore } from '../../store/roomStore';
import { signalingClient } from '../../lib/webrtc/SignalingClient';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export function RoomExpiry() {
  const expiresAt = useRoomStore((state) => state.expiresAt);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!expiresAt) {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
    };

    updateTimer(); // run once immediately
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleExtendRoom = () => {
    console.log('[RoomExpiry] Extending room lifespan via keep-alive ping');
    signalingClient.sendPing();
  };

  // Only show the banner if room is expiring in under 2 minutes (120 seconds)
  if (timeLeft === null || timeLeft > 120 || timeLeft <= 0) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="bg-amber-500 text-retro-black px-6 py-2 flex items-center justify-between text-xs font-bold tracking-wide animate-pulse sticky top-0 z-50 shadow-md">
      <div className="flex items-center space-x-2">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        <span>Room expires in {formattedTime}. Keep it alive by refreshing the connection.</span>
      </div>
      <button
        onClick={handleExtendRoom}
        className="flex items-center space-x-1.5 px-3 py-1 bg-retro-black hover:bg-slate-800 text-white rounded-full text-[10px] font-extrabold uppercase transition-all shadow-sm active:scale-95"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Extend</span>
      </button>
    </div>
  );
}
