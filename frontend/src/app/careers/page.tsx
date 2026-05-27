"use client";

import { useState } from "react";
import { Briefcase, MapPin, Clock, Send, Award, Compass, Heart } from "lucide-react";

const JOBS = [
  {
    title: "Senior AI Systems Architect",
    dept: "Engineering",
    location: "Bengaluru, India (Hybrid)",
    type: "Full-Time",
    compensation: "₹36L - ₹48L per annum",
    description: "Design low-latency fine-tuning pipelines and RAG database aggregations for the global screening engine."
  },
  {
    title: "Lead Developer (React / Next.js)",
    dept: "Engineering",
    location: "Remote (Global)",
    type: "Full-Time",
    compensation: "$110k - $140k",
    description: "Optimize layout systems, build reusable component libraries, and spearhead hydration speedups."
  },
  {
    title: "Executive VP of Platform Growth",
    dept: "Business Ops",
    location: "Bengaluru, India (Office)",
    type: "Full-Time",
    compensation: "₹45L - ₹60L",
    description: "Accelerate global freelance marketplace signups and establish key enterprise partnerships."
  }
];

export default function CareersPage() {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setApplied(true);
    setTimeout(() => {
      setApplied(false);
      setSelectedJob(null);
    }, 2000);
  };

  return (
    <main style={{ paddingTop: '120px', minHeight: '100vh', background: '#09090b', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem 6rem' }}>
        
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #fff 0%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Build the Future of Professional Work
          </h1>
          <p style={{ color: '#a1a1aa', fontSize: '1.15rem', maxWidth: '650px', margin: '0 auto 2.5rem' }}>
            Join ZilVerse and help us build a decentralized professional ecosystem where candidates, researchers, and creators connect and thrive.
          </p>
        </div>

        {/* Company Values */}
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>Our Pillars of Excellence</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.5rem' }}>
            <Award style={{ color: '#a855f7', marginBottom: '0.75rem' }} size={24} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>Absolute Autonomy</h4>
            <p style={{ color: '#71717a', fontSize: '0.88rem', lineHeight: '1.5', margin: 0 }}>
              We encourage self-motivation. Own your code, direct your project milestones, and choose hybrid paths.
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.5rem' }}>
            <Compass style={{ color: '#3b82f6', marginBottom: '0.75rem' }} size={24} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>Global Innovation</h4>
            <p style={{ color: '#71717a', fontSize: '0.88rem', lineHeight: '1.5', margin: 0 }}>
              Collaborate on cutting-edge systems including high-fidelity voice algorithms and distributed escrows.
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.5rem' }}>
            <Heart style={{ color: '#ec4899', marginBottom: '0.75rem' }} size={24} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>Inclusive Compensation</h4>
            <p style={{ color: '#71717a', fontSize: '0.88rem', lineHeight: '1.5', margin: 0 }}>
              Competitive base rates, performance scaling incentives, comprehensive family healthcare, and platform tokens.
            </p>
          </div>
        </div>

        {/* Positions */}
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>Open Roles at ZilVerse</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {JOBS.map((job, idx) => (
            <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div style={{ flex: 1, minWidth: '280px' }}>
                <span style={{ fontSize: '0.75rem', color: '#c084fc', background: 'rgba(168,85,247,0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 700, display: 'inline-block', marginBottom: '0.5rem' }}>{job.dept}</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem' }}>{job.title}</h3>
                <p style={{ color: '#a1a1aa', fontSize: '0.9rem', lineHeight: '1.5', margin: '0 0 1rem 0' }}>{job.description}</p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.82rem', color: '#71717a' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={12} /> {job.location}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={12} /> {job.type}</span>
                  <span style={{ color: '#34d399', fontWeight: 600 }}>{job.compensation}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedJob(job.title)}
                style={{ background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)', border: 'none', borderRadius: '10px', padding: '0.65rem 1.25rem', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Apply Now
              </button>
            </div>
          ))}
        </div>

      </div>

      {/* Application Modal */}
      {selectedJob && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#09090b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', width: '90%', maxWidth: '480px', padding: '2rem', position: 'relative' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Apply for {selectedJob}</h3>
            <p style={{ color: '#71717a', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Your details will be forwarded to the ZilVerse Recruiting team.</p>
            
            {applied ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <span style={{ fontSize: '2.5rem' }}>🎉</span>
                <h4 style={{ margin: '1rem 0 0.5rem', color: '#34d399' }}>Application Submitted!</h4>
                <p style={{ color: '#a1a1aa', fontSize: '0.82rem' }}>We will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input required type="text" placeholder="Full Name" style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', outline: 'none' }} />
                <input required type="email" placeholder="Email Address" style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', outline: 'none' }} />
                <input type="text" placeholder="LinkedIn or Portfolio Link" style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', outline: 'none' }} />
                <textarea placeholder="Tell us briefly about your experience..." rows={3} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', outline: 'none', resize: 'none' }} />
                
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="submit" style={{ flex: 1, padding: '0.8rem', background: '#a855f7', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Submit Application</button>
                  <button type="button" onClick={() => setSelectedJob(null)} style={{ flex: 1, padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </main>
  );
}
