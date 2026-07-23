'use client';

import React, { useState } from 'react';
import { signalingClient } from '../../lib/webrtc/SignalingClient';
import { formatRoomCode } from '../../lib/utils/roomCode';

export function JoinRoomInput() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    // Format input (strip non-alpha, auto-dash, uppercase)
    const formatted = formatRoomCode(e.target.value);
    setCode(formatted);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!code) {
      setError('Please enter a room code');
      return;
    }

    // Standard Room Code format: CHARS-CHARS-NUMBER
    const parts = code.split('-');
    if (parts.length < 3) {
      setError('Code must be in BLUE-DUCK-7 format');
      return;
    }

    console.log(`[JoinRoomInput] Joining room: ${code}`);
    signalingClient.joinRoom(code);
  };

  return (
    <form onSubmit={handleJoin} className="space-y-3 text-left">
      <label htmlFor="room-code" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
        Have a room code?
      </label>
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        <input
          id="room-code"
          type="text"
          value={code}
          onChange={handleChange}
          placeholder="e.g. BLUE-DUCK-7"
          maxLength={30}
          className="flex-grow px-5 py-3 rounded-full border border-slate-200 text-sm font-semibold tracking-wide focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-slate-900 placeholder:text-slate-400"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-full font-bold text-sm tracking-wide transition-colors"
        >
          Join Room
        </button>
      </div>
      {error && (
        <span className="block text-xs text-retro-red font-semibold tracking-wide mt-1 pl-2 animate-pulse">
          ⚠️ {error}
        </span>
      )}
    </form>
  );
}
