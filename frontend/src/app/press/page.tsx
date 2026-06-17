"use client";

import { Download, Mail, Image, Newspaper, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function PressKitPage() {
  return (
    <main style={{ paddingTop: '120px', minHeight: '100vh', background: '#09090b', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '850px', margin: '0 auto', padding: '0 2rem 6rem' }}>
        
        {/* Header Hero */}
        <div style={{ marginBottom: '3.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '1rem' }}>ZilVerse Press Kit</h1>
          <p style={{ color: '#a1a1aa', fontSize: '1.15rem', lineHeight: '1.6', maxWidth: '700px' }}>
            Access official brand guidelines, download design logos, read press updates, and contact our media team.
          </p>
        </div>

        {/* Core Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '4rem', textAlign: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.5rem' }}>
            <h4 style={{ fontSize: '2rem', fontWeight: 800, color: '#a855f7', margin: '0 0 0.5rem' }}>$4.2M</h4>
            <span style={{ fontSize: '0.85rem', color: '#71717a' }}>Annual Escrow Volume</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.5rem' }}>
            <h4 style={{ fontSize: '2rem', fontWeight: 800, color: '#3b82f6', margin: '0 0 0.5rem' }}>82k</h4>
            <span style={{ fontSize: '0.85rem', color: '#71717a' }}>Registered Candidates</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.5rem' }}>
            <h4 style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', margin: '0 0 0.5rem' }}>140+</h4>
            <span style={{ fontSize: '0.85rem', color: '#71717a' }}>Active Partner Startups</span>
          </div>
        </div>

        {/* Media Assets download */}
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>Brand & Media Assets</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '4rem' }}>
          
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <Image size={32} color="#a855f7" style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.4rem' }}>Official Platform Logo</h4>
              <p style={{ color: '#a1a1aa', fontSize: '0.85rem', lineHeight: '1.5', margin: '0 0 1rem' }}>Official high-resolution transparent PNG and vector SVG formats for light and dark environments.</p>
              <Link href="/press/zilverse-raises-series-a" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#c084fc', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}>
                <Download size={14} /> Download Branding Bundle (6.2 MB)
              </Link>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <Newspaper size={32} color="#3b82f6" style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.4rem' }}>Platform One-Pager</h4>
              <p style={{ color: '#a1a1aa', fontSize: '0.85rem', lineHeight: '1.5', margin: '0 0 1rem' }}>Summarized specifications document detailing the ZilVerse platform technology, wallet, and marketplace system.</p>
              <Link href="/press/new-escrow-launch" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#60a5fa', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}>
                <Download size={14} /> Download PDF Overview (1.4 MB)
              </Link>
            </div>
          </div>

        </div>

        {/* Media Contact */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.3rem' }}>Media & Public Relations Inquiry</h4>
            <p style={{ color: '#a1a1aa', fontSize: '0.88rem', margin: 0 }}>Reach out directly for media queries or scheduling interview panels with founder.</p>
          </div>
          <a href="mailto:zillekibriya44456@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '10px', padding: '0.6rem 1.2rem', color: '#c084fc', textDecoration: 'none', fontWeight: 700, fontSize: '0.88rem' }}>
            <Mail size={16} /> Contact Media Team
          </a>
        </div>

      </div>
    </main>
  );
}
