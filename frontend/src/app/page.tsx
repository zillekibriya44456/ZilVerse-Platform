"use client";
import { API_BASE } from "@/utils/api";
import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";
import { useCountry } from "@/context/CountryContext";
import dynamic from "next/dynamic";
import styles from "./home.module.css";
import AnimatedStats from "@/components/AnimatedStats";
import LiveActivityMap from "@/components/LiveActivityMap";
import TestimonialSlider from "@/components/TestimonialSlider";
import { motion } from "framer-motion";
import {
  Briefcase, Code2, Globe, Users, GraduationCap, Layers,
  Rocket, PlayCircle, CheckCircle2, ShoppingBag, Users2,
  Quote, UserPlus, Calendar, BookOpen, Zap, Star, MapPin, Clock
} from "lucide-react";

const CobeGlobe = dynamic(() => import("@/components/CobeGlobe"), { ssr: false });
const TiltCard = dynamic(() => import("@/components/TiltCard"));

// ── Ecosystem Cards ────────────────────────────────────────────────────────────
const ecosystemCards = [
  { href: "/services",    icon: Layers,       title: "Services",       desc: "Offer & hire services across 500+ categories worldwide.", link: "Explore →", color: "#D946EF", bg: "rgba(217,70,239,0.15)" },
  { href: "/freelancers", icon: Users,        title: "Talent",         desc: "Find verified talent or discover global opportunities.",  link: "Explore →", color: "#3B82F6", bg: "rgba(59,130,246,0.15)" },
  { href: "/projects",    icon: ShoppingBag,  title: "Marketplace",    desc: "Buy & sell digital products, templates, code & more.",   link: "Explore →", color: "#22C55E", bg: "rgba(34,197,94,0.15)" },
  { href: "/jobs",        icon: Briefcase,    title: "Opportunities",  desc: "Explore jobs, internships, grants & global opportunities.", link: "Explore →", color: "#06B6D4", bg: "rgba(6,182,212,0.15)" },
  { href: "/academy",     icon: GraduationCap, title: "Learn & Grow", desc: "Upskill with courses, certifications & career resources.", link: "Explore →", color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
  { href: "/community",   icon: Users2,       title: "Community",      desc: "Connect, collaborate & grow with global professionals.",  link: "Explore →", color: "#EC4899", bg: "rgba(236,72,153,0.15)" },
];

// ── Fallback Data ──────────────────────────────────────────────────────────────
const FALLBACK_FREELANCERS = [
  { id: "f1", name: "Alex Johnson",  avatar: "https://ui-avatars.com/api/?name=Alex+Johnson&background=7c3aed&color=fff",  freelancerProfile: { title: "Senior React Developer", hourlyRate: 65 }, verified: true },
  { id: "f2", name: "Maria Garcia",  avatar: "https://ui-avatars.com/api/?name=Maria+Garcia&background=ec4899&color=fff",  freelancerProfile: { title: "UI/UX Designer",          hourlyRate: 55 }, verified: true },
  { id: "f3", name: "David Smith",   avatar: "https://ui-avatars.com/api/?name=David+Smith&background=06b6d4&color=fff",   freelancerProfile: { title: "Full Stack Engineer",     hourlyRate: 80 }, verified: true },
  { id: "f4", name: "Sarah Chen",    avatar: "https://ui-avatars.com/api/?name=Sarah+Chen&background=10b981&color=fff",    freelancerProfile: { title: "Data Scientist",          hourlyRate: 90 }, verified: true },
];
const FALLBACK_PROJECTS = [
  { id: "p1", title: "E-commerce React Template",  images: ["https://placehold.co/400x240/7c3aed/ffffff?text=E-commerce"], price: 49,  seller: { name: "Alex J." } },
  { id: "p2", title: "SaaS Dashboard UI Kit",      images: ["https://placehold.co/400x240/ec4899/ffffff?text=SaaS+UI"],     price: 29,  seller: { name: "Maria G." } },
  { id: "p3", title: "AI Chatbot Integration",      images: ["https://placehold.co/400x240/06b6d4/ffffff?text=AI+Chatbot"],  price: 199, seller: { name: "David S." } },
  { id: "p4", title: "Mobile App Wireframes",       images: ["https://placehold.co/400x240/10b981/ffffff?text=Mobile"],     price: 39,  seller: { name: "Sarah C." } },
];
const FALLBACK_JOBS = [
  { id: "j1", title: "Senior React Developer",    company: "TechNova Inc.",    location: "Remote",    type: "Full-Time", salary: "$80–120K" },
  { id: "j2", title: "UI/UX Designer",             company: "DesignCraft",      location: "Remote",    type: "Contract",  salary: "$50–70/hr" },
  { id: "j3", title: "Backend Engineer (Node.js)", company: "CloudScale",       location: "Singapore", type: "Full-Time", salary: "$90–130K" },
  { id: "j4", title: "Data Scientist",             company: "DataMind AI",      location: "Remote",    type: "Full-Time", salary: "$100–140K" },
  { id: "j5", title: "DevOps Engineer",            company: "InfraCorp",        location: "London, UK", type: "Full-Time", salary: "$85–115K" },
];

// ── Skeleton Loaders ──────────────────────────────────────────────────────────
function FreelancerSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 0" }}>
          <div className="skeleton skeleton-avatar" style={{ width: 42, height: 42, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton skeleton-text w-3/4" />
            <div className="skeleton skeleton-text w-1/2" style={{ marginBottom: 0 }} />
          </div>
          <div className="skeleton" style={{ width: 50, height: 22, borderRadius: 8 }} />
        </div>
      ))}
    </div>
  );
}

function ProjectSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div className="skeleton skeleton-img" style={{ width: 60, height: 44, flexShrink: 0, borderRadius: 8 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton skeleton-text w-3/4" />
            <div className="skeleton skeleton-text w-1/2" style={{ marginBottom: 0 }} />
          </div>
          <div className="skeleton" style={{ width: 40, height: 20, borderRadius: 6 }} />
        </div>
      ))}
    </div>
  );
}

function JobSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} style={{ padding: "0.75rem", background: "rgba(255,255,255,0.02)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="skeleton skeleton-text w-3/4" />
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.3rem" }}>
            <div className="skeleton skeleton-text w-1/3" style={{ marginBottom: 0 }} />
            <div className="skeleton skeleton-text w-1/4" style={{ marginBottom: 0 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function Home() {
  const { selectedCountry } = useCountry();
  const [featured, setFeatured] = useState<any>({
    freelancers: [], projects: [], services: [], jobs: [],
    courses: [], events: [], testimonials: [], stats: null
  });
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [newFeedback, setNewFeedback] = useState({ text: "", name: "", role: "", stars: 5 });

  useEffect(() => {
    // Single batched request — testimonials + stats bundled server-side
    axios.get(`${API_BASE}/api/homepage/featured`)
      .then(res => { if (res.data?.freelancers) setFeatured(res.data); })
      .catch(() => {})
      .finally(() => setFeaturedLoading(false));
  }, []);

  const handlePostFeedback = async () => {
    if (!newFeedback.text || !newFeedback.name || !newFeedback.role) {
      alert("Please fill in all feedback fields."); return;
    }
    try {
      await axios.post(`${API_BASE}/api/testimonials`, newFeedback);
      alert("Feedback submitted! Awaiting verification.");
      setNewFeedback({ text: "", name: "", role: "", stars: 5 });
      setIsFeedbackModalOpen(false);
    } catch (err: any) {
      alert("Error: " + (err.response?.data?.error || err.message));
    }
  };

  const freelancers  = featured.freelancers?.length > 0  ? featured.freelancers  : FALLBACK_FREELANCERS;
  const projects     = featured.projects?.length > 0     ? featured.projects     : FALLBACK_PROJECTS;
  const jobs         = featured.jobs?.length > 0         ? featured.jobs         : FALLBACK_JOBS;
  const courses      = featured.courses  || [];
  const events       = featured.events   || [];
  const testimonials = featured.testimonials?.length > 0 ? featured.testimonials : [];

  return (
    <div className={styles.page}>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.particles} style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 0, opacity: 0.6 }}>
          <CobeGlobe />
        </div>
        <div className={`container-wide ${styles.heroContainer}`}>
          <div className={styles.heroContent}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className={styles.badge}>
              <div className={styles.badgeDot}></div>
              <span>ZILVERSE — YOUR GLOBAL TECH ECOSYSTEM</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className={styles.title}>
              Build. Work. Grow.<br />
              <span className={styles.textGradient}>All In One Place.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className={styles.subtitle}>
              The ultimate worldwide ecosystem combining freelancing, project marketplace, job portals, and digital services — serving talent in{" "}
              <span style={{ color: "var(--highlight)" }}>150+ countries.</span>
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className={styles.ctaGroup}>
              <Link href="/register" className={styles.btnPrimaryGradient}>
                <Rocket size={18} /> Get Started Free
              </Link>
              <Link href="/jobs" className={styles.btnSecondary}>
                <PlayCircle size={18} /> Explore Opportunities
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }} className={styles.socialProof}>
              <div className={styles.avatars}>
                <img src="https://ui-avatars.com/api/?name=A&background=7c3aed&color=fff" alt="User" />
                <img src="https://ui-avatars.com/api/?name=B&background=ec4899&color=fff" alt="User" />
                <img src="https://ui-avatars.com/api/?name=C&background=06b6d4&color=fff" alt="User" />
                <img src="https://ui-avatars.com/api/?name=D&background=10b981&color=fff" alt="User" />
              </div>
              <span>Trusted by 25,000+ people worldwide</span>
              <CheckCircle2 size={16} color="#22C55E" />
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }} className={styles.heroVisual}>
            <LiveActivityMap />
          </motion.div>
        </div>
      </section>

      {/* ── Live Stats ───────────────────────────────────────────── */}
      <section className={styles.statsSection}>
        <div className="container-wide">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className={styles.statsGlassContainer}>
            <AnimatedStats />
          </motion.div>
        </div>
      </section>

      {/* ── Core Ecosystem ───────────────────────────────────────── */}
      <section className={styles.ecosystemSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div className={styles.ecoPretitle}>THE ZILVERSE ECOSYSTEM</div>
            <h2 className={styles.sectionTitle}>Everything You Need, In One Place</h2>
            <p className={styles.sectionSubtitle}>
              Powerful modules combined into one unified platform to help you<br />build, work, and grow without boundaries.
            </p>
          </div>
          <div className={styles.ecosystemGrid}>
            {ecosystemCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div key={card.href} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.08 }}>
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

      {/* ── 3-Column: Talent / Projects / Jobs ───────────────────── */}
      <section className={styles.featuredGridSection}>
        <div className="container">
          <div className={styles.grid3Block}>

            {/* Talent */}
            <div className={styles.contentColumn}>
              <div className={styles.columnHeader}>
                <h3 className={styles.columnTitle}>⭐ Top Rated Talent</h3>
                <Link href="/freelancers" className={styles.columnLink}>View All →</Link>
              </div>
              {featuredLoading ? <FreelancerSkeleton /> : (
                <div className={styles.columnList}>
                  {freelancers.slice(0, 4).map((user: any) => (
                    <Link key={user.id} href={`/freelancers/${user.id}`} className={styles.talentListItem} style={{ textDecoration: "none" }}>
                      <img
                        src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "U")}&background=7c3aed&color=fff`}
                        alt={user.name}
                        className={styles.listAvatar}
                        onError={(e: any) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "U")}&background=7c3aed&color=fff`; }}
                      />
                      <div className={styles.listInfo}>
                        <h4>{user.name}</h4>
                        <p>{user.freelancerProfile?.title || "Freelancer"}</p>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem" }}>
                        <span className={styles.star}>⭐ 5.0</span>
                        <span className={styles.listRate}>${user.freelancerProfile?.hourlyRate || 0}/hr</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Projects */}
            <div className={styles.contentColumn}>
              <div className={styles.columnHeader}>
                <h3 className={styles.columnTitle}>📦 Featured Projects</h3>
                <Link href="/projects" className={styles.columnLink}>View All →</Link>
              </div>
              {featuredLoading ? <ProjectSkeleton /> : (
                <div className={styles.columnList}>
                  {projects.slice(0, 4).map((project: any) => (
                    <Link key={project.id} href={`/projects/${project.id}`} className={styles.projectListItem} style={{ textDecoration: "none" }}>
                      <img
                        src={project.images?.[0] || "https://placehold.co/60x44/7c3aed/ffffff?text=P"}
                        alt={project.title}
                        className={styles.listProjectImg}
                        onError={(e: any) => { e.target.src = "https://placehold.co/60x44/7c3aed/ffffff?text=P"; }}
                      />
                      <div className={styles.listInfo}>
                        <h4>{project.title}</h4>
                        <p>{project.seller?.name || "Creator"}</p>
                      </div>
                      <div className={styles.listPrice}>${project.price}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Jobs */}
            <div className={styles.contentColumn}>
              <div className={styles.columnHeader}>
                <h3 className={styles.columnTitle}>💼 Latest Jobs</h3>
                <Link href="/jobs" className={styles.columnLink}>View All →</Link>
              </div>
              {featuredLoading ? <JobSkeleton /> : (
                <div className={styles.columnList}>
                  {jobs.slice(0, 5).map((job: any) => (
                    <Link key={job.id} href={`/jobs/${job.id}`} className={styles.jobListItem} style={{ textDecoration: "none" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.2rem", color: "#e4e4e7" }}>{job.title}</h4>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "0.75rem", color: "#a1a1aa" }}>{job.company}</span>
                          <span style={{ fontSize: "0.65rem", color: "#71717a" }}>•</span>
                          <span style={{ fontSize: "0.72rem", color: "#71717a", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                            <MapPin size={10} /> {job.location}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.2rem", flexShrink: 0 }}>
                        <span style={{
                          fontSize: "0.68rem", fontWeight: 600, padding: "0.15rem 0.5rem",
                          borderRadius: 99, background: "rgba(6,182,212,0.12)", color: "#22d3ee",
                          border: "1px solid rgba(6,182,212,0.2)"
                        }}>{job.type}</span>
                        <span style={{ fontSize: "0.72rem", color: "#22c55e", fontWeight: 600 }}>{job.salary}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ── Courses & Events Row ──────────────────────────────────── */}
      {(courses.length > 0 || events.length > 0) && (
        <section className={styles.featuredGridSection} style={{ paddingTop: 0 }}>
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>

              {/* Courses */}
              {courses.length > 0 && (
                <div className={styles.contentColumn}>
                  <div className={styles.columnHeader}>
                    <h3 className={styles.columnTitle}>🎓 Top Courses</h3>
                    <Link href="/academy" className={styles.columnLink}>Browse All →</Link>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {courses.slice(0, 4).map((c: any) => (
                      <Link key={c.id} href="/academy" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem", background: "rgba(255,255,255,0.02)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)", transition: "background 0.2s" }}>
                        <img src={c.image} alt={c.title} style={{ width: 52, height: 38, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} onError={(e: any) => { e.target.style.display = "none"; }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "0.825rem", fontWeight: 600, color: "#e4e4e7", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{c.title}</div>
                          <div style={{ fontSize: "0.72rem", color: "#a1a1aa" }}>{c.instructor} · {c.level}</div>
                        </div>
                        <div style={{ flexShrink: 0, textAlign: "right" }}>
                          <div style={{ fontSize: "0.72rem", color: "#fbbf24", fontWeight: 700 }}>⭐ {c.rating}</div>
                          <div style={{ fontSize: "0.72rem", color: c.price === 0 ? "#4ade80" : "#e4e4e7", fontWeight: 600 }}>
                            {c.price === 0 ? "Free" : `$${c.price}`}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Events */}
              {events.length > 0 && (
                <div className={styles.contentColumn}>
                  <div className={styles.columnHeader}>
                    <h3 className={styles.columnTitle}>🗓️ Upcoming Events</h3>
                    <Link href="/events" className={styles.columnLink}>View All →</Link>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {events.slice(0, 4).map((ev: any) => (
                      <Link key={ev.id} href="/events" style={{ textDecoration: "none", display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "0.7rem", background: "rgba(255,255,255,0.02)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)", transition: "background 0.2s" }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(168,85,247,0.15)", color: "#c084fc", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid rgba(168,85,247,0.2)" }}>
                          <Calendar size={16} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "0.825rem", fontWeight: 600, color: "#e4e4e7", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{ev.title}</div>
                          <div style={{ fontSize: "0.72rem", color: "#a1a1aa", display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.2rem" }}>
                            <span>{ev.date}</span>
                            <span>·</span>
                            <span>{ev.location}</span>
                          </div>
                        </div>
                        <span style={{ fontSize: "0.68rem", fontWeight: 600, padding: "0.15rem 0.5rem", borderRadius: 99, background: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.2)", flexShrink: 0 }}>
                          {ev.type}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </section>
      )}

      {/* ── Testimonials ─────────────────────────────────────────── */}
      {(testimonials.length > 0 || featuredLoading) && (
        <section className={styles.testimonialsSection}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <div className={styles.ecoPretitle}>TRUSTED WORLDWIDE</div>
              <h2 className={styles.sectionTitle}>What Our Community Says</h2>
            </div>
            <TestimonialSlider testimonials={testimonials} />
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <button onClick={() => setIsFeedbackModalOpen(true)} className={styles.btnSecondary} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                <Quote size={16} /> Share Your Story
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── Final CTA ────────────────────────────────────────────── */}
      <section className={styles.finalCtaSection}>
        <div className="container">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className={styles.ctaBanner}>
            <div className={styles.ctaContent}>
              <h2>Join the Global Opportunity Ecosystem</h2>
              <p>Build, work, and grow alongside thousands of professionals worldwide.</p>
              <div className={styles.ctaGroup} style={{ justifyContent: "center" }}>
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

      {/* ── Feedback Modal ───────────────────────────────────────── */}
      {isFeedbackModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Share Your Experience</h3>
            <input type="text" placeholder="Your Name" value={newFeedback.name} onChange={e => setNewFeedback({ ...newFeedback, name: e.target.value })} className={styles.inputField} />
            <input type="text" placeholder="Your Role (e.g. Freelancer, Buyer)" value={newFeedback.role} onChange={e => setNewFeedback({ ...newFeedback, role: e.target.value })} className={styles.inputField} />
            <select value={newFeedback.stars} onChange={e => setNewFeedback({ ...newFeedback, stars: parseInt(e.target.value) })} className={styles.inputField}>
              {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Star{n !== 1 ? "s" : ""}</option>)}
            </select>
            <textarea placeholder="Your review..." value={newFeedback.text} onChange={e => setNewFeedback({ ...newFeedback, text: e.target.value })} className={styles.textArea} />
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
