'use client';

import React from 'react';
import { Navbar } from '../../components/landing/Navbar';
import { Footer } from '../../components/landing/Footer';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, Zap, Shield, QrCode, Clipboard, FileText,
  Share2, Clock, Smartphone, Globe, Lock, Gauge, Upload, Link2, RefreshCw
} from 'lucide-react';
import { generateRoomCode } from '../../lib/utils/roomCode';

const STRIPE_COLORS = ['#FFD000', '#FFB020', '#F97316', '#EF4444', '#E8321A', '#C41A00', '#8B0000'];

/* ─── Feature Card ─────────────────────────────────── */
function FeatureCard({ icon, title, desc, tag, color }: {
  icon: React.ReactNode; title: string; desc: string; tag?: string; color: string;
}) {
  return (
    <div className="dashed-card" style={{
      padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 14,
      transition: 'border-color 0.2s, transform 0.2s', cursor: 'default'
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-3px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#B8B5AE'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10, background: `${color}10`, border: `1.5px solid ${color}25`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color
        }}>
          {icon}
        </div>
        {tag && (
          <span style={{
            background: `${color}10`, color, border: `1px solid ${color}25`,
            borderRadius: 4, padding: '2px 8px', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase'
          }}>
            {tag}
          </span>
        )}
      </div>
      <div>
        <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.05rem', fontWeight: 400, color: '#0A0A0A', marginBottom: 6 }}>{title}</h3>
        <p style={{ fontSize: '0.8rem', color: '#6B6560', lineHeight: 1.6 }}>{desc}</p>
      </div>
    </div>
  );
}

/* ─── Comparison Row ──────────────────────────────── */
function ComparisonRow({ feature, nudge, others }: { feature: string; nudge: string; others: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 12, padding: '14px 0', borderBottom: '1px solid #F0EDEA', alignItems: 'center' }}>
      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0A0A0A' }}>{feature}</span>
      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#22C55E', textAlign: 'center' }}>{nudge}</span>
      <span style={{ fontSize: '0.8125rem', color: '#9B9791', textAlign: 'center' }}>{others}</span>
    </div>
  );
}

