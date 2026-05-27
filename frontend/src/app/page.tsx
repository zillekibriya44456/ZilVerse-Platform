"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";
import { useCountry } from "@/context/CountryContext";
import ParticleNetwork from "@/components/ParticleNetwork";
import TiltCard from "@/components/TiltCard";
import InspirationalCarousel from "@/components/InspirationalCarousel";
import GlobalMap from "@/components/GlobalMap";
import styles from "./home.module.css";

const stats = [
  { num: "150+", label: "Countries" },
  { num: "2,400+", label: "Freelancers" },
  { num: "800+", label: "Projects Sold" },
  { num: "1,200+", label: "Jobs Posted" },
  { num: "98%", label: "Satisfaction" },
];

const features = [
  {
    href: "/freelancers",
    color: "rgba(168,85,247,0.15)",
    textColor: "var(--primary)",
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Freelancer Marketplace",
    desc: "Hire verified developers, designers, and creators worldwide. Built-in skill testing & reviews.",
    link: "Browse Freelancers →",
  },
  {
    href: "/projects",
    color: "rgba(59,130,246,0.15)",
    textColor: "var(--accent)",
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    title: "Project Marketplace",
    desc: "Buy & sell source code, SaaS boilerplates, and academic projects. Instant downloads.",
    link: "Browse Projects →",
  },
  {
    href: "/services",
    color: "rgba(16,185,129,0.15)",
    textColor: "var(--secondary)",
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Digital Services",
    desc: "Get professional website, app and e-commerce development services for your business.",
    link: "View Services →",
  },
  {
    href: "/jobs",
    color: "rgba(245,158,11,0.15)",
    textColor: "#f59e0b",
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: "Job Board",
    desc: "Find remote jobs, internships and local tech opportunities across 150+ countries. Apply in one click.",
    link: "Find Jobs →",
  },
];

const steps = [
  { num: "01", title: "Create Your Account", desc: "Sign up free in under 60 seconds. No credit card needed.", color: "var(--primary)" },
  { num: "02", title: "Build Your Profile", desc: "Showcase your skills, portfolio, or post your project requirements.", color: "var(--accent)" },
  { num: "03", title: "Connect & Transact", desc: "Hire talent, sell your work, or find your next job — all on one platform.", color: "var(--secondary)" },
  { num: "04", title: "Get Paid Globally", desc: "Receive payments securely in your local currency from clients worldwide.", color: "#f59e0b" },
];

const regions = [
  { flag: "🌍", label: "Africa", count: "32 countries" },
  { flag: "🌎", label: "Americas", count: "45 countries" },
  { flag: "🌏", label: "Asia Pacific", count: "48 countries" },
  { flag: "🇪🇺", label: "Europe", count: "44 countries" },
  { flag: "🕌", label: "Middle East", count: "18 countries" },
];

const DEFAULT_TESTIMONIALS = [
  { stars: 5, text: "Got my e-commerce site built within a week! The team was professional and delivered exactly what I needed.", name: "Rahul Kapoor", role: "Buyer · Retail Business Owner, Delhi", initials: "RK", color: "var(--primary)" },
  { stars: 5, text: "Sold 3 of my source code projects within the first month. The marketplace is clean, buyers are real. Best platform for student devs.", name: "Anjali Joshi", role: "Seller · CSE Student, Pune", initials: "AJ", color: "var(--accent)" },
  { stars: 5, text: "As a freelancer, I've landed 5 clients through ZilVerse in 2 months. My income doubled this quarter!", name: "Mohammed Hassan", role: "Freelancer · Full-Stack Dev, Hyderabad", initials: "MH", color: "var(--secondary)" },
  { stars: 5, text: "Found a hospital management system for my final year project with full documentation and viva support. Absolute lifesaver!", name: "Priya Sharma", role: "Buyer · BCA Student, Bengaluru", initials: "PS", color: "#f59e0b" },
  { stars: 5, text: "Hired a React developer within 24 hours for my startup MVP. The quality was excellent. ZilVerse saved me weeks of searching.", name: "Zara Noor", role: "Buyer · Startup Founder, Dubai", initials: "ZN", color: "var(--primary)" },
  { stars: 5, text: "The job board helped me find a remote internship in under a week. The interface is clean and applying is super simple!", name: "Karan Patel", role: "Jobseeker · IT Graduate, Mumbai", initials: "KP", color: "var(--accent)" },
];

