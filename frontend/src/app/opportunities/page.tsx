"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Briefcase, 
  Coins, 
  GraduationCap, 
  Calendar, 
  ArrowRight, 
  MapPin, 
  Clock, 
  Sparkles, 
  Globe,
  Award,
  ArrowUpRight,
  TrendingUp,
  Target
} from "lucide-react";
import styles from "./opportunities.module.css";

export default function OpportunitiesPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", label: "All Opportunities", count: 12 },
    { id: "grants", label: "Grants & Funding", count: 3 },
    { id: "remote", label: "Remote Work", count: 3 },
    { id: "internships", label: "Internships", count: 3 },
    { id: "events", label: "Events & Hackathons", count: 3 }
  ];

  const grants = [
    {
      id: "grant-1",
      title: "AI Innovation & Web3 Integration Grant",
      org: "ZilLabs Foundation",
      amount: "$250,000",
      desc: "Funding breakthrough products merging zero-knowledge proofs and transformer neural networks.",
      deadline: "June 30, 2026",
      impact: "98/100",
      tags: ["AI", "Web3", "ZK-Proofs"]
    },
    {
      id: "grant-2",
      title: "Ecology & Sustainability Venture Fund",
      org: "ZilVerse Green Ventures",
      amount: "$150,000",
      desc: "For decentralized projects tackling carbon credits tracking or smart-grid optimization.",
      deadline: "July 15, 2026",
      impact: "99/100",
      tags: ["GreenTech", "DeFi", "Climate"]
    },
    {
      id: "grant-3",
      title: "Global Open Source Infrastructure Grant",
      org: "Linux Foundation Partner",
      amount: "$80,000",
      desc: "Supporting developer toolings, package security audits, and developer efficiency toolkits.",
      deadline: "Rolling",
      impact: "95/100",
      tags: ["Open Source", "DevOps", "Security"]
    }
  ];

  const remoteJobs = [
    {
      id: "job-1",
      title: "Senior Next.js & React Architect",
      company: "DevStack Corp",
      salary: "$120k–$150k/yr",
      location: "Remote (Global)",
      posted: "1 day ago",
      tags: ["Next.js", "TypeScript", "Tailwind"]
    },
    {
      id: "job-2",
      title: "AI Research & LLM Specialist",
      company: "NeuroTech AI",
      salary: "$180k–$220k/yr",
      location: "Remote (US/Canada)",
      posted: "Just now",
      tags: ["PyTorch", "NLP", "Transformers"]
    },
    {
      id: "job-3",
      title: "Staff Cloud Engineer (Kubernetes)",
      company: "CloudScale Inc",
      salary: "€80k–€110k/yr",
      location: "Remote (Europe)",
      posted: "5 days ago",
      tags: ["Docker", "Kubernetes", "AWS"]
    }
  ];

  const internships = [
    {
      id: "intern-1",
      title: "UI/UX Design Intern",
      company: "DesignHive Studios",
      stipend: "$1,200/mo",
      location: "Remote",
      posted: "2 days ago",
      tags: ["Figma", "Design System", "Prototyping"]
    },
    {
      id: "intern-2",
      title: "Frontend Developer Intern",
      company: "ZilLabs Devs",
      stipend: "$800/mo",
      location: "Bengaluru, IN (Hybrid)",
      posted: "Just now",
      tags: ["React", "CSS Grid", "JavaScript"]
    },
    {
      id: "intern-3",
      title: "Machine Learning Intern",
      company: "DeepMind Simulation",
      stipend: "$1,500/mo",
      location: "Remote",
      posted: "1 week ago",
      tags: ["Python", "TensorFlow", "Pandas"]
    }
  ];

  const events = [
    {
      id: "event-1",
      title: "ZilVerse Global Hackathon 2026",
      organizer: "ZilVerse Core",
      date: "July 20–25, 2026",
      location: "Online / WW",
      price: "Free to Attend",
      type: "Hackathon",
      attending: "2,500+"
    },
    {
      id: "event-2",
      title: "AI & Web3 Synergy Summit",
      organizer: "TechFuture Consortium",
      date: "August 12, 2026",
      location: "San Francisco, CA & Online",
      price: "$149 (Free for students)",
      type: "Conference",
      attending: "1,200+"
    },
    {
      id: "event-3",
      title: "Next.js Core Performance Masterclass",
      organizer: "Vercel Ecosystem Partners",
      date: "June 28, 2026",
      location: "Online",
      price: "Free to Attend",
      type: "Workshop",
      attending: "850+"
    }
  ];

  return (
    <div className={styles.page}>
      
      {/* Background Orbs */}
      <div className={styles.backgroundGlow} />
      <div className={styles.backgroundGlowSecond} />

      <div className="container">
        
        {/* Hub Header */}
        <header className={styles.headerSection}>
          <div className={styles.shimmerBadge}>
            <Sparkles size={14} className={styles.sparkleIcon} />
            <span>ZilVerse Career & Capital Portal</span>
          </div>
          <h1 className={styles.title}>
            Global Opportunities <span className="text-gradient">Engine</span>
          </h1>
          <p className={styles.subtitle}>
            Explore equity-free capital, borderless remote roles, paid internships, and global tech hackathons. Empowering creators and builders everywhere.
          </p>

          {/* Quick Stats Grid */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>$480K+</span>
              <span className={styles.statLabel}>Available Grants</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>120+</span>
              <span className={styles.statLabel}>Remote Careers</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>15+</span>
              <span className={styles.statLabel}>Active Events</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>WW</span>
              <span className={styles.statLabel}>Global Coverage</span>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className={styles.filterContainer}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`${styles.filterPill} ${activeCategory === cat.id ? styles.activePill : ""}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
                <span className={styles.pillCount}>{cat.count}</span>
              </button>
            ))}
          </div>
        </header>

        {/* Dynamic Categorized Sections */}

        {/* 1. GRANTS & FUNDING */}
        {(activeCategory === "all" || activeCategory === "grants") && (
          <section className={styles.hubSection}>
            <div className={styles.hubSectionHeader}>
              <div className={styles.sectionTitleWrapper}>
                <div className={`${styles.iconContainer} ${styles.grantsColor}`}>
                  <Coins size={22} />
                </div>
                <div>
                  <h2>Grants & Venture Capital</h2>
                  <p>Secure equity-free financing, community tokens, and strategic seed investment.</p>
                </div>
              </div>
              <Link href="/fund" className={styles.viewAllBtn}>
                Launch Fund Hub <ArrowUpRight size={16} />
              </Link>
            </div>

            <div className={styles.cardGrid}>
              {grants.map((grant) => (
                <div key={grant.id} className={styles.opportunityCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.tagBadge}>Funding Available</span>
                    <div className={styles.impactBadge}>
                      <Target size={12} />
                      <span>Impact: {grant.impact}</span>
                    </div>
                  </div>
                  <h3 className={styles.cardTitle}>{grant.title}</h3>
                  <p className={styles.cardMeta}>by {grant.org}</p>
                  <p className={styles.cardDescription}>{grant.desc}</p>
                  <div className={styles.cardHighlights}>
                    <div className={styles.highlightItem}>
                      <span className={styles.highlightLabel}>Amount</span>
                      <span className={`${styles.highlightValue} ${styles.amountText}`}>{grant.amount}</span>
                    </div>
                    <div className={styles.highlightItem}>
                      <span className={styles.highlightLabel}>Deadline</span>
                      <span className={styles.highlightValue}>{grant.deadline}</span>
                    </div>
                  </div>
                  <div className={styles.cardTags}>
                    {grant.tags.map(t => <span key={t} className={styles.cardTag}>{t}</span>)}
                  </div>
                  <div className={styles.cardFooter}>
                    <Link href="/fund" className={styles.cardCta}>
                      Apply for Grant <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 2. REMOTE WORK */}
        {(activeCategory === "all" || activeCategory === "remote") && (
          <section className={styles.hubSection}>
            <div className={styles.hubSectionHeader}>
              <div className={styles.sectionTitleWrapper}>
                <div className={`${styles.iconContainer} ${styles.remoteColor}`}>
                  <Briefcase size={22} />
                </div>
                <div>
                  <h2>Borderless Remote Careers</h2>
                  <p>Apply to premium engineering, design, and product management roles global-wide.</p>
                </div>
              </div>
              <Link href="/remote" className={styles.viewAllBtn}>
                Browse Remote Board <ArrowUpRight size={16} />
              </Link>
            </div>

            <div className={styles.cardGrid}>
              {remoteJobs.map((job) => (
                <div key={job.id} className={styles.opportunityCard}>
                  <div className={styles.cardHeader}>
                    <span className={`${styles.tagBadge} ${styles.remoteBadge}`}>Full-Time</span>
                    <span className={styles.postedBadge}>
                      <Clock size={12} />
                      <span>{job.posted}</span>
                    </span>
                  </div>
                  <h3 className={styles.cardTitle}>{job.title}</h3>
                  <p className={styles.cardMeta}>{job.company}</p>
                  <p className={styles.cardDescription}>Join dynamic teams with fully distributed infrastructure and asynchronous workspace cultures.</p>
                  <div className={styles.cardHighlights}>
                    <div className={styles.highlightItem}>
                      <span className={styles.highlightLabel}>Compensation</span>
                      <span className={`${styles.highlightValue} ${styles.remoteColorText}`}>{job.salary}</span>
                    </div>
                    <div className={styles.highlightItem}>
                      <span className={styles.highlightLabel}>Location</span>
                      <span className={styles.highlightValue}>
                        <Globe size={12} style={{ display: "inline", marginRight: "3px", verticalAlign: "middle" }} />
                        {job.location}
                      </span>
                    </div>
                  </div>
                  <div className={styles.cardTags}>
                    {job.tags.map(t => <span key={t} className={styles.cardTag}>{t}</span>)}
                  </div>
                  <div className={styles.cardFooter}>
                    <Link href="/remote" className={styles.cardCta}>
                      Apply Directly <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. INTERNSHIPS */}
        {(activeCategory === "all" || activeCategory === "internships") && (
          <section className={styles.hubSection}>
            <div className={styles.hubSectionHeader}>
              <div className={styles.sectionTitleWrapper}>
                <div className={`${styles.iconContainer} ${styles.internColor}`}>
                  <GraduationCap size={22} />
                </div>
                <div>
                  <h2>Paid Internships & Fellowships</h2>
                  <p>Step into the tech workspace with structured learning tracks, mentoring and solid stipends.</p>
                </div>
              </div>
              <Link href="/internships" className={styles.viewAllBtn}>
                Explore Internships <ArrowUpRight size={16} />
              </Link>
            </div>

            <div className={styles.cardGrid}>
              {internships.map((intern) => (
                <div key={intern.id} className={styles.opportunityCard}>
                  <div className={styles.cardHeader}>
                    <span className={`${styles.tagBadge} ${styles.internBadge}`}>Internship</span>
                    <span className={styles.postedBadge}>
                      <Clock size={12} />
                      <span>{intern.posted}</span>
                    </span>
                  </div>
                  <h3 className={styles.cardTitle}>{intern.title}</h3>
                  <p className={styles.cardMeta}>{intern.company}</p>
                  <p className={styles.cardDescription}>Build real portfolio modules, collaborate in Scrum pipelines, and earn certificates.</p>
                  <div className={styles.cardHighlights}>
                    <div className={styles.highlightItem}>
                      <span className={styles.highlightLabel}>Stipend</span>
                      <span className={`${styles.highlightValue} ${styles.internColorText}`}>{intern.stipend}</span>
                    </div>
                    <div className={styles.highlightItem}>
                      <span className={styles.highlightLabel}>Structure</span>
                      <span className={styles.highlightValue}>
                        <MapPin size={12} style={{ display: "inline", marginRight: "3px", verticalAlign: "middle" }} />
                        {intern.location}
                      </span>
                    </div>
                  </div>
                  <div className={styles.cardTags}>
                    {intern.tags.map(t => <span key={t} className={styles.cardTag}>{t}</span>)}
                  </div>
                  <div className={styles.cardFooter}>
                    <Link href="/internships" className={styles.cardCta}>
                      Submit Application <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. EVENTS & HACKATHONS */}
        {(activeCategory === "all" || activeCategory === "events") && (
          <section className={styles.hubSection}>
            <div className={styles.hubSectionHeader}>
              <div className={styles.sectionTitleWrapper}>
                <div className={`${styles.iconContainer} ${styles.eventsColor}`}>
                  <Calendar size={22} />
                </div>
                <div>
                  <h2>Hackathons, Workshops & Summits</h2>
                  <p>Compete, hack, network and upgrade your engineering abilities on global tech panels.</p>
                </div>
              </div>
              <Link href="/events" className={styles.viewAllBtn}>
                Register for Events <ArrowUpRight size={16} />
              </Link>
            </div>

            <div className={styles.cardGrid}>
              {events.map((event) => (
                <div key={event.id} className={styles.opportunityCard}>
                  <div className={styles.cardHeader}>
                    <span className={`${styles.tagBadge} ${styles.eventsBadge}`}>{event.type}</span>
                    <span className={styles.attendingBadge}>
                      <Award size={12} />
                      <span>{event.attending} Registered</span>
                    </span>
                  </div>
                  <h3 className={styles.cardTitle}>{event.title}</h3>
                  <p className={styles.cardMeta}>organized by {event.organizer}</p>
                  <p className={styles.cardDescription}>Accelerated timelines, direct mentoring, project showcases, and prize pools.</p>
                  <div className={styles.cardHighlights}>
                    <div className={styles.highlightItem}>
                      <span className={styles.highlightLabel}>Date & Time</span>
                      <span className={`${styles.highlightValue} ${styles.eventsColorText}`}>{event.date}</span>
                    </div>
                    <div className={styles.highlightItem}>
                      <span className={styles.highlightLabel}>Entry Fee</span>
                      <span className={styles.highlightValue}>{event.price}</span>
                    </div>
                  </div>
                  <div className={styles.cardFooter}>
                    <Link href="/events" className={styles.cardCta}>
                      Claim Ticket <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Global Hub CTA banner at bottom */}
        <section className={styles.hubBanner}>
          <div className={styles.bannerGlow} />
          <div className={styles.bannerContent}>
            <h2 className={styles.bannerTitle}>Listing an Opportunity?</h2>
            <p className={styles.bannerText}>
              Connect with thousands of student developers, seasoned designers, and startups globally. Promote grants, open remote roles, internships, or events.
            </p>
            <div className={styles.bannerActions}>
              <Link href="/fund" className="btn btn-primary">
                Post Grant Opportunity
              </Link>
              <Link href="/remote" className="btn btn-secondary">
                List Remote Role
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