export default function FeaturesPage() {
  const router = useRouter();

  const handleCreateRoom = () => {
    const code = generateRoomCode();
    router.push('/room/' + code);
  };

  const features = [
    { icon: <Zap size={20} />, title: 'Ultra-Fast P2P Transfers', desc: 'Files stream directly between browsers. Speed is limited only by your WiFi — typically 50–200 MB/s with zero relay latency.', tag: 'Core', color: '#E8321A' },
    { icon: <Shield size={20} />, title: 'Zero Cloud Storage', desc: 'Your files never touch our servers. Everything transfers peer-to-peer directly between browsers, keeping your data completely private and under your control.', tag: 'Privacy', color: '#6366F1' },
    { icon: <Upload size={20} />, title: 'Drag & Drop Files', desc: 'Simply drag files onto the drop zone or click to browse. Supports any file format (photos, 4K videos, audio, PDFs, archives) with zero file size limits.', color: '#F97316' },
    { icon: <FileText size={20} />, title: 'Text & Link Sharing', desc: 'Send text snippets, code blocks, URLs, and notes. Links are auto-detected and rendered as clickable. Send with Ctrl+Enter.', color: '#22C55E' },
    { icon: <Clipboard size={20} />, title: 'Clipboard Sharing', desc: 'One-click clipboard share button reads your clipboard and sends the content instantly to connected peers. Perfect for quick sharing.', color: '#8B5CF6' },
    { icon: <QrCode size={20} />, title: 'QR Code Pairing', desc: 'Every room generates a QR code. Scan it with your phone camera to instantly join the room — no typing, no link sharing needed.', color: '#06B6D4' },
    { icon: <Smartphone size={20} />, title: 'Phone-to-Phone & Cross-Device', desc: 'Direct sharing between iPhone and Android phones, tablets, Mac, Windows, Linux — anything with a modern browser.', tag: 'Universal', color: '#F59E0B' },
    { icon: <Lock size={20} />, title: 'End-to-End DTLS Encryption', desc: 'All direct peer connections are encrypted by default. Even on shared WiFi, your transfers are protected from eavesdropping.', color: '#10B981' },
    { icon: <Clock size={20} />, title: 'Auto-Expiring Rooms', desc: 'Rooms automatically expire after 30 minutes of inactivity. No stale sessions, no cleanup needed. Extend with a single click.', color: '#64748B' },
    { icon: <Gauge size={20} />, title: 'Real-Time Progress', desc: 'Live progress bars, transfer speed, and ETA for every file transfer. Cancel transfers mid-stream if needed.', color: '#EC4899' },
    { icon: <Link2 size={20} />, title: 'Smart Link Detection', desc: 'URLs are automatically detected in text messages and displayed as clickable links with an "Open in new tab" action button.', color: '#0EA5E9' },
    { icon: <RefreshCw size={20} />, title: 'Session Re-Downloads', desc: 'Received files are cached in-memory for the session duration. Re-download any previously received file without asking the sender again.', color: '#A855F7' },
  ];

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#FFFFFF', color: '#0A0A0A', minHeight: '100vh' }}>
      <Navbar />

      <main>
        {/* ── HERO ─────────────────────────────────────── */}
        <div style={{ background: '#F8F8F6', borderBottom: '1px solid #ECEAE6', padding: '56px 32px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <div className="label-tag" style={{ justifyContent: 'center', marginBottom: 16 }}>Everything Built In</div>
            <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, lineHeight: 1.1, marginBottom: 16, color: '#0A0A0A' }}>
              Features that make file<br />sharing <span style={{ color: '#E8321A' }}>effortless</span>
            </h1>
            <p style={{ fontSize: '0.95rem', color: '#6B6560', lineHeight: 1.65, maxWidth: 520, margin: '0 auto' }}>
              No bloat. No accounts. Just the features you need to move files and content between your devices instantly.
            </p>
          </div>
        </div>

        {/* ── FEATURE GRID ────────────────────────────── */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} />
            ))}
          </div>
        </div>

        {/* ── RAINBOW STRIPES ─────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 -4px 16px rgba(255, 208, 0, 0.45)' }}>
          <div style={{ height: 3, background: 'linear-gradient(to right, #FFF5A5, #FFD000, #FFB020, #FFF5A5)', boxShadow: '0 0 10px #FFD000' }} />
          {STRIPE_COLORS.map((c, i) => (
            <div key={i} style={{ backgroundColor: c, height: 10 }} />
          ))}
        </div>

        {/* ── COMPARISON TABLE ────────────────────────── */}
        <div style={{ background: '#0A0A0A', padding: '56px 32px' }}>
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B6560', marginBottom: 8 }}>Comparison</div>
              <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.6rem', fontWeight: 400, color: '#fff' }}>
                Nudge vs. Traditional Methods
              </h2>
            </div>

            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 12, padding: '12px 0', borderBottom: '2px solid #222', marginBottom: 4 }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B6560' }}>Feature</span>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#FFB020', textAlign: 'center' }}>Nudge</span>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B6560', textAlign: 'center' }}>Email / Cloud</span>
            </div>

            <div style={{ color: '#fff' }}>
              {[
                { feature: 'Account Required', nudge: '✗ No', others: '✓ Yes' },
                { feature: 'Cloud Upload', nudge: '✗ None', others: '✓ Required' },
                { feature: 'Max File Size', nudge: 'Unlimited', others: '25 MB (email)' },
                { feature: 'Transfer Speed', nudge: 'WiFi Speed', others: 'Internet Speed' },
                { feature: 'Privacy', nudge: 'Full P2P', others: 'Server-stored' },
                { feature: 'Install Required', nudge: '✗ No', others: 'Often Yes' },
                { feature: 'Works Offline (LAN)', nudge: '✓ Yes*', others: '✗ No' },
                { feature: 'Cross-Platform', nudge: '✓ All browsers', others: 'Varies' },
              ].map((row, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 12, padding: '14px 0', borderBottom: '1px solid #1E1E1E', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{row.feature}</span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#22C55E', textAlign: 'center' }}>{row.nudge}</span>
                  <span style={{ fontSize: '0.8125rem', color: '#6B6560', textAlign: 'center' }}>{row.others}</span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: '0.65rem', color: '#4B4845', marginTop: 16, textAlign: 'center' }}>
              * Requires signaling server access for initial handshake. File data never leaves local network.
            </p>
          </div>
        </div>

        {/* ── SPECS BAR ──────────────────────────────── */}
        <div style={{ background: '#F8F8F6', borderTop: '1px solid #ECEAE6', borderBottom: '1px solid #ECEAE6', padding: '40px 32px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 24, textAlign: 'center' }}>
            {[
              { label: 'Max File Size', value: 'Unlimited', icon: <Upload size={24} color="#E8321A" /> },
              { label: 'Max Devices', value: '6 per room', icon: <Share2 size={24} color="#6366F1" /> },
              { label: 'Room Lifetime', value: '30 minutes', icon: <Clock size={24} color="#F97316" /> },
              { label: 'Supported Formats', value: 'All types', icon: <FileText size={24} color="#22C55E" /> },
              { label: 'Encryption', value: 'DTLS (auto)', icon: <Lock size={24} color="#10B981" /> },
            ].map(({ label, value, icon }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12, background: '#fff', border: '1px solid #ECEAE6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}>
                  {icon}
                </div>
                <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.15rem', fontWeight: 700, color: '#0A0A0A' }}>{value}</div>
                <div style={{ fontSize: '0.6875rem', color: '#9B9791', fontWeight: 500, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ─────────────────────────────────────── */}
        <div style={{ padding: '56px 32px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.8rem', fontWeight: 400, marginBottom: 12, color: '#0A0A0A' }}>
            See it in action
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#6B6560', marginBottom: 24 }}>
            The best way to experience Nudge is to try it yourself.
          </p>
          <button onClick={handleCreateRoom} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Create a Room <ArrowRight size={15} />
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
