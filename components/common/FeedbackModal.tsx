'use client';

import React, { useState, FormEvent } from 'react';
import { X, MessageSquare, Send, CheckCircle2, AlertCircle, Loader2, Star } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('https://formspree.io/f/xdaqdzol', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          rating: `${rating} / 5 Stars`,
          email: email || 'Anonymous',
          message: message.trim(),
          submittedAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        setStatus('success');
        setMessage('');
        setEmail('');
      } else {
        const data = await response.json().catch(() => ({}));
        setErrorMessage(data.error || 'Failed to send feedback. Please try again.');
        setStatus('error');
      }
    } catch (err) {
      console.error('Feedback submission error:', err);
      setErrorMessage('Network error. Please check your connection and try again.');
      setStatus('error');
    }
  };

  const resetForm = () => {
    setStatus('idle');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, background: 'rgba(10, 10, 10, 0.5)', backdropFilter: 'blur(4px)',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Backdrop */}
      <div style={{ position: 'absolute', inset: 0 }} onClick={resetForm} />

      {/* Modal Container */}
      <div style={{
        position: 'relative', background: '#FFFFFF', borderRadius: 20,
        border: '1.5px solid #E0DED9', padding: '32px 28px',
        width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 50px rgba(0,0,0,0.15)', zIndex: 10
      }}>
        {/* Close Button */}
        <button
          onClick={resetForm}
          style={{
            position: 'absolute', top: 16, right: 16, padding: 6,
            background: '#F8F8F6', border: '1px solid #ECEAE6', borderRadius: 8,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#6B6560'
          }}
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, background: '#E8321A12',
            border: '1.5px solid #E8321A30', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#E8321A'
          }}>
            <MessageSquare size={20} />
          </div>
          <div>
            <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.35rem', fontWeight: 400, color: '#0A0A0A', margin: 0 }}>
              Send Feedback
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#6B6560', margin: 0 }}>
              We&apos;d love to hear your thoughts or bug reports!
            </p>
          </div>
        </div>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: '#F0FDF4',
              border: '1px solid #DCFCE7', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 16px', color: '#22C55E'
            }}>
              <CheckCircle2 size={32} />
            </div>
            <h4 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.3rem', fontWeight: 400, color: '#0A0A0A', marginBottom: 8 }}>
              Thank You!
            </h4>
            <p style={{ fontSize: '0.8125rem', color: '#6B6560', lineHeight: 1.5, marginBottom: 24 }}>
              Your feedback has been received. We appreciate your help in making Nudge better!
            </p>
            <button onClick={resetForm} className="btn-primary" style={{ width: '100%', borderRadius: 8 }}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
            {/* Rating */}
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B6560', marginBottom: 8 }}>
                How would you rate Nudge?
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    style={{
                      background: star <= rating ? '#FFFBEB' : '#F8F8F6',
                      border: star <= rating ? '1px solid #FCD34D' : '1px solid #ECEAE6',
                      borderRadius: 8, padding: '8px 12px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Star size={16} fill={star <= rating ? '#F59E0B' : 'none'} color={star <= rating ? '#F59E0B' : '#B8B5AE'} />
                  </button>
                ))}
              </div>
            </div>

            {/* Email (Optional) */}
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B6560', marginBottom: 6 }}>
                Your Email <span style={{ fontWeight: 400, color: '#9B9791' }}>(Optional)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 8,
                  border: '1.5px solid #E0DED9', fontSize: '0.8125rem', color: '#0A0A0A',
                  outline: 'none', background: '#FFFFFF'
                }}
              />
            </div>

            {/* Message */}
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B6560', marginBottom: 6 }}>
                Your Message
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what you love, features you'd like, or any bugs you encountered..."
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 8,
                  border: '1.5px solid #E0DED9', fontSize: '0.8125rem', color: '#0A0A0A',
                  outline: 'none', background: '#FFFFFF', resize: 'vertical',
                  fontFamily: 'Inter, system-ui, sans-serif'
                }}
              />
            </div>

            {status === 'error' && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
                background: '#FFF0F0', border: '1px solid #FECACA', borderRadius: 8,
                fontSize: '0.75rem', color: '#EF4444'
              }}>
                <AlertCircle size={15} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status === 'submitting' || !message.trim()}
              className="btn-primary"
              style={{
                width: '100%', padding: '12px 20px', borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: (status === 'submitting' || !message.trim()) ? 0.6 : 1,
                cursor: (status === 'submitting' || !message.trim()) ? 'not-allowed' : 'pointer'
              }}
            >
              {status === 'submitting' ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Sending…</span>
                </>
              ) : (
                <>
                  <Send size={15} />
                  <span>Submit Feedback</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
