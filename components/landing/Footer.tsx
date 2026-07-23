'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import { FeedbackModal } from '../common/FeedbackModal';

const STRIPE_COLORS = [
  '#FFD000', '#FFB020', '#F97316', '#EF4444', '#E8321A', '#C41A00', '#8B0000',
];

export function Footer() {
  const router = useRouter();
  const [isFeedbackOpen, setIsFeedbackOpen] = React.useState(false);

  return (
    <>
      {/* Bottom stripes with yellow top glow */}
      <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 -4px 18px rgba(255, 208, 0, 0.5)' }}>
        <div style={{ height: 3, background: 'linear-gradient(to right, #FFF5A5, #FFD000, #FFB020, #FFF5A5)', boxShadow: '0 0 10px #FFD000' }} />
        {STRIPE_COLORS.map((c, i) => (
          <div key={i} style={{ backgroundColor: c, height: 10 }} />
        ))}
      </div>

      <footer style={{ background: '#0A0A0A', borderTop: '1px solid #1E1E1E', padding: '40px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 32 }}>
            {/* Brand */}
            <div>
              <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.4rem', fontWeight: 700, color: 'white' }}>
                nudge<span style={{ color: '#FFB020' }}>.</span>
              </span>
              <p style={{ fontSize: '0.75rem', color: '#6B6560', marginTop: 8, lineHeight: 1.6, maxWidth: 240 }}>
                Browser-based, peer-to-peer file and content transfer over local network. No cloud. No account. Just nudge.
              </p>
            </div>

            {/* Links */}
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B6560', marginBottom: 12 }}>Pages</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'How It Works', href: '/how-it-works' },
                  { label: 'Features', href: '/features' },
                  { label: 'Security & Privacy', href: '/security' },
                ].map(l => (
                  <span key={l.href} onClick={() => router.push(l.href)} style={{ fontSize: '0.8125rem', color: '#9B9791', cursor: 'pointer', transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#9B9791')}
                  >
                    {l.label}
                  </span>
                ))}
                <span
                  onClick={() => setIsFeedbackOpen(true)}
                  style={{ fontSize: '0.8125rem', color: '#E8321A', cursor: 'pointer', fontWeight: 600, transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#FFB020')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#E8321A')}
                >
                  Send Feedback
                </span>
              </div>
            </div>

            {/* Stats */}
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B6560', marginBottom: 12 }}>By the Numbers</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { v: '100%', s: 'Peer-to-peer' },
                  { v: '0 MB', s: 'Cloud storage' },
                  { v: 'Unlimited', s: 'File size limit' },
                ].map(({ v, s }) => (
                  <div key={s} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.05rem', color: 'white', fontWeight: 700 }}>{v}</span>
                    <span style={{ fontSize: '0.6875rem', color: '#6B6560', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #1E1E1E', paddingTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: '0.6875rem', color: '#4B4845' }}>© {new Date().getFullYear()} Nudge · Built for speed</p>
            <p style={{ fontSize: '0.6875rem', color: '#4B4845' }}>Direct Browser-to-Browser Transfer</p>
          </div>
        </div>
      </footer>
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </>
  );
}
