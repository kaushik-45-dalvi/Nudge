'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { generateRoomCode } from '../../lib/utils/roomCode';
import { MessageSquare, Menu, X } from 'lucide-react';
import { FeedbackModal } from '../common/FeedbackModal';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isCreating, setIsCreating] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleCreateRoom = () => {
    setIsCreating(true);
    const code = generateRoomCode();
    router.push('/room/' + code);
  };

  const navItems = [
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Features', href: '/features' },
    { label: 'Security & Privacy', href: '/security' },
  ];

  return (
    <>
      <header style={{ borderBottom: '1px solid #ECEAE6', position: 'sticky', top: 0, background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(8px)', zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Mobile menu toggle button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sidebar-toggle-btn"
              style={{ background: '#F8F8F6', border: '1px solid #ECEAE6', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', display: 'none', alignItems: 'center', color: '#0A0A0A' }}
              title="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <div
              onClick={() => router.push('/')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
            >
              <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.3rem', fontWeight: 700 }}>
                nudge<span style={{ color: '#E8321A' }}>.</span>
              </span>
            </div>
          </div>

          <nav className="nav-links-desktop" style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            {navItems.map(item => (
              <span
                key={item.href}
                onClick={() => router.push(item.href)}
                className="nav-link"
                style={{
                  cursor: 'pointer',
                  color: pathname === item.href ? '#E8321A' : '#3A3633',
                  fontWeight: pathname === item.href ? 700 : 500,
                  borderBottom: pathname === item.href ? '2px solid #E8321A' : '2px solid transparent',
                  paddingBottom: 2
                }}
              >
                {item.label}
              </span>
            ))}
            <span
              onClick={() => setIsFeedbackOpen(true)}
              className="nav-link"
              style={{
                cursor: 'pointer',
                color: '#3A3633',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <MessageSquare size={13} color="#E8321A" />
              Feedback
            </span>
          </nav>

          <button
            onClick={handleCreateRoom}
            disabled={isCreating}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '8px 16px',
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
            {isCreating ? 'Creating…' : 'Create Room'}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-sidebar-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-sidebar-drawer" onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9B9791', marginBottom: 8 }}>
              Navigation
            </div>
            {navItems.map(item => (
              <div
                key={item.href}
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push(item.href);
                }}
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: '0.9rem',
                  fontWeight: pathname === item.href ? 700 : 500,
                  color: pathname === item.href ? '#E8321A' : '#0A0A0A',
                  background: pathname === item.href ? '#FFF4F0' : '#F8F8F6',
                  cursor: 'pointer'
                }}
              >
                {item.label}
              </div>
            ))}
            <div
              onClick={() => {
                setMobileMenuOpen(false);
                setIsFeedbackOpen(true);
              }}
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: '0.9rem',
                fontWeight: 500,
                color: '#0A0A0A',
                background: '#F8F8F6',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <MessageSquare size={16} color="#E8321A" />
              <span>Feedback</span>
            </div>
          </div>
        </div>
      )}

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </>
  );
}
