'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Zap, Shield, Share2, MessageSquare } from 'lucide-react';
import { generateRoomCode } from '../../lib/utils/roomCode';
import { FeedbackModal } from '../common/FeedbackModal';

const STRIPE_COLORS = [
  '#FFD000',
  '#FFB020',
  '#F97316',
  '#EF4444',
  '#E8321A',
  '#C41A00',
  '#8B0000',
];

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  hasStripe?: boolean;
  imageSrc?: string;
}

function FeatureCard({ icon, title, desc, hasStripe = false, imageSrc }: FeatureCardProps) {
  return (
    <div className="dashed-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 200 }}>
      <div style={{ padding: 24, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.1rem', fontWeight: 400, color: '#0A0A0A', lineHeight: 1.3, margin: 0 }}>
            {title}
          </h3>
          <div className="icon-box" style={{ marginLeft: 12 }}>{icon}</div>
        </div>
        {imageSrc && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={imageSrc} alt={title} style={{ width: '100%', height: 100, objectFit: 'contain', marginBottom: 12 }} />
        )}
        <p style={{ fontSize: '0.8125rem', color: '#6B6560', lineHeight: 1.6 }}>{desc}</p>
      </div>
      {hasStripe ? (
        <div style={{ position: 'relative', height: 72, overflow: 'hidden', boxShadow: '0 -4px 16px rgba(255, 208, 0, 0.45)' }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', transform: 'skewX(-10deg)', transformOrigin: 'right center', left: '-15%', right: '-5%' }}>
            {/* Top yellow glowing light beam */}
            <div style={{ height: 3, background: 'linear-gradient(to right, #FFF5A5, #FFD000, #FFB020, #FFF5A5)', boxShadow: '0 0 10px #FFD000', flexShrink: 0 }} />
            {STRIPE_COLORS.map((c, i) => (
              <div key={i} style={{ backgroundColor: c, flex: 1 }} />
            ))}
          </div>
        </div>
      ) : (
        <div style={{ height: 24 }} />
      )}
    </div>
  );
}

import { Navbar } from './Navbar';

export function Hero() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const handleCreateRoom = () => {
    setIsCreating(true);
    const code = generateRoomCode();
    router.push('/room/' + code);
  };

  const handleJoinRoom = (e: FormEvent) => {
    e.preventDefault();
    setJoinError('');
    const code = roomCode.trim().toUpperCase();
    if (!code) {
      setJoinError('Please enter a room code');
      return;
    }
    router.push('/room/' + code);
  };

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#FFFFFF', color: '#0A0A0A', minHeight: '100vh' }}>

      {/* ── NAVBAR ──────────────────────────────────── */}
      <Navbar />

      <main>
        {/* ═══════════════════════════════════════════════════════
            HERO BLOCK — 100% Responsive Flex/Grid Layout
        ═══════════════════════════════════════════════════════ */}
        <div style={{ background: '#FFFFFF' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 32px 32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 40, alignItems: 'center' }}>

              {/* Left: Text & CTA */}
              <div style={{ maxWidth: 540 }}>
                <div className="label-tag" style={{ marginBottom: 16 }}>Local P2P Transfer</div>
                <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(2.4rem, 4vw, 3.5rem)', fontWeight: 400, lineHeight: 1.06, letterSpacing: '-0.02em', marginBottom: 20, color: '#0A0A0A' }}>
                  Nudge files to any<br />device. Same WiFi.<br /><span style={{ color: '#E8321A' }}>Instantly.</span>
                </h1>
                <p style={{ fontSize: '0.95rem', color: '#5A5650', lineHeight: 1.65, maxWidth: 440, marginBottom: 28 }}>
                  Open Nudge on two devices on the same network. Drag, drop, and nudge. No accounts. No cloud uploads. Files stream peer-to-peer directly between browsers.
                </p>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 36 }}>
                  <button
                    onClick={handleCreateRoom}
                    disabled={isCreating}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '10px 22px',
                      background: '#0A0A0A',
                      color: '#FFFFFF',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      letterSpacing: '0.02em',
                      borderRadius: 6,
                      border: '1.5px solid #0A0A0A',
                      cursor: isCreating ? 'not-allowed' : 'pointer',
                      opacity: isCreating ? 0.7 : 1,
                      transition: 'all 0.15s ease',
                      fontFamily: 'Inter, system-ui, sans-serif'
                    }}
                  >
                    {isCreating ? 'Creating…' : 'Create a Room'}
                    {!isCreating && <ArrowRight size={15} />}
                  </button>
                  <button onClick={() => router.push('/how-it-works')} className="btn-outline">See How It Works</button>
                </div>

                <div style={{ paddingTop: 20, borderTop: '1px solid #ECEAE6' }}>
                  <p style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9B9791', marginBottom: 12 }}>
                    SUPPORTED ON ALL BROWSERS &amp; OS
                  </p>
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                    {['Windows', 'macOS', 'Android', 'iOS', 'Linux'].map((p) => (
                      <span key={p} style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#3A3633' }}>{p}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Illustration naturally centered */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/hero-illustration.png"
                  alt="P2P file transfer illustration"
                  style={{ width: '100%', maxWidth: 640, height: 'auto', objectFit: 'contain' }}
                />
              </div>

            </div>
          </div>

          {/* ── RAINBOW STRIPES WITH GOLDEN YELLOW TOP GLOW ── */}
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', position: 'relative', boxShadow: '0 -6px 24px rgba(255, 208, 0, 0.55)' }}>
            {/* Top yellow light beam */}
            <div style={{ height: 3, background: 'linear-gradient(to right, #FFF5A5, #FFD000, #FFB020, #FFF5A5)', boxShadow: '0 0 14px #FFD000' }} />
            {STRIPE_COLORS.map((c, i) => (
              <div key={i} style={{ backgroundColor: c, height: 16 }} />
            ))}
          </div>

          {/* ── BLACK BAND ── */}
          <div style={{ background: '#0A0A0A', padding: '32px 32px 36px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#E8321A' }} />
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B6560' }}>
                  ENTERPRISE P2P SYSTEMS
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#9B9791', lineHeight: 1.6, maxWidth: 480, margin: 0 }}>
                Nudge transfers files directly between browsers at local WiFi speed — zero cloud relay, zero account setup, zero latency.
              </p>
            </div>
          </div>
        </div>

        {/* ── JOIN ROOM ─────────────────────────────── */}
        <div style={{ background: '#F8F8F6', borderTop: '1px solid #ECEAE6', borderBottom: '1px solid #ECEAE6', padding: '48px 32px' }}>
          <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
            <div className="label-tag" style={{ marginBottom: 14, justifyContent: 'center' }}>Join an Existing Room</div>
            <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.85rem', fontWeight: 400, lineHeight: 1.1, marginBottom: 8 }}>
              Have a room code?
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#6B6560', marginBottom: 24 }}>
              Enter the code shared by your peer to join their session instantly.
            </p>
            <form onSubmit={handleJoinRoom} className="hero-join-form" style={{ display: 'flex', gap: 8, maxWidth: 460, margin: '0 auto' }}>
              <input
                id="room-code-input"
                type="text"
                value={roomCode}
                onChange={(e) => {
                  setJoinError('');
                  setRoomCode(e.target.value);
                }}
                placeholder="e.g. BLUE-DUCK-7"
                style={{ flex: 1, padding: '12px 16px', border: '1.5px solid #D0CCC8', borderRadius: 6, fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.04em', outline: 'none', background: 'white', color: '#0A0A0A', fontFamily: 'Inter, sans-serif' }}
              />
              <button type="submit" className="btn-primary" style={{ flexShrink: 0 }}>
                Join Room
              </button>
            </form>
            {joinError && <p style={{ color: '#E8321A', fontSize: '0.8125rem', marginTop: 8, fontWeight: 500 }}>⚠ {joinError}</p>}
          </div>
        </div>

        {/* ── FEATURE CARDS ──────────────────────────── */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 32px' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="label-tag" style={{ justifyContent: 'center', marginBottom: 12 }}>Why Nudge</div>
            <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(1.8rem, 2.8vw, 2.4rem)', fontWeight: 400, lineHeight: 1.1, maxWidth: 560, margin: '0 auto' }}>
              The simplest way to move files between your devices.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <FeatureCard hasStripe imageSrc="/transfer-illustration.png" icon={<Zap size={16} color="#E8321A" />} title="Ultra Fast Transfers" desc="Files stream directly over WebRTC. Speed is capped only by your local WiFi — typically 50–200 MB/s with zero relay latency." />
            <FeatureCard icon={<Shield size={16} color="#0A0A0A" />} title="Zero Cloud Storage" desc="Your files never touch our servers. Everything transfers peer-to-peer directly between browsers, keeping your data completely private." />
            <FeatureCard imageSrc="/wifi-illustration.png" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>} title="Any Device, Any OS" desc="Works on iPhone, Android, Mac, Windows, Linux — if it runs a browser, Nudge works. No app install, no driver, no pairing dance." />
            <FeatureCard icon={<Share2 size={16} color="#0A0A0A" />} title="Instant Peer Pairing" desc="One click creates a room. Share the code or QR. The second device joins and you're immediately connected and ready to transfer." />
          </div>
        </div>

        {/* ── HOW IT WORKS (Pale dull white background #F8F8F6) ── */}
        <div style={{ background: '#F8F8F6', borderTop: '1px solid #ECEAE6', borderBottom: '1px solid #ECEAE6', padding: '56px 32px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ marginBottom: 40, textAlign: 'center' }}>
              <div className="label-tag" style={{ justifyContent: 'center', marginBottom: 12 }}>
                How It Works
              </div>
              <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(1.8rem, 2.8vw, 2.4rem)', fontWeight: 400, color: '#0A0A0A', lineHeight: 1.1 }}>
                From demand to delivery.
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              {[
                { n: '01', title: 'Open Nudge', desc: 'Go to the Nudge URL on your first device and click "Create a Room". You get a shareable code instantly.' },
                { n: '02', title: 'Share the Code', desc: 'Send the room code via any channel — chat, email, or just show the QR code. The other device opens the same link.' },
                { n: '03', title: 'Transfer Instantly', desc: 'Drop files, paste text, share links. Everything moves directly between your browsers at full WiFi speed.' },
              ].map(({ n, title, desc }) => (
                <div key={n} className="dashed-card" style={{ padding: '28px 24px', background: '#FFFFFF' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.12em', color: '#E8321A', marginBottom: 12, display: 'block' }}>{n}</span>
                  <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.2rem', fontWeight: 400, color: '#0A0A0A', marginBottom: 8 }}>{title}</h3>
                  <p style={{ fontSize: '0.8125rem', color: '#6B6560', lineHeight: 1.6 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom stripes with yellow top glow */}
        <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 -4px 18px rgba(255, 208, 0, 0.5)' }}>
          <div style={{ height: 3, background: 'linear-gradient(to right, #FFF5A5, #FFD000, #FFB020, #FFF5A5)', boxShadow: '0 0 10px #FFD000' }} />
          {STRIPE_COLORS.map((c, i) => (
            <div key={i} style={{ backgroundColor: c, height: 10 }} />
          ))}
        </div>

        {/* ── FOOTER ─────────────────────────────────── */}
        <footer style={{ background: '#0A0A0A', borderTop: '1px solid #1E1E1E', padding: '32px 32px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.2rem', fontWeight: 700, color: 'white' }}>
                nudge<span style={{ color: '#FFB020' }}>.</span>
              </span>
              <p style={{ fontSize: '0.75rem', color: '#4B4845', marginTop: 4 }}>© {new Date().getFullYear()} Nudge · Built for speed</p>
            </div>
            <div style={{ display: 'flex', gap: 36 }}>
              {[
                { v: '100%', s: 'peer-to-peer' },
                { v: '0 MB', s: 'cloud storage' },
                { v: 'Unlimited', s: 'file size limit' },
              ].map(({ v, s }) => (
                <div key={s} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.15rem', color: 'white', fontWeight: 700 }}>{v}</div>
                  <div style={{ fontSize: '0.6875rem', color: '#4B4845', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 2 }}>{s}</div>
                </div>
              ))}
            </div>
          </div>
        </footer>
      </main>
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </div>
  );
}
