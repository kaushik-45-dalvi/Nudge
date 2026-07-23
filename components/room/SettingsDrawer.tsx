'use client';

import React, { useState, useEffect } from 'react';
import { X, Moon, Sun, Monitor, Volume2, VolumeX, UserCheck, ShieldAlert } from 'lucide-react';
import { useRoomStore } from '../../store/roomStore';
import { signalingClient } from '../../lib/webrtc/SignalingClient';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
  const localDevice = useRoomStore((state) => state.localDevice);
  const [nickname, setNickname] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Initialize nickname
  useEffect(() => {
    if (localDevice) {
      setNickname(localDevice.nickname);
    }
  }, [localDevice]);

  // Load settings on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('nudge-theme') as 'light' | 'dark' | 'system';
    if (savedTheme) setTheme(savedTheme);

    const savedSound = localStorage.getItem('nudge-sound');
    if (savedSound) setSoundEnabled(savedSound === 'true');
  }, []);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('nudge-theme', newTheme);

    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark');
    } else if (newTheme === 'light') {
      root.setAttribute('data-theme', 'light');
      root.classList.remove('dark');
    } else {
      root.removeAttribute('data-theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const handleSoundToggle = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    localStorage.setItem('nudge-sound', String(nextState));
  };

  const handleSaveNickname = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      signalingClient.renameDevice(nickname.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Sliding Drawer Container */}
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white dark:bg-zinc-900 border-l border-slate-200 dark:border-zinc-800 flex flex-col shadow-2xl animate-slide-in">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-slate-950 dark:text-white">Settings</h3>
            <button 
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-grow p-6 space-y-8 overflow-y-auto">
            {/* 1. Device Nickname Customization */}
            <form onSubmit={handleSaveNickname} className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Device Nickname
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g. 🦊 Red-Fox"
                  maxLength={30}
                  className="flex-grow px-4 py-2 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-950 dark:text-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-retro-black dark:bg-white text-white dark:text-retro-black hover:opacity-90 rounded-full text-xs font-bold flex items-center space-x-1"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </form>

            {/* 2. Theme Toggle Buttons */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Visual Theme
              </label>
              <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-zinc-800/50 p-1.5 rounded-full border border-slate-200 dark:border-zinc-800">
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`py-2 rounded-full text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                    theme === 'light' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Light</span>
                </button>

                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`py-2 rounded-full text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                    theme === 'dark' 
                      ? 'bg-zinc-900 dark:bg-zinc-800 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark</span>
                </button>

                <button
                  onClick={() => handleThemeChange('system')}
                  className={`py-2 rounded-full text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                    theme === 'system' 
                      ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>System</span>
                </button>
              </div>
            </div>

            {/* 3. Audio Notification Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800/30 rounded-2xl border border-slate-100 dark:border-zinc-800">
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-900 dark:text-white">Receive Alerts</div>
                <div className="text-xs text-slate-400 font-light">Play satisfying sound cue on successful file completion.</div>
              </div>
              <button
                onClick={handleSoundToggle}
                className={`p-2.5 rounded-full transition-all ${
                  soundEnabled 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-slate-200 dark:bg-zinc-800 text-slate-400'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </div>

            {/* 4. Privacy & Info */}
            <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 flex items-start space-x-3 leading-relaxed">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-1">Local P2P Stream Encryption</span>
                Files transfer strictly over local peer connections (WebRTC) and are secured by standard end-to-end DTLS protocols. Files never contact the cloud.
              </div>
            </div>

          </div>

          {/* Footer inside Drawer */}
          <div className="px-6 py-5 border-t border-slate-200 dark:border-zinc-800 text-center text-[10px] text-slate-400 font-light uppercase tracking-widest bg-slate-50 dark:bg-zinc-950">
            nudge v1.0.0
          </div>
        </div>
      </div>
    </div>
  );
}
