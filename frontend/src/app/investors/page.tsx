"use client";

import { DollarSign, ShieldAlert, BarChart3, TrendingUp, Mail } from "lucide-react";

export default function InvestorsPage() {
  return (
    <main style={{ paddingTop: '120px', minHeight: '100vh', background: '#09090b', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '850px', margin: '0 auto', padding: '0 2rem 6rem' }}>
        
        {/* Header Hero */}
        <div style={{ marginBottom: '3.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '1rem', background: 'linear-gradient(135deg, #fff 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Decentralizing the Future of Work Talent
          </h1>
          <p style={{ color: '#a1a1aa', fontSize: '1.15rem', lineHeight: '1.6', maxWidth: '720px' }}>
            ZilVerse is constructing the global professional operating system. Learn about our business models, market traction, and investment round targets.
          </p>
        </div>

        {/* Investment Highlights */}
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>Investment Pillars</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '4rem' }}>
          
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '1.5rem' }}>
            <TrendingUp size={24} color="#3b82f6" style={{ marginBottom: '0.75rem' }} />
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.5rem' }}>Exponential Traction & Growth</h4>
            <p style={{ color: '#a1a1aa', fontSize: '0.88rem', lineHeight: '1.6', margin: 0 }}>
              Over 82,000 professional developers registered, processing transaction milestone escrows with an annual run-rate growth of 45% quarter-over-quarter.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '1.5rem' }}>
            <BarChart3 size={24} color="#a855f7" style={{ marginBottom: '0.75rem' }} />
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.5rem' }}>Sustainable Business Models</h4>
            <p style={{ color: '#a1a1aa', fontSize: '0.88rem', lineHeight: '1.6', margin: 0 }}>
              Two predictable revenue streams: a 3% secure escrow release processing fee, and custom corporate SaaS subscription tiers for high-volume automated HR screenings.
            </p>
          </div>

        </div>

        {/* Round specifications */}
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>Current Funding Target</h2>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '2rem', marginBottom: '4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Round Status</span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.2rem 0 0' }}>Seed Expansion Target</h3>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Amount</span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399', margin: '0.2rem 0 0' }}>$1.8M USD</h3>
            </div>
          </div>
          <p style={{ color: '#a1a1aa', fontSize: '0.92rem', lineHeight: '1.6', margin: 0 }}>
            We are opening our $1.8M Seed round to expand technical development of the AI-powered voice algorithms, integrate instant multichain smart wallet contracts, and scale our developer relations teams across North America and Europe.
          </p>
        </div>

        {/* Investor Relations Contact */}
        <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(168,85,247,0.06) 100%)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '20px', padding: '2rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Investor Relations</h3>
          <p style={{ color: '#a1a1aa', fontSize: '0.92rem', marginBottom: '1.5rem' }}>Contact our executive directors for accessing pitching materials and full audits.</p>
          <a href="mailto:zillekibriya44456@gmail.com" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#3b82f6', borderRadius: '10px', padding: '0.7rem 1.5rem', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>
            <Mail size={16} /> Request Deck & Financial Audits
          </a>
        </div>

      </div>
    </main>
  );
}
