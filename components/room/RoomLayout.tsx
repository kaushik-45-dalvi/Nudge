'use client';

import React, { useState } from 'react';
import { useRoomStore } from '../../store/roomStore';
import { usePeerStore } from '../../store/peerStore';
import { useTransferStore } from '../../store/transferStore';
import { DropZone } from './DropZone';
import { TextInput } from './TextInput';
import { TransferFeed } from './TransferFeed';
import { QRCodeOverlay } from './QRCodeOverlay';
import { RoomExpiry } from './RoomExpiry';
import { DeviceBadge } from '../common/DeviceIcon';
import { FeedbackModal } from '../common/FeedbackModal';
import { Copy, QrCode, LogOut, Users, Menu, X, Lightbulb, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatRoomCode } from '../../lib/utils/roomCode';

/* ── tiny rainbow bar with yellow light glow ─────── */
function RainbowBar() {
  return (
    <div style={{ height: 6, background: 'linear-gradient(to right,#FFF5A5 0%, #FFD000 15%, #FFB020 30%, #F97316 45%, #EF4444 60%, #E8321A 75%, #8B0000 100%)', borderRadius: 99, boxShadow: '0 -2px 10px rgba(255, 208, 0, 0.7)' }} />
  );
}

/* ── status dot ───────────────────────────────────── */
function Dot({ color }: { color: string }) {
  return <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />;
}

