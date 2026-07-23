'use client';

import React from 'react';
import { Laptop, Smartphone, Tablet, Monitor, Server, Terminal, HardDrive } from 'lucide-react';

interface DeviceIconProps {
  iconType?: string;
  size?: number;
  className?: string;
}

export function DeviceIcon({ iconType, size = 18 }: DeviceIconProps) {
  const normalized = (iconType || 'laptop').toLowerCase();

  switch (normalized) {
    case 'smartphone':
    case 'phone':
    case 'ios':
    case 'android':
    case '📱':
    case '🤖':
      return <Smartphone size={size} />;
    case 'tablet':
    case 'ipad':
      return <Tablet size={size} />;
    case 'monitor':
    case 'linux':
    case 'desktop':
    case '🐧':
      return <Monitor size={size} />;
    case 'server':
    case 'terminal':
      return <Server size={size} />;
    case 'laptop':
    case 'windows':
    case 'macos':
    case 'mac':
    case '💻':
    case '🍏':
    default:
      return <Laptop size={size} />;
  }
}

export function DeviceBadge({ iconType, nickname, label }: { iconType?: string; nickname: string; label?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8,
        background: '#0A0A0A', color: '#FFFFFF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0
      }}>
        <DeviceIcon iconType={iconType} size={18} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#0A0A0A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {nickname}
        </div>
        {label && <div style={{ fontSize: '0.6875rem', color: '#9B9791' }}>{label}</div>}
      </div>
    </div>
  );
}
