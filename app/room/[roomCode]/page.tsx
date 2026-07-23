'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { signalingClient } from '../../../lib/webrtc/SignalingClient';
import { peerManager } from '../../../lib/webrtc/PeerManager';
import { useRoomStore } from '../../../store/roomStore';
import { RoomLayout } from '../../../components/room/RoomLayout';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.roomCode as string;

  const isConnecting = useRoomStore(s => s.isConnecting);
  const error = useRoomStore(s => s.error);
  const roomData = useRoomStore(s => s.roomCode);
  const socketConnected = useRoomStore(s => s.socketConnected);

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

  // Error state
  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontFamily: 'Inter, system-ui, sans-serif',
        background: '#FFFFFF'
      }}>
        <div style={{ textAlign: 'center', maxWidth: 420, padding: '0 24px' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: '#FFF0F0', border: '2px solid #FECACA',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', color: '#EF4444'
          }}>
            <AlertCircle size={28} />
          </div>
          <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.6rem', fontWeight: 400, marginBottom: 8, color: '#0A0A0A' }}>
            Connection Error
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#6B6560', lineHeight: 1.6, marginBottom: 24 }}>
            {error}
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button
              onClick={() => {
                useRoomStore.getState().clearRoom();
                router.push('/');
              }}
              className="btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <ArrowLeft size={14} />
              Back to Home
            </button>
            <button
              onClick={() => {
                useRoomStore.getState().setError(null);
                useRoomStore.getState().setConnecting(true);
                peerManager.init();
                signalingClient.joinRoom(roomCode);
              }}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading / connecting state
  if (isConnecting && !roomData) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontFamily: 'Inter, system-ui, sans-serif',
        background: '#FFFFFF'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: '#F8F8F6', border: '1.5px solid #ECEAE6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', color: '#6B6560',
            animation: 'spin 1s linear infinite'
          }}>
            <Loader2 size={24} />
          </div>
          <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.3rem', fontWeight: 400, marginBottom: 6, color: '#0A0A0A' }}>
            Connecting to Room
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#9B9791' }}>
            Joining <strong style={{ color: '#3A3633', letterSpacing: '0.04em' }}>{roomCode.toUpperCase()}</strong>…
          </p>
        </div>
      </div>
    );
  }

  return <RoomLayout />;
}
