'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { signalingClient } from '../../../lib/webrtc/SignalingClient';
import { peerManager } from '../../../lib/webrtc/PeerManager';
import { useRoomStore } from '../../../store/roomStore';
import { RoomLayout } from '../../../components/room/RoomLayout';

export default function RoomPage() {
  const params = useParams();
  const roomCode = params.roomCode as string;

  useEffect(() => {
    if (!roomCode) return;

    console.log(`[RoomPage] Mounting page for room: ${roomCode}`);

    // Clear any previous error
    useRoomStore.getState().setError(null);

    // Optimistic room setup for instant sub-50ms UI rendering
    const code = roomCode.toUpperCase();
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const roomUrl = `${origin}/room/${code}`;
    useRoomStore.getState().setRoomData(code, roomUrl, [], Date.now() + 30 * 60 * 1000);

    // 1. Initialize PeerManager and event bindings
    peerManager.init();

    // 2. Join signaling server room (auto-creates if needed)
    signalingClient.joinRoom(code);

    // Cleanup on unmount
    return () => {
      console.log(`[RoomPage] Unmounting page for room: ${code}`);
      signalingClient.disconnect();
      peerManager.clearAll();
      useRoomStore.getState().clearRoom();
    };
  }, [roomCode]);

  // Always render RoomLayout — it handles connecting/waiting states internally
  return <RoomLayout />;
}