export function RoomLayout() {
  const router = useRouter();

  const roomCode     = useRoomStore(s => s.roomCode);
  const roomUrl      = useRoomStore(s => s.roomUrl);
  const localDevice  = useRoomStore(s => s.localDevice);
  const devices      = useRoomStore(s => s.devices);
  const socketConnected = useRoomStore(s => s.socketConnected);

  const peerStates   = usePeerStore(s => s.peerStates);
  const transfers    = useTransferStore(s => s.transfers);

  const [isQROpen, setIsQROpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [copied, setCopied]     = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleCopyLink = () => {
    if (!roomUrl) return;
    navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExit = () => router.push('/');

  const activeTransfers = Object.values(transfers).filter(t => t.status === 'transferring');

  /* ── SIDEBAR CONTENT (shared between desktop inline and mobile drawer) ── */
  const SidebarContent = () => (
    <>
      {/* Devices panel */}
      <div className="dashed-card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 12, borderBottom: '1px dashed #D0CCC8' }}>
          <Users size={15} color="#6B6560" />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B6560' }}>Devices in Room</span>
        </div>

        {/* My device */}
        {localDevice && (
          <div style={{ background: '#F8F8F6', border: '1px solid #ECEAE6', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#B8B5AE', marginBottom: 6 }}>You</div>
            <DeviceBadge iconType={localDevice.emoji} nickname={localDevice.nickname} label={localDevice.label} />
          </div>
        )}

        {/* Peers */}
        <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#F97316', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Connected Peers</span>
          <span style={{ background: '#FFF4F0', color: '#E8321A', padding: '1px 6px', borderRadius: 4, fontSize: '0.55rem' }}>WiFi P2P</span>
        </div>
        {devices.length === 0 ? (
          <div style={{ border: '1.5px dashed #F97316', borderRadius: 8, padding: '16px 12px', textAlign: 'center', background: '#FFFDFB' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/waiting-devices.png"
              alt="Waiting for devices"
              style={{ width: 80, height: 80, margin: '0 auto 8px', objectFit: 'contain' }}
            />
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0A0A0A' }}>
              Waiting for peer…
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#9B9791', marginTop: 4, lineHeight: 1.4 }}>
              Share the link or QR code to start sending.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {devices.map(device => {
              const state = peerStates[device.socketId] || 'new';
              const dotColor = state === 'connected' ? '#22C55E' : state === 'connecting' ? '#F59E0B' : '#D0CCC8';
              return (
                <div key={device.socketId} style={{ border: '1px solid #ECEAE6', borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff' }}>
                  <DeviceBadge iconType={device.emoji} nickname={device.nickname} label={device.label} />
                  <Dot color={dotColor} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick tips */}
      <div className="dashed-card" style={{ padding: 20 }}>
        <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B6560', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Lightbulb size={14} color="#F59E0B" />
          <span>Quick Tips</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            'Open this URL on your phone to pair',
            'Drag & drop files or paste screenshots',
            'Files go directly — nothing is uploaded',
          ].map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, fontSize: '0.75rem', color: '#6B6560', lineHeight: 1.5 }}>
              <span style={{ color: '#D0CCC8', flexShrink: 0 }}>{i + 1}.</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', color: '#0A0A0A', display: 'flex', flexDirection: 'column' }}>

      {/* Expiry banner */}
      <RoomExpiry />

      {/* ── HEADER ────────────────────────────────────── */}
      <header style={{ borderBottom: '1px solid #ECEAE6', padding: '0 12px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#fff', zIndex: 30 }}>
        {/* Left: logo + room code */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="sidebar-toggle-btn"
            style={{ background: '#F8F8F6', border: '1px solid #ECEAE6', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', display: 'none', alignItems: 'center', color: '#0A0A0A', flexShrink: 0 }}
            title="Room devices & info"
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>

          <span
            onClick={handleExit}
            style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.2rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}
          >
            nudge<span style={{ color: '#E8321A' }}>.</span>
          </span>

          {roomCode && (
            <div style={{ background: '#F8F8F6', border: '1px solid #ECEAE6', borderRadius: 6, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 5, minWidth: 0, overflow: 'hidden' }}>
              <Dot color={socketConnected ? '#22C55E' : '#EF4444'} />
              <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.04em', color: '#3A3633', textTransform: 'uppercase', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {formatRoomCode(roomCode)}
              </span>
            </div>
          )}
        </div>

        {/* Right: actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {activeTransfers.length > 0 && (
            <div className="hide-on-mobile" style={{ background: '#FFF4F0', border: '1px solid #F97316', borderRadius: 6, padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700, color: '#E8321A' }}>
              ↑ {activeTransfers.length} transfer{activeTransfers.length > 1 ? 's' : ''} active
            </div>
          )}

          {roomUrl && (
            <>
              <button
                onClick={handleCopyLink}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: copied ? '#F97316' : '#0A0A0A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 6,
                  padding: '7px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Copy size={13} />
                <span className="hide-on-mobile">{copied ? 'Link Copied! ✓' : 'Copy Room Link'}</span>
              </button>
              <button
                onClick={() => setIsQROpen(true)}
                style={{ background: '#F8F8F6', border: '1px solid #ECEAE6', borderRadius: 6, padding: '7px 9px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#0A0A0A' }}
                title="Scan QR Code"
              >
                <QrCode size={15} />
              </button>
            </>
          )}

          <button
            onClick={() => setIsFeedbackOpen(true)}
            style={{ background: '#F8F8F6', border: '1px solid #ECEAE6', borderRadius: 6, padding: '7px 9px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#0A0A0A', fontSize: '0.75rem', fontWeight: 600 }}
            title="Send Feedback"
          >
            <MessageSquare size={14} color="#E8321A" />
            <span className="hide-on-mobile">Feedback</span>
          </button>

          <button
            onClick={handleExit}
            style={{ background: '#FFF0F0', border: '1px solid #FECACA', borderRadius: 6, padding: '6px 9px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#EF4444' }}
            title="Leave Room"
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* ── MOBILE SIDEBAR DRAWER ─────────────────────── */}
      {sidebarOpen && (
        <div className="mobile-sidebar-overlay" onClick={() => setSidebarOpen(false)}>
          <div className="mobile-sidebar-drawer" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #ECEAE6' }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Room Information</span>
                <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <X size={16} />
                </button>
              </div>
              <SidebarContent />
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ──────────────────────────────── */}
      <div className="room-main-grid" style={{ flex: 1, maxWidth: 1200, width: '100%', margin: '0 auto', padding: '20px 16px' }}>

        {/* ── SIDEBAR (Desktop) ────────────────────────── */}
        <aside className="desktop-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SidebarContent />
        </aside>

        {/* ── WORKSPACE ───────────────────────────────── */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
          {/* Top row: dropzone + text */}
          <div className="workspace-top-grid">
            <DropZone />
            <TextInput />
          </div>

          {/* Rainbow strip */}
          <RainbowBar />

          {/* Transfer history */}
          <TransferFeed />
        </main>
      </div>

      {/* ── FOOTER STATUS ─────────────────────────────── */}
      <footer style={{ borderTop: '1px solid #ECEAE6', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8F8F6' }}>
        <span style={{ fontSize: '0.75rem', color: '#9B9791' }}>
          Room: <strong style={{ color: socketConnected ? '#22C55E' : '#EF4444' }}>{socketConnected ? 'Online ✓' : 'Offline ✗'}</strong>
        </span>
        <span className="hide-on-mobile" style={{ fontSize: '0.75rem', color: '#B8B5AE' }}>End-to-end · Local WiFi · Zero Cloud</span>
      </footer>

      {/* QR overlay */}
      {roomUrl && (
        <QRCodeOverlay isOpen={isQROpen} roomUrl={roomUrl} roomCode={roomCode || ''} onClose={() => setIsQROpen(false)} />
      )}

      {/* Feedback modal */}
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </div>
  );
}
