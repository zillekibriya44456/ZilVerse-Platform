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
  Layers,
  Rocket,
  PlayCircle,
  CheckCircle2,
  ShoppingBag,
  Users2,
  Quote,
  UserPlus
} from "lucide-react";

const ParticleNetwork = dynamic(() => import("@/components/ParticleNetwork"), { ssr: false });
const TiltCard = dynamic(() => import("@/components/TiltCard"));

const ecosystemCards = [
  {
    href: "/services",
    icon: Layers,
    title: "Services",
    desc: "Offer & hire services across 500+ categories worldwide.",
    link: "Explore →",
    color: "#D946EF", bg: "rgba(217, 70, 239, 0.15)"
  },
  {
    href: "/freelancers",
    icon: Users,
    title: "Talent",
    desc: "Find verified talent or discover global opportunities.",
    link: "Explore →",
    color: "#3B82F6", bg: "rgba(59, 130, 246, 0.15)"
  },
  {
    href: "/projects",
    icon: ShoppingBag,
    title: "Marketplace",
    desc: "Buy & sell digital products, templates, code & more.",
    link: "Explore →",
    color: "#22C55E", bg: "rgba(34, 197, 94, 0.15)"
  },
  {
    href: "/jobs",
    icon: Briefcase,
    title: "Opportunities",
    desc: "Explore jobs, internships, grants & global opportunities.",
    link: "Explore →",
    color: "#22C55E", bg: "rgba(34, 197, 94, 0.15)"
  },
  {
    href: "/academy",
    icon: GraduationCap,
    title: "Learn & Grow",
    desc: "Upskill with courses, certifications & career resources.",
    link: "Explore →",
    color: "#F59E0B", bg: "rgba(245, 158, 11, 0.15)"
  },
  {
    href: "/community",
    icon: Users2,
    title: "Community",
    desc: "Connect, collaborate & grow with global professionals.",
    link: "Explore →",
    color: "#EC4899", bg: "rgba(236, 72, 153, 0.15)"
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
              <div className={styles.badgeDot}></div>
              <span>ZILVERSE — YOUR GLOBAL TECH ECOSYSTEM</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={styles.title}
            >
              Build. Work. Grow.<br />
              <span className={styles.textGradient}>All In One Place.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={styles.subtitle}
            >
              The ultimate worldwide ecosystem combining freelancing, project marketplace, job portals, and digital services — serving talent in 150+ countries.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className={styles.ctaGroup}
            >
              <Link href="/register" className={styles.btnPrimaryGradient}>
                <Rocket size={18} /> Get Started Free
              </Link>
              <Link href="/opportunities" className={styles.btnSecondary}>
                <PlayCircle size={18} /> Explore Opportunities
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
                <img src="/avatars/default.png" alt="User" />
              </div>
              <span>Trusted by 25,000+ people worldwide</span>
              <CheckCircle2 size={16} color="#22C55E" />
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
            <div className={styles.ecoPretitle}>THE ZILVERSE ECOSYSTEM</div>
            <h2 className={styles.sectionTitle}>Everything You Need, In One Place</h2>
            <p className={styles.sectionSubtitle}>Powerful modules combined into one unified platform to help you<br/>build, work, and grow without boundaries.</p>
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
                      <div className={styles.ecoIconWrapper} style={{ color: card.color, background: card.bg }}>
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

      {/* 3-Column Content Block */}
      <section className={styles.featuredGridSection}>
        <div className="container">
          <div className={styles.grid3Block}>
            
            {/* Column 1: Top Rated Talent */}
            <div className={styles.contentColumn}>
              <div className={styles.columnHeader}>
                <h3 className={styles.columnTitle}>Top Rated Talent</h3>
                <Link href="/freelancers" className={styles.columnLink}>View All →</Link>
              </div>
              <div className={styles.columnList}>
                {featured?.freelancers?.slice(0, 4).map((user: any, idx: number) => (
                  <div key={user.id} className={styles.talentListItem}>
                    <img src={user.avatar || "/avatars/default.png"} alt={user.name} className={styles.listAvatar} />
                    <div className={styles.listInfo}>
                      <h4>{user.name}</h4>
                      <p>{user.freelancerProfile?.title || "Freelancer"}</p>
                    </div>
                    <div className={styles.listRating}>
                      <span className={styles.star}>⭐ 5.0</span>
                    </div>
                    <div className={styles.listRate}>${user.freelancerProfile?.hourlyRate || 0}/hr</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Featured Projects */}
            <div className={styles.contentColumn}>
              <div className={styles.columnHeader}>
                <h3 className={styles.columnTitle}>Featured Projects</h3>
                <Link href="/projects" className={styles.columnLink}>View All →</Link>
              </div>
              <div className={styles.columnList}>
                {featured?.projects?.slice(0, 4).map((project: any, idx: number) => (
                  <div key={project.id} className={styles.projectListItem}>
                    <img src={project.images?.[0] || '/images/default_project.jpg'} alt={project.title} className={styles.listProjectImg} />
                    <div className={styles.listInfo}>
                      <h4>{project.title}</h4>
                      <p>{project.category?.name || "Code"}</p>
                    </div>
                    <div className={styles.listPrice}>${project.price}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Success Stories */}
            <div className={styles.contentColumn}>
              <div className={styles.columnHeader}>
                <h3 className={styles.columnTitle}>Success Stories</h3>
                <button onClick={() => setIsFeedbackModalOpen(true)} className={styles.columnLink}>View All →</button>
              </div>
              <div className={styles.storyCard}>
                <Quote size={24} color="#22C55E" style={{ marginBottom: '1rem' }} />
                <p className={styles.storyText}>
                  "ZilVerse helped me find amazing clients and grow my freelance business globally. My income has tripled in just 6 months!"
                </p>
                <div className={styles.storyAuthor}>
                  <img src="/avatars/default.png" alt="Wade Warren" className={styles.storyAvatar} />
                  <div>
                    <h4>Wade Warren</h4>
                    <p>Full Stack Developer</p>
                  </div>
                </div>
                <div className={styles.storyDots}>
                  <span className={styles.dotActive}></span>
                  <span className={styles.dot}></span>
                  <span className={styles.dot}></span>
                  <span className={styles.dot}></span>
                </div>
              </div>
            </div>

          </div>
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
                <Link href="/register" className={styles.btnPrimaryGreen}>
                  <UserPlus size={18} /> Create Free Account
                </Link>
                <Link href="/about" className={styles.btnSecondary}>
                  <PlayCircle size={18} /> How It Works
                </Link>
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
