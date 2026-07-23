'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FolderOpen, AlertCircle } from 'lucide-react';
import { peerManager } from '../../lib/webrtc/PeerManager';
import { useRoomStore } from '../../store/roomStore';
import { usePeerStore } from '../../store/peerStore';

export function DropZone() {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const devices = useRoomStore((state) => state.devices);
  const channelStates = usePeerStore((state) => state.channelStates);

  // A peer is truly "ready" only if its WebRTC data channel is open
  const activePeersCount = devices.filter(d => channelStates[d.socketId] === true).length;

  const hasPeersInRoom = devices.length > 0;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    setError('');

    if (activePeersCount === 0) {
      setError(hasPeersInRoom ? 'Peer WebRTC connection not ready yet. Please wait a moment.' : 'No connected devices in the room to receive files.');
      return;
    }

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    if (activePeersCount === 0) {
      setError(hasPeersInRoom ? 'Peer WebRTC connection not ready yet. Please wait a moment.' : 'No connected devices in the room to receive files.');
      return;
    }
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
    // Reset input so same file can be sent again
    e.target.value = '';
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFolderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePeersCount === 0) {
      setError(hasPeersInRoom ? 'Peer WebRTC connection not ready yet. Please wait a moment.' : 'No connected devices in the room to receive files.');
      return;
    }
    folderInputRef.current?.click();
  };

  const processFiles = (files: File[]) => {
    if (files.length === 0) return;
    console.log(`[DropZone] Sending ${files.length} files to peers.`);
    peerManager.sendFiles(files);
  };

  // Paste event for screenshots/files
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      setError('');
      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === 'file') {
          const file = items[i].getAsFile();
          if (file) files.push(file);
        }
      }

      if (files.length > 0) {
        if (activePeersCount === 0) {
          setError(hasPeersInRoom ? 'Peer WebRTC connection not ready yet. Please wait a moment.' : 'No connected devices in the room to receive files.');
          return;
        }
        peerManager.sendFiles(files);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [activePeersCount, hasPeersInRoom]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1rem', fontWeight: 400, margin: 0 }}>Files</h3>
        <span style={{ background: '#F8F8F6', border: '1px solid #ECEAE6', borderRadius: 4, padding: '2px 8px', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#22C55E' }}>Unlimited Size</span>
      </div>

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        multiple
        accept="*/*"
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFileInputChange}
        multiple
        /* @ts-ignore webkitdirectory is not in TypeScript types but works in all browsers */
        webkitdirectory=""
        style={{ display: 'none' }}
      />

      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        className="dashed-card"
        style={{
          flex: 1,
          padding: 32,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          cursor: 'pointer',
          userSelect: 'none',
          minHeight: 180,
          background: isDragActive ? '#FFF4F0' : '#fff',
          borderColor: isDragActive ? '#E8321A' : undefined,
          transition: 'all 0.2s',
          transform: isDragActive ? 'scale(0.99)' : 'scale(1)',
        }}
      >
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#F8F8F6', border: '1.5px solid #ECEAE6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: isDragActive ? '#E8321A' : '#9B9791', transition: 'transform 0.2s', transform: isDragActive ? 'scale(1.1)' : 'scale(1)' }}>
          <UploadCloud size={22} />
        </div>

        <h4 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.05rem', fontWeight: 400, marginBottom: 6, color: '#0A0A0A' }}>
          {isDragActive ? 'Drop files here!' : 'Tap to select photos, videos, or files'}
        </h4>

        <p style={{ fontSize: '0.75rem', color: '#9B9791', maxWidth: 320, lineHeight: 1.5, marginBottom: 12 }}>
          Send images, 4K videos, audio, PDFs, archives &amp; large files. Unlimited size.
        </p>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: '#F8F8F6', border: '1px solid #ECEAE6', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, color: '#0A0A0A', marginTop: 4 }}>
          <span>Browse Photos &amp; Files</span>
        </div>

        {/* Peer status indicators */}
        {!hasPeersInRoom && (
          <div style={{ marginTop: 14, background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: 6, padding: '6px 12px', fontSize: '0.6875rem', fontWeight: 600, color: '#92400E' }}>
            ⏳ Waiting for another device to join…
          </div>
        )}
        {hasPeersInRoom && activePeersCount === 0 && (
          <div style={{ marginTop: 14, background: '#FFF4F0', border: '1px solid #F97316', borderRadius: 6, padding: '6px 12px', fontSize: '0.6875rem', fontWeight: 600, color: '#EA580C' }}>
            🔗 Establishing secure P2P connection…
          </div>
        )}
        {activePeersCount > 0 && (
          <div style={{ marginTop: 14, background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 6, padding: '6px 12px', fontSize: '0.6875rem', fontWeight: 600, color: '#15803D' }}>
            ✓ {activePeersCount} peer{activePeersCount > 1 ? 's' : ''} connected — ready to transfer
          </div>
        )}
      </div>

      {/* Send Folder Button */}
      <button
        onClick={handleFolderClick}
        style={{
          marginTop: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          width: '100%',
          padding: '10px 16px',
          background: '#F8F8F6',
          border: '1.5px dashed #D0CCC8',
          borderRadius: 8,
          fontSize: '0.8rem',
          fontWeight: 600,
          color: '#3A3633',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = '#FFF4F0';
          (e.currentTarget as HTMLButtonElement).style.borderColor = '#E8321A';
          (e.currentTarget as HTMLButtonElement).style.color = '#E8321A';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = '#F8F8F6';
          (e.currentTarget as HTMLButtonElement).style.borderColor = '#D0CCC8';
          (e.currentTarget as HTMLButtonElement).style.color = '#3A3633';
        }}
      >
        <FolderOpen size={16} />
        <span>Send Entire Folder</span>
      </button>

      {error && (
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: '0.75rem', fontWeight: 600, color: '#E8321A' }}>
          <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
