'use client';

import React from 'react';
import { Navbar } from '../../components/landing/Navbar';
import { Footer } from '../../components/landing/Footer';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, Wifi, Share2, Zap, Shield, Monitor, ArrowDown,
  Globe, KeyRound, QrCode, Laptop, Smartphone
} from 'lucide-react';
import { generateRoomCode } from '../../lib/utils/roomCode';

/* ─── Flow Diagram Node ─────────────────────────────── */
function FlowNode({ icon, title, desc, color }: { icon: React.ReactNode; title: string; desc: string; color: string }) {
  return (
    <div style={{
      background: '#fff', border: '1.5px dashed #B8B5AE', borderRadius: 12, padding: '24px 20px',
      textAlign: 'center', flex: 1, minWidth: 200, position: 'relative',
      transition: 'border-color 0.2s, transform 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#B8B5AE'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{
        width: 56, height: 56, borderRadius: '50%', background: `${color}12`,
        border: `2px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 14px', color
      }}>
        {icon}
      </div>
      <h4 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.05rem', fontWeight: 400, marginBottom: 6, color: '#0A0A0A' }}>{title}</h4>
      <p style={{ fontSize: '0.75rem', color: '#6B6560', lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}

/* ─── Arrow connector ────────────────────────────────── */
function FlowArrow() {
  return (
    <div className="flow-arrow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '0 4px', color: '#D0CCC8' }}>
      <ArrowRight size={24} />
    </div>
  );
}

function FlowArrowDown() {
  return (
    <div className="flow-arrow-down" style={{ display: 'none', alignItems: 'center', justifyContent: 'center', padding: '8px 0', color: '#D0CCC8' }}>
      <ArrowDown size={24} />
    </div>
  );
}

export default function HowItWorksPage() {
  const router = useRouter();

  const handleCreateRoom = () => {
    const code = generateRoomCode();
    router.push('/room/' + code);
  };

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#FFFFFF', color: '#0A0A0A', minHeight: '100vh' }}>
      <Navbar />

      <main>
        {/* ── HERO SECTION ─────────────────────────────── */}
        <div style={{ background: '#F8F8F6', borderBottom: '1px solid #ECEAE6', padding: '56px 32px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <div className="label-tag" style={{ justifyContent: 'center', marginBottom: 16 }}>Step-by-Step Guide</div>
            <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, lineHeight: 1.1, marginBottom: 16, color: '#0A0A0A' }}>
              How Nudge Works
            </h1>
            <p style={{ fontSize: '0.95rem', color: '#6B6560', lineHeight: 1.65, maxWidth: 560, margin: '0 auto' }}>
              From opening the app to streaming your first file — the entire process takes under 10 seconds and involves no accounts, no cloud, no install.
            </p>
          </div>
        </div>

        {/* ── 4-STEP FLOW DIAGRAM ──────────────────────── */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 32px' }}>
          <div className="flow-diagram" style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
            <FlowNode icon={<Globe size={26} />} title="1. Open Nudge" desc="Navigate to the Nudge URL on any device with a modern browser. No download or install required." color="#6366F1" />
            <FlowArrow />
            <FlowArrowDown />
            <FlowNode icon={<KeyRound size={26} />} title="2. Create a Room" desc="Click 'Create Room' to generate a unique room code instantly. No server round-trip, no waiting." color="#F97316" />
            <FlowArrow />
            <FlowArrowDown />
            <FlowNode icon={<QrCode size={26} />} title="3. Share the Code" desc="Send the room code or scan the QR code on your second device. It joins the same session immediately." color="#22C55E" />
            <FlowArrow />
            <FlowArrowDown />
            <FlowNode icon={<Zap size={26} />} title="4. Transfer!" desc="Drop files, paste text, share links. Everything moves directly between browsers at full WiFi speed." color="#E8321A" />
          </div>
        </div>

        {/* ── DETAILED STEPS ──────────────────────────── */}
        <div style={{ background: '#F8F8F6', borderTop: '1px solid #ECEAE6', borderBottom: '1px solid #ECEAE6', padding: '56px 32px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div className="label-tag" style={{ justifyContent: 'center', marginBottom: 12 }}>Deep Dive</div>
            <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.8rem', fontWeight: 400, textAlign: 'center', marginBottom: 40, color: '#0A0A0A' }}>
              What Happens Under the Hood
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {[
                {
                  step: '01', icon: <Monitor size={20} />, title: 'Instant Pairing',
                  desc: 'When you open the room page, your devices pair securely over your local network. No file data ever leaves your WiFi network or gets stored anywhere.',
                  detail: 'Device discovery happens in milliseconds with automatic session pairing.',
                  color: '#6366F1'
                },
                {
                  step: '02', icon: <Share2 size={20} />, title: 'Local Device Discovery',
                  desc: 'Both browsers find each other directly on your local WiFi network. This allows your devices to talk straight to each other without middleman servers.',
                  detail: 'Local IP routing connects your devices directly across your router.',
                  color: '#F97316'
                },
                {
                  step: '03', icon: <Wifi size={20} />, title: 'Direct Device-to-Device Stream',
                  desc: 'A direct connection streams files straight from device to device. Transfer speeds are limited only by your local WiFi network speed.',
                  detail: 'Files stream chunk by chunk directly in browser memory with real-time progress.',
                  color: '#22C55E'
                },
                {
                  step: '04', icon: <Shield size={20} />, title: 'End-to-End Encryption',
                  desc: 'All transferred files, text snippets, and links are encrypted directly between devices. Even on shared WiFi networks, no one else can view your transfers.',
                  detail: 'Built-in transport encryption guarantees complete privacy and data safety.',
                  color: '#E8321A'
                },
              ].map(({ step, icon, title, desc, detail, color }) => (
                <div key={step} className="dashed-card" style={{ padding: '28px 28px', background: '#fff', display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, background: `${color}12`, border: `1.5px solid ${color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color
                  }}>
                    {icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 250 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.12em', color }}>{step}</span>
                      <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.1rem', fontWeight: 400, margin: 0, color: '#0A0A0A' }}>{title}</h3>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: '#3A3633', lineHeight: 1.6, marginBottom: 10 }}>{desc}</p>
                    <div style={{ background: '#F8F8F6', border: '1px solid #ECEAE6', borderRadius: 6, padding: '10px 14px', fontSize: '0.75rem', color: '#6B6560', lineHeight: 1.5 }}>
                      <strong style={{ color: '#9B9791' }}>Technical detail:</strong> {detail}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CTA ─────────────────────────────────────── */}
        <div style={{ padding: '56px 32px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.8rem', fontWeight: 400, marginBottom: 12, color: '#0A0A0A' }}>
            Ready to try it?
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#6B6560', marginBottom: 24 }}>
            Create a room and start transferring in under 10 seconds.
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
