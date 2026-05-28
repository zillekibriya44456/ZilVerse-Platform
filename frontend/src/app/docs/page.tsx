"use client";

import { API_BASE } from "@/utils/api";

import { useState } from "react";
import Link from "next/link";
import { Terminal, Copy, Check, Shield, BookOpen, Cpu, DollarSign } from "lucide-react";

const ENDPOINTS = [
  {
    method: "POST",
    path: "/api/auth/register",
    description: "Register a new User (Candidate, Employer, or Freelancer)",
    auth: false,
    reqBody: `{
  "name": "Alex Mercer",
  "email": "alex@zilverse.com",
  "password": "SecurePassword123",
  "role": "FREELANCER"
}`,
    resBody: `{
  "id": "usr_9012a",
  "name": "Alex Mercer",
  "email": "alex@zilverse.com",
  "role": "FREELANCER",
  "createdAt": "2026-05-28T02:00:00Z"
}`
  },
  {
    method: "GET",
    path: "/api/jobs",
    description: "Fetch list of active global job board openings",
    auth: false,
    reqBody: null,
    resBody: `[
  {
    "id": "job_1122b",
    "title": "Senior AI Systems Engineer",
    "company": "OpenLabs Corp",
    "location": "Remote",
    "type": "Full-Time",
    "salary": "$140,000 - $170,000",
    "description": "Architect dynamic LLM orchestration agents..."
  }
]`
  },
  {
    method: "POST",
    path: "/api/payments/escrow/create",
    description: "Initialize secure wallet funds deposit under Escrow protection",
    auth: true,
    reqBody: `{
  "amount": 2500,
  "projectId": "proj_8811d",
  "freelancerId": "usr_9012a"
}`,
    resBody: `{
  "escrowId": "esc_5544c",
  "amount": 2500,
  "status": "HELD_IN_ESCROW",
  "createdAt": "2026-05-28T02:05:00Z"
}`
  }
];

export default function ApiDocsPage() {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <main style={{ paddingTop: '120px', minHeight: '100vh', background: '#09090b', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem 6rem' }}>
        
        {/* Header Hero */}
        <div style={{ marginBottom: '3.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', padding: '0.4rem 1rem', borderRadius: '99px', fontSize: '0.85rem', color: '#c084fc', marginBottom: '1rem', fontWeight: 600 }}>
            <Cpu size={14} />
            <span>ZilVerse Developer Platform</span>
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '1rem', background: 'linear-gradient(135deg, #fff 0%, #a1a1aa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Core API Documentation
          </h1>
          <p style={{ color: '#a1a1aa', fontSize: '1.15rem', lineHeight: '1.6', maxWidth: '750px' }}>
            Integrate job postings, client wallets, freelancer metrics, and live mockup screenings directly into your custom products using our REST API interfaces.
          </p>
        </div>

        {/* Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.5rem' }}>
            <div style={{ color: '#a855f7', marginBottom: '0.75rem' }}><Shield size={24} /></div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Authentication & Security</h3>
            <p style={{ color: '#71717a', fontSize: '0.88rem', lineHeight: '1.5' }}>
              All API requests must pass a secure Bearer token in the header block: <code style={{ color: '#c084fc', background: 'rgba(255,255,255,0.04)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>Authorization: Bearer &lt;YOUR_TOKEN&gt;</code>.
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.5rem' }}>
            <div style={{ color: '#3b82f6', marginBottom: '0.75rem' }}><BookOpen size={24} /></div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Base Endpoint URL</h3>
            <p style={{ color: '#71717a', fontSize: '0.88rem', lineHeight: '1.5' }}>
              For development use our secure local pipeline proxy: <br />
              <code style={{ color: '#60a5fa', background: 'rgba(255,255,255,0.04)', padding: '0.2rem 0.4rem', borderRadius: '4px', display: 'inline-block', marginTop: '0.4rem' }}>{API_BASE}/api</code>
            </p>
          </div>
        </div>

        {/* Endpoints section */}
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>Interactive Sandbox Endpoints</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {ENDPOINTS.map((ep, idx) => (
            <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', overflow: 'hidden' }}>
              {/* Endpoint Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '1rem 1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <span style={{ background: ep.method === "POST" ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)', color: ep.method === "POST" ? '#34d399' : '#60a5fa', border: ep.method === "POST" ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(59,130,246,0.3)', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                    {ep.method}
                  </span>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: 600, color: '#e4e4e7' }}>{ep.path}</span>
                </div>
                {ep.auth && (
                  <span style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 600 }}>
                    🔒 API Key Required
                  </span>
                )}
              </div>

              {/* Description */}
              <div style={{ padding: '1.25rem 1.5rem' }}>
                <p style={{ color: '#a1a1aa', fontSize: '0.92rem', margin: '0 0 1rem 0' }}>{ep.description}</p>

                <div style={{ display: 'grid', gridTemplateColumns: ep.reqBody ? '1fr 1fr' : '1fr', gap: '1rem' }}>
                  {ep.reqBody && (
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.4rem' }}>Request Body</span>
                      <div style={{ position: 'relative' }}>
                        <pre style={{ margin: 0, padding: '1rem', background: '#060608', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', fontSize: '0.82rem', fontFamily: 'monospace', color: '#a7f3d0', overflowX: 'auto' }}>
                          {ep.reqBody}
                        </pre>
                        <button onClick={() => handleCopy(ep.reqBody, idx * 2)} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', color: '#71717a', cursor: 'pointer' }}>
                          {copiedIdx === idx * 2 ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.4rem' }}>Response JSON</span>
                    <div style={{ position: 'relative' }}>
                      <pre style={{ margin: 0, padding: '1rem', background: '#060608', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', fontSize: '0.82rem', fontFamily: 'monospace', color: '#e4e4e7', overflowX: 'auto' }}>
                        {ep.resBody}
                      </pre>
                      <button onClick={() => handleCopy(ep.resBody, idx * 2 + 1)} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', color: '#71717a', cursor: 'pointer' }}>
                        {copiedIdx === idx * 2 + 1 ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
