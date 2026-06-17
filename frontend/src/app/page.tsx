"use client";
import { API_BASE } from "@/utils/api";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import axios from "axios";
import { useCountry } from "@/context/CountryContext";
import dynamic from "next/dynamic";
const ParticleNetwork = dynamic(() => import("@/components/ParticleNetwork"), { ssr: false });
const TiltCard = dynamic(() => import("@/components/TiltCard"));
import styles from "./home.module.css";
import AnimatedStats from "@/components/AnimatedStats";


const features = [
  {
    href: "/freelancers",
    icon: "👨‍💻",
    title: "Freelancer Marketplace",
    desc: "Hire verified developers, designers, and creators worldwide. Built-in skill testing & reviews.",
    link: "Browse Freelancers →",
  },
  {
    href: "/projects",
    icon: "📦",
    title: "Project Marketplace",
    desc: "Buy & sell source code, SaaS boilerplates, and academic projects. Instant downloads.",
    link: "Browse Projects →",
  },
  {
    href: "/jobs",
    icon: "💼",
    title: "Global Job Board",
    desc: "Find remote jobs, internships and local tech opportunities across 150+ countries.",
    link: "Find Jobs →",
  },
  {
    href: "/community",
    icon: "🌐",
    title: "Global Community",
    desc: "Network and collaborate with professionals, developers, and entrepreneurs worldwide.",
    link: "Join Community →",
  },
];

