"use client";
import { API_BASE } from "@/utils/api";

import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";
import { useCountry } from "@/context/CountryContext";
import dynamic from "next/dynamic";
import styles from "./home.module.css";

// Components
import AnimatedStats from "@/components/AnimatedStats";
import LiveActivityMap from "@/components/LiveActivityMap";
import TestimonialSlider from "@/components/TestimonialSlider";
import { motion } from "framer-motion";

// Icons
import { 
  Briefcase, 
  Code2, 
  Globe, 
  Users, 
  GraduationCap, 
  Layers 
} from "lucide-react";

const ParticleNetwork = dynamic(() => import("@/components/ParticleNetwork"), { ssr: false });
const TiltCard = dynamic(() => import("@/components/TiltCard"));

const ecosystemCards = [
  {
    href: "/services",
    icon: Layers,
    title: "Services",
    desc: "Hire agencies and experts for digital services, from web development to AI solutions.",
    link: "Explore Services →",
  },
  {
    href: "/freelancers",
    icon: Users,
    title: "Talent",
    desc: "Find and hire world-class freelancers and vetted developers globally.",
    link: "Find Talent →",
  },
  {
    href: "/projects",
    icon: Code2,
    title: "Marketplace",
    desc: "Buy and sell source code, SaaS boilerplates, and digital products.",
    link: "Browse Marketplace →",
  },
  {
    href: "/jobs",
    icon: Briefcase,
    title: "Opportunities",
    desc: "Discover remote jobs, internships, and freelance contracts worldwide.",
    link: "Find Opportunities →",
  },
  {
    href: "/academy",
    icon: GraduationCap,
    title: "Learn & Grow",
    desc: "AI interview prep, certifications, and career development resources.",
    link: "Start Learning →",
  },
  {
    href: "/community",
    icon: Globe,
    title: "Community",
    desc: "Connect, collaborate, and share with tech professionals globally.",
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
        if (res.data && res.data.freelancers && res.data.projects) {
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
        <div className={`container ${styles.heroContainer}`}>
          
          {/* Left Column */}
          <div className={styles.heroContent}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={styles.badge}
            >
              <span className={styles.badgeIcon}>{selectedCountry.flag}</span>
              <span>ZILVERSE — YOUR GLOBAL TECH ECOSYSTEM</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={styles.title}
            >
              Build. Work. Grow.<br />
              <span className={styles.textGradient}>All in One Place.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={styles.subtitle}
            >
              The ultimate worldwide ecosystem combining freelancing, project marketplace, job portals, and digital services serving talent across 150+ countries.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className={styles.ctaGroup}
            >
              <Link href="/register" className={styles.btnPrimary}>
                Get Started Free
              </Link>
              <Link href="/opportunities" className={styles.btnSecondary}>
                Explore Opportunities
              </Link>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className={styles.socialProof}
            >
              <div className={styles.avatars}>
                <img src="/avatars/default.png" alt="User" />
                <img src="/avatars/default.png" alt="User" />
                <img src="/avatars/default.png" alt="User" />
                <div className={styles.avatarMore}>+25k</div>
              </div>
              <span>Trusted by 25,000+ people worldwide</span>
            </motion.div>
          </div>

          {/* Right Column (Map) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className={styles.heroVisual}
          >
            <LiveActivityMap />
          </motion.div>
          
        </div>
      </section>

      {/* Live Stats Section */}
      <section className={styles.statsSection}>
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={styles.statsGlassContainer}
          >
            <AnimatedStats />
          </motion.div>
        </div>
      </section>

      {/* Core Ecosystem Section */}
      <section className={styles.ecosystemSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Everything You Need In One Place</h2>
            <p className={styles.sectionSubtitle}>Powerful modules combined into one unified platform.</p>
          </div>
          
          <div className={styles.ecosystemGrid}>
            {ecosystemCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div 
                  key={card.href}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <TiltCard className={styles.ecosystemCard}>
                    <Link href={card.href} className={styles.ecosystemLink}>
                      <div className={styles.ecoIconWrapper}>
                        <Icon size={24} className={styles.ecoIcon} />
                      </div>
                      <h3 className={styles.ecoTitle}>{card.title}</h3>
                      <p className={styles.ecoDesc}>{card.desc}</p>
                      <span className={styles.ecoCta}>{card.link}</span>
                    </Link>
                  </TiltCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Talent Section */}
      {Array.isArray(featured?.freelancers) && featured.freelancers.length > 0 && (
        <section className={styles.talentSection}>
          <div className="container">
            <div className={styles.sectionHeaderRow}>
              <div>
                <h2 className={styles.sectionTitle}>Featured Talent</h2>
                <p className={styles.sectionSubtitle}>Hire world-class professionals</p>
              </div>
              <Link href="/freelancers" className={styles.btnSecondarySmall}>View All →</Link>
            </div>
            
            <div className={styles.grid4}>
              {featured.freelancers.map((user: any, idx) => (
                <motion.div 
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={styles.talentCard}
                >
                  <div className={styles.talentHeader}>
                    <img src={user.avatar || "/avatars/default.png"} alt={user.name} className={styles.talentAvatar} />
                    <div className={styles.talentInfo}>
                      <h4>{user.name}</h4>
                      <p>{user.freelancerProfile?.title || "Freelancer"}</p>
                    </div>
                  </div>
                  <div className={styles.talentMeta}>
                    <span className={styles.talentRating}>⭐ 5.0</span>
                    <span className={styles.talentRate}>${user.freelancerProfile?.hourlyRate || 0}/hr</span>
                  </div>
                  <Link href={`/freelancers/${user.id}`} className={styles.talentLink}>View Profile</Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Projects Section */}
      {Array.isArray(featured?.projects) && featured.projects.length > 0 && (
        <section className={styles.projectsSection}>
          <div className="container">
            <div className={styles.sectionHeaderRow}>
              <div>
                <h2 className={styles.sectionTitle}>Featured Projects</h2>
                <p className={styles.sectionSubtitle}>Top-tier source code and boilerplate</p>
              </div>
              <Link href="/projects" className={styles.btnSecondarySmall}>Explore →</Link>
            </div>
            
            <div className={styles.grid3}>
              {featured.projects.map((project: any, idx) => (
                <motion.div 
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={styles.projectCard}
                >
                  <div className={styles.projectImage} style={{ backgroundImage: `url(${project.images?.[0] || '/images/default_project.jpg'})` }}>
                    <div className={styles.projectCategory}>{project.category?.name || "Code"}</div>
                  </div>
                  <div className={styles.projectContent}>
                    <h4>{project.title}</h4>
                    <div className={styles.projectFooter}>
                      <span className={styles.projectPrice}>${project.price}</span>
                      <Link href={`/projects/${project.id}`} className={styles.projectLink}>Details</Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Success Stories Section */}
      <section className={styles.successSection}>
        <div className="container" style={{ overflow: 'hidden' }}>
          <div className={styles.sectionHeaderRow}>
            <div>
              <h2 className={styles.sectionTitle}>Success Stories</h2>
              <p className={styles.sectionSubtitle}>See what our global network says</p>
            </div>
            <button 
              className={styles.btnSecondarySmall} 
              onClick={() => setIsFeedbackModalOpen(true)}
            >
              Share Story
            </button>
          </div>
          
          <TestimonialSlider testimonials={dbTestimonials} />
        </div>
      </section>

      {/* Final CTA */}
      <section className={styles.finalCtaSection}>
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className={styles.ctaBanner}
          >
            <div className={styles.ctaContent}>
              <h2>Join the Global Opportunity Ecosystem</h2>
              <p>Build, work, and grow alongside thousands of professionals worldwide.</p>
              <div className={styles.ctaGroup} style={{ justifyContent: 'center' }}>
                <Link href="/register" className={styles.btnPrimary}>Create Free Account</Link>
                <Link href="/about" className={styles.btnSecondary}>How It Works</Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feedback Modal */}
      {isFeedbackModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Share Your Experience</h3>
            <input 
              type="text" placeholder="Your Name" value={newFeedback.name}
              onChange={(e) => setNewFeedback({...newFeedback, name: e.target.value})}
              className={styles.inputField}
            />
            <input 
              type="text" placeholder="Your Role" value={newFeedback.role}
              onChange={(e) => setNewFeedback({...newFeedback, role: e.target.value})}
              className={styles.inputField}
            />
            <select 
              value={newFeedback.stars}
              onChange={(e) => setNewFeedback({...newFeedback, stars: parseInt(e.target.value)})}
              className={styles.inputField}
            >
              <option value={5}>5 Stars</option>
              <option value={4}>4 Stars</option>
              <option value={3}>3 Stars</option>
              <option value={2}>2 Stars</option>
              <option value={1}>1 Star</option>
            </select>
            <textarea 
              placeholder="Your review..." value={newFeedback.text}
              onChange={(e) => setNewFeedback({...newFeedback, text: e.target.value})}
              className={styles.textArea}
            />
            <div className={styles.modalActions}>
              <button onClick={() => setIsFeedbackModalOpen(false)} className={styles.btnSecondarySmall}>Cancel</button>
              <button onClick={handlePostFeedback} className={styles.btnPrimary}>Submit</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
