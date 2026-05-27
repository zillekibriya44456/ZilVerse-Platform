"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('zv_cookie_consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('zv_cookie_consent', 'all');
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem('zv_cookie_consent', 'essential');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '24px',
      right: '24px',
      maxWidth: '640px',
      zIndex: 999999,
      background: 'rgba(15, 15, 20, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      fontFamily: 'Inter, sans-serif',
      color: '#fff',
      marginLeft: 'auto',
      marginRight: 'auto'
    }}>
      <div>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary, #a78bfa)', letterSpacing: '-0.01em' }}>
          🛡️ Privacy & Cookie Consent
        </h4>
        <p style={{ margin: 0, fontSize: '0.88rem', color: '#a1a1aa', lineHeight: '1.5' }}>
          ZilVerse utilizes cookies and browser caching to ensure secure transaction state handling, provide personalized mock screenings, and remember language selections. You can consent to all tracking or select essential only. Review our{' '}
          <Link href="/cookies" style={{ color: '#22d3ee', textDecoration: 'underline' }}>Cookie Policy</Link> and{' '}
          <Link href="/privacy" style={{ color: '#22d3ee', textDecoration: 'underline' }}>Privacy Policy</Link> for details.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={handleAcceptAll}
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
            border: 'none',
            color: '#fff',
            padding: '10px 18px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = '0.9')}
          onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
        >
          Accept All Tracking
        </button>
        <button
          onClick={handleDecline}
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#d4d4d8',
            padding: '10px 18px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
          onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)')}
        >
          Essential Only
        </button>
      </div>
    </div>
  );
}