export default function Home() {
  const { selectedCountry } = useCountry();
  const [dbTestimonials, setDbTestimonials] = useState<any[]>([]);
  const [featured, setFeatured] = useState({ freelancers: [], projects: [], services: [] });
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [newFeedback, setNewFeedback] = useState({ text: '', name: '', role: '', stars: 5 });

  useEffect(() => {
    // Load Testimonials
    axios.get(`${API_BASE}/api/testimonials`)
      .then(res => {
        if (Array.isArray(res.data)) {
          setDbTestimonials(res.data);
        }
      })
      .catch(err => console.error("Failed to load testimonials", err));

    // Load Featured Content
    axios.get(`${API_BASE}/api/homepage/featured`)
      .then(res => {
        if (res.data && res.data.freelancers && res.data.projects && res.data.services) {
          setFeatured(res.data);
        }
      })
      .catch(err => console.error("Failed to load featured content", err));
  }, []);

  const handlePostFeedback = async () => {
    if (!newFeedback.text || !newFeedback.name || !newFeedback.role) {
      alert("Please fill in all feedback fields.");
      return;
    }
    try {
      await axios.post(`${API_BASE}/api/testimonials`, newFeedback);
      alert("Feedback submitted successfully and is awaiting verification!");
      setNewFeedback({ text: '', name: '', role: '', stars: 5 });
      setIsFeedbackModalOpen(false);
    } catch (err: any) {
      alert("Error submitting feedback: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className={styles.page}>

      {/* Hero Section */}
      <section className={styles.hero}>
        <ParticleNetwork className={styles.particles} />
        <div className="container" style={{ position: "relative", zIndex: 10 }}>
          <div className={styles.badge}>
            <span>{selectedCountry.flag}</span>
            <span>ZilVerse — Global Tech Ecosystem</span>
          </div>
          <h1 className={styles.title}>
            Build. Work. Grow.<br />
            <span className="text-gradient">All in One Place.</span>
          </h1>
          <p className={styles.subtitle}>
            The ultimate ecosystem combining freelancing, digital marketplaces,
            and global jobs — serving talent in <span style={{ color: "var(--foreground)" }}>150+ countries</span>.
          </p>
          <div className={styles.ctaGroup}>
            <Link href="/register" className="btn btn-primary" id="hero-cta-register" style={{ padding: "0.8rem 1.8rem" }}>
              Start for Free
            </Link>
            <Link href="/freelancers" className="btn btn-secondary" id="hero-cta-hire" style={{ padding: "0.8rem 1.8rem" }}>
              Hire Talent
            </Link>
          </div>

          <AnimatedStats />
        </div>
      </section>

      {/* Features Grid */}
      <section className={styles.features}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Everything You Need</h2>
          <p className={styles.sectionSub}>Four powerful modules, one unified platform</p>
          <div className={styles.featuresGrid}>
            {features.map((f) => (
              <TiltCard key={f.href} className={styles.featureCard}>
                <Link href={f.href} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div className={styles.featureIcon} style={{ background: 'rgba(255,255,255,0.05)' }}>
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

      {/* Featured Freelancers */}
      {Array.isArray(featured?.freelancers) && featured.freelancers.length > 0 && (
        <section className={styles.dynamicSection}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
              <div>
                <h2 className={styles.sectionTitle} style={{ margin: 0, textAlign: 'left' }}>Top Rated Freelancers</h2>
                <p className={styles.sectionSub} style={{ margin: '0.5rem 0 0', textAlign: 'left' }}>Hire world-class talent for your next big project</p>
              </div>
              <Link href="/freelancers" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>View All →</Link>
            </div>
            <div className={styles.grid4}>
              {featured.freelancers.map((user: any) => (
                <div key={user.id} className={styles.itemCard}>
                  <div className={styles.itemHeader}>
                    <img src={user.avatar || "/avatars/default.png"} alt={user.name} className={styles.itemAvatar} />
                    <div style={{ overflow: 'hidden' }}>
                      <h4 className={styles.itemTitle}>{user.name}</h4>
                      <p className={styles.itemSub}>{user.freelancerProfile?.title || "Freelancer"}</p>
                    </div>
                  </div>
                  <p className={styles.itemDesc}>{user.bio || "No bio available."}</p>
                  <div className={styles.itemFooter}>
                    <span className={styles.itemPrice}>${user.freelancerProfile?.hourlyRate || 0}/hr</span>
                    <Link href={`/freelancers/${user.id}`} style={{ color: 'var(--foreground)', fontSize: '0.85rem', fontWeight: 500 }}>Profile →</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Projects */}
      {Array.isArray(featured?.projects) && featured.projects.length > 0 && (
        <section className={styles.dynamicSection}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
              <div>
                <h2 className={styles.sectionTitle} style={{ margin: 0, textAlign: 'left' }}>Trending Projects</h2>
                <p className={styles.sectionSub} style={{ margin: '0.5rem 0 0', textAlign: 'left' }}>Source code, SaaS templates, and boilerplate ready to deploy</p>
              </div>
              <Link href="/projects" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Explore Marketplace →</Link>
            </div>
            <div className={styles.grid3}>
              {featured.projects.map((project: any) => (
                <div key={project.id} className={styles.itemCard}>
                  <h4 className={styles.itemTitle}>{project.title}</h4>
                  <p className={styles.itemDesc}>{project.description}</p>
                  <div className={styles.itemFooter}>
                    <span className={styles.itemPrice}>${project.price}</span>
                    <div className={styles.itemMeta}>
                      <img src={project.seller.avatar || "/avatars/default.png"} alt="seller" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                      <span>{project.seller.name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className={styles.testimonials}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '3rem' }}>
            <div>
              <h2 className={styles.sectionTitle} style={{ margin: 0, textAlign: 'left' }}>Loved by Global Teams</h2>
              <p className={styles.sectionSub} style={{ margin: '0.5rem 0 0', textAlign: 'left' }}>Real feedback from the ZilVerse ecosystem</p>
            </div>
            <button 
              className="btn btn-secondary" 
              onClick={() => setIsFeedbackModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}
            >
              ✍️ Share Feedback
            </button>
          </div>
          
          <div className={styles.testimonialsGrid}>
            {Array.isArray(dbTestimonials) && dbTestimonials.map((t, i) => (
              <TiltCard key={i} className={styles.testimonialCard}>
                <div className={styles.stars}>{"⭐".repeat(Math.max(1, Math.min(5, Number(t.stars) || 5)))}</div>
                <p className={styles.testimonialText}>&quot;{t.text}&quot;</p>
                <div className={styles.testimonialAuthor}>
                  {t.avatar ? (
                    <img src={t.avatar} alt={t.name} className={styles.tAvatar} />
                  ) : (
                    <div className={styles.tAvatar} style={{ background: t.color || '#333' }}>{t.initials}</div>
                  )}
                  <div className={styles.tInfo}>
                    <span className={styles.tName}>
                      {t.name}
                      {t.verified && <span className={styles.verifiedBadge} title="Verified User">✓</span>}
                    </span>
                    <span className={styles.tRole}>{t.role}</span>
                  </div>
                </div>
              </TiltCard>
            ))}
            
            {(!dbTestimonials || dbTestimonials.length === 0) && (
              <div style={{ textAlign: 'center', color: 'var(--muted)', gridColumn: '1 / -1', padding: '3rem 0' }}>
                Loading reviews from database...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feedback Modal */}
      {isFeedbackModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--card-border)', width: '90%', maxWidth: '450px' }}>
            <h2 style={{ color: 'var(--foreground)', marginBottom: '1.5rem', fontSize: '1.2rem' }}>Share Your Experience</h2>
            <div style={{ marginBottom: '1rem' }}>
              <input 
                type="text" placeholder="Your Name" value={newFeedback.name}
                onChange={(e) => setNewFeedback({...newFeedback, name: e.target.value})}
                style={{ width: '100%', padding: '0.8rem', background: 'var(--background)', border: '1px solid var(--card-border)', color: 'var(--foreground)', borderRadius: '8px' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <input 
                type="text" placeholder="Your Role (e.g. Freelancer)" value={newFeedback.role}
                onChange={(e) => setNewFeedback({...newFeedback, role: e.target.value})}
                style={{ width: '100%', padding: '0.8rem', background: 'var(--background)', border: '1px solid var(--card-border)', color: 'var(--foreground)', borderRadius: '8px' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <select 
                value={newFeedback.stars}
                onChange={(e) => setNewFeedback({...newFeedback, stars: parseInt(e.target.value)})}
                style={{ width: '100%', padding: '0.8rem', background: 'var(--background)', border: '1px solid var(--card-border)', color: 'var(--foreground)', borderRadius: '8px' }}
              >
                <option value={5}>5 Stars</option>
                <option value={4}>4 Stars</option>
                <option value={3}>3 Stars</option>
                <option value={2}>2 Stars</option>
                <option value={1}>1 Star</option>
              </select>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <textarea 
                placeholder="Your review..." value={newFeedback.text}
                onChange={(e) => setNewFeedback({...newFeedback, text: e.target.value})}
                style={{ width: '100%', padding: '0.8rem', background: 'var(--background)', border: '1px solid var(--card-border)', color: 'var(--foreground)', borderRadius: '8px', minHeight: '80px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setIsFeedbackModalOpen(false)} style={{ flex: 1, padding: '0.8rem', background: 'var(--card-border)', color: 'var(--foreground)', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handlePostFeedback} style={{ flex: 1, padding: '0.8rem', background: 'var(--foreground)', color: 'var(--background)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer CTA */}
      <section className={styles.ctaBanner}>
        <div className="container">
          <div className={styles.ctaBox}>
            <h2>Ready to Join the Network?</h2>
            <p>Connect with global clients and top-tier talent available around the world.</p>
            <Link href="/register" className="btn btn-primary" style={{ padding: "0.8rem 2rem", fontSize: "1rem" }}>
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
