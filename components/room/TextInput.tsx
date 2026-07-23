'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Clipboard, Loader2, AlertCircle } from 'lucide-react';
import { peerManager } from '../../lib/webrtc/PeerManager';
import { useRoomStore } from '../../store/roomStore';

export function TextInput() {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [loadingClipboard, setLoadingClipboard] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const devices = useRoomStore((state) => state.devices);
  const activePeersCount = devices.length;

  const handleSend = () => {
    setError('');

    if (!text.trim()) return;

    if (activePeersCount === 0) {
      setError('No connected devices in the room to receive text.');
      return;
    }

    console.log(`[TextInput] Sending text payload of size: ${text.length}`);
    peerManager.sendText(text.trim());
    setText('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Cmd+Enter or Ctrl+Enter
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClipboardSend = async () => {
    setError('');
    
    if (activePeersCount === 0) {
      setError('No connected devices to share clipboard with.');
      return;
    }

    setLoadingClipboard(true);
    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        throw new Error('Clipboard API not fully supported in this browser.');
      }

      // Read clipboard text
      const clipboardText = await navigator.clipboard.readText();
      
      if (!clipboardText.trim()) {
        setError('Clipboard is empty or contains non-text content.');
      } else {
        console.log(`[TextInput] Sending clipboard text: ${clipboardText.substring(0, 30)}...`);
        peerManager.sendText(clipboardText.trim(), 'clipboard');
      }
    } catch (err: any) {
      console.error('[TextInput] Failed to read clipboard:', err);
      setError(err.message || 'Clipboard access denied by browser.');
    } finally {
      setLoadingClipboard(false);
    }
  };

  // Auto-expand textarea on typing
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const adjustHeight = () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
    };

    textarea.addEventListener('input', adjustHeight);
    return () => {
      textarea.removeEventListener('input', adjustHeight);
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1rem', fontWeight: 400, margin: 0 }}>Text &amp; Links</h3>
        <span style={{ fontSize: '0.6875rem', color: '#B8B5AE' }}>{text.length}/10,000</span>
      </div>

      <div className="dashed-card" style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 220, background: '#fff' }}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => { setError(''); setText(e.target.value); }}
          onKeyDown={handleKeyDown}
          placeholder="Type or paste text, links… (Ctrl+Enter to send)"
          maxLength={10000}
          rows={5}
          style={{ width: '100%', flex: 1, background: 'transparent', fontSize: '0.8125rem', color: '#0A0A0A', outline: 'none', resize: 'none', border: 'none', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #F0EDEA', marginTop: 8 }}>
          <button
            onClick={handleClipboardSend}
            disabled={loadingClipboard}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F8F8F6', border: '1px solid #ECEAE6', borderRadius: 6, padding: '7px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: loadingClipboard ? 'not-allowed' : 'pointer', opacity: loadingClipboard ? 0.5 : 1, color: '#3A3633' }}
          >
            {loadingClipboard ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Clipboard size={13} />}
            Share Clipboard
          </button>

          <button
            onClick={handleSend}
            disabled={!text.trim()}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: text.trim() ? '#0A0A0A' : '#F8F8F6', color: text.trim() ? '#fff' : '#B8B5AE', border: 'none', borderRadius: 6, padding: '7px 14px', fontSize: '0.75rem', fontWeight: 700, cursor: text.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.15s' }}
          >
            Send <Send size={12} />
          </button>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: '0.75rem', fontWeight: 600, color: '#E8321A' }}>
          <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
