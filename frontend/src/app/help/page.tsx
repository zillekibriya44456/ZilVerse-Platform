"use client";

import { useState } from "react";
import { HelpCircle, Search, Mail, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";

const FAQS = [
  {
    category: "General",
    questions: [
      {
        q: "What is ZilVerse?",
        a: "ZilVerse (Technical Ilahi Hub) is an integrated ecosystem linking job seeking candidates, freelancing experts, tech marketplaces, and interactive screening environments directly to help startups and candidates scale."
      },
      {
        q: "How does the AI Interview Simulation work?",
        a: "Our AI room uses dual-pane video streaming, live speech synthesis, and real-time grammar checks to test candidate profiles across 5 distinct rounds (Resume Analysis, Aptitude, HR, Technical, and Coding Sandbox)."
      }
    ]
  },
  {
    category: "Payments & Escrow",
    questions: [
      {
        q: "How are funds protected in the freelancing portal?",
        a: "All project hiring contracts utilize secure wallet-backed Escrows. Clients deposit milestone amounts which are held securely and released only when work deliverables are approved."
      },
      {
        q: "Are there platform transaction fees?",
        a: "We charge a standard 3% transaction fee on escrow releases to cover node hosting and credit gateway routing fees."
      }
    ]
  },
  {
    category: "Anti-Cheat Policy",
    questions: [
      {
        q: "What triggers an anti-cheat advisory warning?",
        a: "During technical mock rooms, the system logs instances of switching tabs (page blur events), copy-pasting code templates, or mic inactivity to ensure assessment integrity."
      }
    ]
  }
];

export default function HelpCenterPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [openIdx, setOpenIdx] = useState<string | null>(null);

  const toggleOpen = (id: string) => {
    setOpenIdx(openIdx === id ? null : id);
  };

  const filteredFaqs = FAQS.map(cat => ({
    ...cat,
    questions: cat.questions.filter(
      item => item.q.toLowerCase().includes(searchTerm.toLowerCase()) || item.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(cat => cat.questions.length > 0);

  return (
    <main style={{ paddingTop: '120px', minHeight: '100vh', background: '#09090b', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '850px', margin: '0 auto', padding: '0 2rem 6rem' }}>
        
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h1 style={{ fontSize: '2.75rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>Help Center & Knowledge Base</h1>
          <p style={{ color: '#a1a1aa', fontSize: '1.1rem', marginBottom: '2rem' }}>How can we help you succeed today?</p>
          
          {/* Search bar */}
          <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto' }}>
            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} size={18} />
            <input
              type="text"
              placeholder="Search guides, terms, escrow rules..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff', outline: 'none', transition: 'border-color 0.2s', fontSize: '0.95rem' }}
            />
          </div>
        </div>

        {/* FAQs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '4rem' }}>
          {filteredFaqs.map((cat, catIdx) => (
            <div key={catIdx}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#a855f7', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                {cat.category}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {cat.questions.map((faq, idx) => {
                  const uniqueId = `${catIdx}-${idx}`;
                  const isOpen = openIdx === uniqueId;
                  return (
                    <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' }}>
                      <button
                        onClick={() => toggleOpen(uniqueId)}
                        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', padding: '1.2rem', color: '#fff', cursor: 'pointer', textAlign: 'left' }}
                      >
                        <span style={{ fontWeight: 600, fontSize: '1rem' }}>{faq.q}</span>
                        {isOpen ? <ChevronUp size={18} color="#71717a" /> : <ChevronDown size={18} color="#71717a" />}
                      </button>
                      
                      {isOpen && (
                        <div style={{ padding: '0 1.2rem 1.2rem 1.2rem', color: '#a1a1aa', fontSize: '0.92rem', lineHeight: '1.6', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                          <p style={{ margin: '1rem 0 0 0' }}>{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Block */}
        <div style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.05) 0%, rgba(59,130,246,0.05) 100%)', border: '1px solid rgba(168,85,247,0.15)', borderRadius: '20px', padding: '2rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Still need assistance?</h3>
          <p style={{ color: '#a1a1aa', fontSize: '0.92rem', marginBottom: '1.5rem' }}>Our live human support experts and engineers are standing by.</p>
          <div style={{ display: 'inline-flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="mailto:zillekibriya44456@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c084fc', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
              <Mail size={16} />
              <span>Email Support</span>
            </a>
            <a href="https://wa.me/917091780179" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#60a5fa', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
              <MessageSquare size={16} />
              <span>WhatsApp Chat</span>
            </a>
          </div>
        </div>

      </div>
    </main>
  );
}
