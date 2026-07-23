'use client';

import React from 'react';
import { Navbar } from '../../components/landing/Navbar';
import { Footer } from '../../components/landing/Footer';
import { useRouter } from 'next/navigation';
import { Shield, Lock, EyeOff, ServerOff, Cpu, Key, CheckCircle2, ArrowRight } from 'lucide-react';
import { generateRoomCode } from '../../lib/utils/roomCode';

export default function SecurityPage() {
  const router = useRouter();

  const handleCreateRoom = () => {
    const code = generateRoomCode();
    router.push('/room/' + code);
  };

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#FFFFFF', color: '#0A0A0A', minHeight: '100vh' }}>
      <Navbar />

      <main>
        {/* ── HERO ─────────────────────────────────────── */}
        <div style={{ background: '#F8F8F6', borderBottom: '1px solid #ECEAE6', padding: '56px 32px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <div className="label-tag" style={{ justifyContent: 'center', marginBottom: 16 }}>Enterprise Web Security</div>
            <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 400, lineHeight: 1.1, marginBottom: 16, color: '#0A0A0A' }}>
              Built for Absolute<br /><span style={{ color: '#E8321A' }}>Privacy &amp; Security</span>
            </h1>
            <p style={{ fontSize: '0.95rem', color: '#6B6560', lineHeight: 1.65, maxWidth: 580, margin: '0 auto 28px' }}>
              Nudge is designed from the ground up to protect your content. Files stream peer-to-peer over 256-bit encrypted direct channels — zero cloud relay, zero server storage.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={handleCreateRoom} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Start Secure Room
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* ── SECURITY PILLARS ──────────────────────────── */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 32px' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="label-tag" style={{ justifyContent: 'center', marginBottom: 12 }}>Architecture</div>
            <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.85rem', fontWeight: 400, color: '#0A0A0A' }}>
              How Nudge Protects Your Data
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {[
              {
                icon: <Lock size={22} color="#E8321A" />,
                title: 'DTLS-SRTP 256-Bit Encryption',
                desc: 'All data channels established between browsers are mandatory encrypted using DTLS (Datagram Transport Layer Security). Nobody in between can inspect or tamper with your streams.'
              },
              {
                icon: <ServerOff size={22} color="#F97316" />,
                title: 'Zero Server Storage',
                desc: 'Files never pass through or get saved on any server disk. Streams move directly from browser memory to browser memory.'
              },
              {
                icon: <EyeOff size={22} color="#FFB020" />,
                title: 'Zero Accounts or Tracking',
                desc: 'No account creation, no password storage, no tracking cookies, and no analytics fingerprinting. Your identity remains private.'
              },
              {
                icon: <Shield size={22} color="#22C55E" />,
                title: 'Hardened HTTP Security Headers',
                desc: 'Protected with strict X-Frame-Options (anti-clickjacking), nosniff MIME protection, restrictive API permissions policies, and XSS protection.'
              },
              {
                icon: <Cpu size={22} color="#6366F1" />,
                title: 'Input & Filename Sanitization',
                desc: 'Automatic sanitization strips path traversal sequences (../), script tags, and illegal OS characters from transferred files before saving.'
              },
              {
                icon: <Key size={22} color="#0A0A0A" />,
                title: 'Auto-Expiring Rooms',
                desc: 'Room sessions automatically terminate after 30 minutes or 10 minutes of inactivity, closing all connection channels cleanly.'
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="dashed-card" style={{ padding: 24, background: '#fff' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10, background: '#F8F8F6', border: '1px solid #ECEAE6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14
                }}>
                  {icon}
                </div>
                <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.15rem', fontWeight: 400, color: '#0A0A0A', marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: '0.8125rem', color: '#6B6560', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECURITY COMPARISON TABLE ────────────────── */}
        <div style={{ background: '#F8F8F6', borderTop: '1px solid #ECEAE6', borderBottom: '1px solid #ECEAE6', padding: '56px 32px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div className="label-tag" style={{ justifyContent: 'center', marginBottom: 12 }}>Comparison</div>
              <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.8rem', fontWeight: 400, color: '#0A0A0A' }}>
                Nudge vs. Traditional Cloud Transfer
              </h2>
            </div>

            <div className="dashed-card" style={{ padding: 24, background: '#fff', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid #ECEAE6' }}>
                    <th style={{ padding: '12px 16px', color: '#6B6560', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.6875rem' }}>Feature</th>
                    <th style={{ padding: '12px 16px', color: '#E8321A', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.6875rem' }}>Nudge P2P</th>
                    <th style={{ padding: '12px 16px', color: '#9B9791', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.6875rem' }}>Traditional Cloud Services</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'Cloud Server File Storage', nudge: 'None (Direct P2P)', traditional: 'Saved on Cloud Disk' },
                    { feature: 'Encryption Standard', nudge: 'DTLS 256-Bit P2P', traditional: 'Server-side TLS / Varies' },
                    { feature: 'Account & Login Required', nudge: 'No (Instant)', traditional: 'Mandatory Account' },
                    { feature: 'Third-Party Analytics Tracking', nudge: 'Zero', traditional: 'User Profiling & Tracking' },
                    { feature: 'File Transfer Speed', nudge: 'Full WiFi Speed (Local)', traditional: 'Capped Upload/Download Speed' },
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: i < 4 ? '1px solid #F0EDEA' : 'none' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0A0A0A' }}>{row.feature}</td>
                      <td style={{ padding: '14px 16px', color: '#22C55E', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CheckCircle2 size={14} color="#22C55E" />
                        {row.nudge}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#6B6560' }}>{row.traditional}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── CTA ─────────────────────────────────────── */}
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '56px 32px', textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.6rem', fontWeight: 400, marginBottom: 12, color: '#0A0A0A' }}>
            Ready to transfer securely?
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#6B6560', marginBottom: 24 }}>
            Create a room now and start sending files directly between your devices.
          </p>
          <button onClick={handleCreateRoom} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Create Secure Room <ArrowRight size={15} />
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