export default function Home() {
  const { selectedCountry } = useCountry();
  const [dbTestimonials, setDbTestimonials] = useState<any[]>([]);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [newFeedback, setNewFeedback] = useState({ text: '', name: '', role: '', stars: 5 });

  useEffect(() => {
    axios.get('http://localhost:5002/api/testimonials')
      .then(res => setDbTestimonials(res.data))
      .catch(err => {
        console.error("Failed to load testimonials", err);
      });
  }, []);

  const displayedTestimonials = dbTestimonials.length > 0 ? dbTestimonials : DEFAULT_TESTIMONIALS;

  const handlePostFeedback = async () => {
    if (!newFeedback.text || !newFeedback.name || !newFeedback.role) {
      alert("Please fill in all feedback fields.");
      return;
    }
    try {
      await axios.post('http://localhost:5002/api/testimonials', newFeedback);
      alert("Feedback submitted successfully!");
      setNewFeedback({ text: '', name: '', role: '', stars: 5 });
      setIsFeedbackModalOpen(false);
      const refreshRes = await axios.get('http://localhost:5002/api/testimonials');
      setDbTestimonials(refreshRes.data);
    } catch (err: any) {
      alert("Error submitting feedback: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className={styles.page}>

      {/* Hero */}
      <section className={styles.hero}>
        <div className="container" style={{ position: "relative", zIndex: 10 }}>
          <div className={`${styles.badge} shimmer-text`}>
            {selectedCountry.flag} ZilVerse — Your Global Tech Ecosystem
          </div>
          <h1 className={styles.title}>
            Build. Work. Grow —<br />
            <span className="text-gradient">All in One Place.</span>
          </h1>
          <p className={styles.subtitle}>
            The ultimate worldwide ecosystem combining freelancing, project marketplace,
            job portals, and digital services — serving talent in{" "}
            <span style={{ color: "var(--primary)", fontWeight: 600 }}>150+ countries</span>.
          </p>
          <div className={styles.ctaGroup}>
            <Link href="/register" className={`btn btn-primary ${styles.primaryBtn}`} id="hero-cta-register">
              🚀 Get Started Free
            </Link>
            <Link href="/freelancers" className="btn btn-secondary" id="hero-cta-hire">
              🌐 Hire Global Talent
            </Link>
          </div>

          {/* Stats bar */}
          <div className={styles.statsBar}>
            {stats.map((s, i) => (
              <div key={i} className={styles.stat}>
                <span className={styles.statNum}>{s.num}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive particle network */}
        <ParticleNetwork className={styles.particles} />
      </section>

      {/* Global Freelancer Map */}
      <GlobalMap />

      {/* Features */}
      <section className={styles.features}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Everything You Need in One Place</h2>
          <p className={styles.sectionSub}>Four powerful modules, one unified global platform</p>
          <div className={styles.featuresGrid}>
            {features.map((f) => (
              <TiltCard key={f.href} className={`glass-panel ${styles.featureCard}`}>
                <Link href={f.href} className={styles.featureCardInner}>
                  <div className={styles.featureIcon} style={{ background: f.color, color: f.textColor }}>
                    {f.icon}
                  </div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                  <span className={styles.cardLink}>{f.link}</span>
                </Link>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.howItWorks}>
        <div className="container">
          <h2 className={styles.sectionTitle}>How ZilVerse Works</h2>
          <p className={styles.sectionSub}>Get started in minutes, grow without limits</p>
          <div className={styles.stepsGrid}>
            {steps.map((s) => (
              <TiltCard key={s.num} className={`glass-panel ${styles.stepCard}`}>
                <div className={styles.stepNum} style={{ color: s.color, borderColor: s.color }}>
                  {s.num}
                </div>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepDesc}>{s.desc}</p>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Localized Carousel */}
      <InspirationalCarousel />

      {/* Testimonials */}
      <section className={styles.testimonials}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
            <div>
              <h2 className={styles.sectionTitle} style={{ margin: 0, textAlign: 'left' }}>Loved by Our Global Community</h2>
              <p className={styles.sectionSub} style={{ margin: '0.4rem 0 0', textAlign: 'left' }}>Real feedback from buyers, sellers, and freelancers on ZilVerse</p>
            </div>
            <button 
              className="btn btn-secondary" 
              onClick={() => setIsFeedbackModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.2rem', fontSize: '0.9rem', border: '1px solid #333' }}
            >
              ✍️ Share Your Feedback
            </button>
          </div>
          <div className={styles.testimonialsGrid}>
            {displayedTestimonials.map((t, i) => (
              <TiltCard key={i} className={`glass-panel ${styles.testimonialCard}`}>
                <div className={styles.stars}>{"⭐".repeat(t.stars)}</div>
                <p className={styles.testimonialText}>&quot;{t.text}&quot;</p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.tAvatar} style={{ background: t.color }}>{t.initials}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* Share Feedback Modal */}
      {isFeedbackModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#111', padding: '2rem', borderRadius: '16px', border: '1px solid #333', width: '90%', maxWidth: '450px' }}>
            <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>Share Your Experience</h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#aaa', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>Your Name</label>
              <input 
                type="text" 
                placeholder="e.g. Rahul Kapoor" 
                value={newFeedback.name}
                onChange={(e) => setNewFeedback({...newFeedback, name: e.target.value})}
                style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#aaa', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>Your Role / Title</label>
              <input 
                type="text" 
                placeholder="e.g. Buyer · Retail Business Owner" 
                value={newFeedback.role}
                onChange={(e) => setNewFeedback({...newFeedback, role: e.target.value})}
                style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#aaa', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>Rating</label>
              <select 
                value={newFeedback.stars}
                onChange={(e) => setNewFeedback({...newFeedback, stars: parseInt(e.target.value)})}
                style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                <option value={3}>⭐⭐⭐ (3 Stars)</option>
                <option value={2}>⭐⭐ (2 Stars)</option>
                <option value={1}>⭐ (1 Star)</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: '#aaa', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>Your Review / Feedback</label>
              <textarea 
                placeholder="How was your experience buying, selling, or freelancing on ZilVerse?" 
                value={newFeedback.text}
                onChange={(e) => setNewFeedback({...newFeedback, text: e.target.value})}
                style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px', minHeight: '80px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setIsFeedbackModalOpen(false)} style={{ flex: 1, padding: '0.8rem', background: '#333', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button 
                onClick={handlePostFeedback} 
                disabled={!newFeedback.name || !newFeedback.role || !newFeedback.text}
                style={{ flex: 1, padding: '0.8rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Country-aware CTA */}
      <section className={styles.ctaBanner}>
        <div className="container">
          <div className={`glass-panel ${styles.ctaBox}`}>
            <div className={styles.ctaFlag}>{selectedCountry.flag}</div>
            <h2>
              {selectedCountry.code === "WW"
                ? "Ready to Build Your Digital Empire?"
                : `Join ZilVerse from ${selectedCountry.name}`}
            </h2>
            <p>
              {selectedCountry.code === "WW"
                ? "Join thousands of freelancers, clients, and businesses on ZilVerse across 150+ countries."
                : `Connect with global clients and talent — available right here in ${selectedCountry.name}.`}
            </p>
            <div className={styles.ctaGroup}>
              <Link href="/register" className="btn btn-primary" id="cta-register">Create Free Account</Link>
              <Link href="/login" className="btn btn-secondary" id="cta-signin">Sign In</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
