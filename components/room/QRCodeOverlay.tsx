'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, Wifi, Sparkles } from 'lucide-react';

interface QRCodeOverlayProps {
  isOpen: boolean;
  roomUrl: string;
  roomCode: string;
  onClose: () => void;
}

export function QRCodeOverlay({ isOpen, roomUrl, roomCode, onClose }: QRCodeOverlayProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, background: 'rgba(10, 10, 10, 0.5)', backdropFilter: 'blur(4px)',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Backdrop click to close */}
      <div style={{ position: 'absolute', inset: 0 }} onClick={onClose} />

      {/* Modal Container */}
      <div style={{
        position: 'relative', background: '#FFFFFF', borderRadius: 20,
        border: '1.5px solid #E0DED9', padding: '32px 28px',
        width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column',
        alignItems: 'center', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
        zIndex: 10
      }}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16, padding: 6,
            background: '#F8F8F6', border: '1px solid #ECEAE6', borderRadius: 8,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#6B6560'
          }}
        >
          <X size={16} />
        </button>

        {/* Title */}
        <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.4rem', fontWeight: 400, color: '#0A0A0A', marginBottom: 6 }}>
          Scan to Pair Device
        </h3>
        <p style={{ fontSize: '0.75rem', color: '#6B6560', lineHeight: 1.5, maxWidth: 260, marginBottom: 20 }}>
          Scan with phone camera or open the link on any device connected to the same WiFi.
        </p>

        {/* QR Code Canvas Frame */}
        <div style={{
          padding: 16, background: '#FFFFFF', borderRadius: 16,
          border: '1.5px dashed #B8B5AE', boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          marginBottom: 16
        }}>
          <QRCodeSVG 
            value={roomUrl} 
            size={180}
            bgColor="#FFFFFF"
            fgColor="#0A0A0A"
            level="M"
            includeMargin={false}
          />
        </div>

        {/* Room Code Badge */}
        <div style={{
          background: '#F8F8F6', border: '1px solid #ECEAE6', padding: '6px 14px',
          borderRadius: 99, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em',
          color: '#3A3633', textTransform: 'uppercase', marginBottom: 16
        }}>
          Room Code: {roomCode}
        </div>

        {/* WiFi Note */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem',
          color: '#22C55E', fontWeight: 600, background: '#F0FDF4',
          border: '1px solid #DCFCE7', borderRadius: 6, padding: '6px 12px',
          marginBottom: 20, width: '100%', justifyContent: 'center'
        }}>
          <Wifi size={13} />
          <span>Requires same WiFi / Network connection</span>
        </div>

        {/* Action Button */}
        <button
          onClick={handleCopyLink}
          className="btn-primary"
          style={{ width: '100%', padding: '12px 20px', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          {copied ? (
            <>
              <Check size={14} />
              <span>Link Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy Direct URL</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
