"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { API_BASE } from "@/utils/api";
import styles from "./community.module.css";
import {
  MessageSquare, Video, ArrowRightLeft, Users, Calendar,
  TrendingUp, Globe, Clock, ArrowRight, Zap
} from "lucide-react";

const HUBS = [
  { title: "ZilVerse Reels", desc: "TikTok-style vertical video feed for project demos, tutorials, and creator pitches.", icon: Video, color: "#ec4899", href: "/reels" },
  { title: "Q&A Discussions", desc: "StackOverflow-style forum to ask technical questions and share ecosystem knowledge.", icon: MessageSquare, color: "#3b82f6", href: "/discussions" },
  { title: "Skills Exchange", desc: "Barter your services with other creators without spending money.", icon: ArrowRightLeft, color: "#10b981", href: "/exchange" },
  { title: "Events & Hackathons", desc: "Join live virtual events, coding streams, and global ecosystem hackathons.", icon: Calendar, color: "#8b5cf6", href: "/events" },
];

const TAG_COLORS: Record<string, string> = {
  Reels: "#ec4899", Discussions: "#3b82f6", Exchange: "#10b981", Events: "#8b5cf6", Jobs: "#06b6d4", Academy: "#f59e0b",
};

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function DiscussionSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ display: "flex", gap: "0.75rem", padding: "0.85rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12 }}>
          <div className="skeleton skeleton-avatar" style={{ width: 40, height: 40, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton skeleton-text" style={{ width: "70%", marginBottom: "0.4rem" }} />
            <div className="skeleton skeleton-text" style={{ width: "90%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function EventSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ display: "flex", gap: "0.75rem", padding: "0.85rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12 }}>
          <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 8, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton skeleton-text" style={{ width: "65%", marginBottom: "0.4rem" }} />
            <div className="skeleton skeleton-text" style={{ width: "40%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CommunityPage() {
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loadingD, setLoadingD] = useState(true);
  const [loadingE, setLoadingE] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE}/api/discussions`)
      .then(res => setDiscussions((res.data || []).slice(0, 5)))
      .catch(() => {})
      .finally(() => setLoadingD(false));

    axios.get(`${API_BASE}/api/events?limit=4`)
      .then(res => setEvents((res.data || []).slice(0, 4)))
      .catch(() => {})
      .finally(() => setLoadingE(false));
  }, []);

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Header */}
        <header className={styles.header}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.25)", borderRadius: 99, padding: "0.35rem 1rem", marginBottom: "1rem", fontSize: "0.8rem", color: "#c084fc", fontWeight: 600 }}>
            <Globe size={14} /> 150+ Countries · 25K+ Members
          </div>
          <h1 className={styles.title}>The Global Community Hub</h1>
          <p className={styles.subtitle}>
            Connect with developers, designers, and founders. Share knowledge, pitch projects, and trade skills.
          </p>
        </header>

        {/* Hub Cards */}
        <div className={styles.grid}>
          {HUBS.map((hub, i) => {
            const Icon = hub.icon;
            return (
              <Link key={i} href={hub.href} className={styles.hubCard}>
                <div className={styles.hubIcon} style={{ background: `${hub.color}20`, color: hub.color }}>
                  <Icon size={28} />
                </div>
                <h3 className={styles.hubTitle}>{hub.title}</h3>
                <p className={styles.hubDesc}>{hub.desc}</p>
                <span style={{ marginTop: "auto", fontSize: "0.8rem", color: hub.color, fontWeight: 600, display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  Explore <ArrowRight size={12} />
                </span>
              </Link>
            );
          })}
        </div>

        {/* Live Feed: Discussions + Events */}
        <section className={styles.feedSection}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>

            {/* Latest Discussions */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.1rem", fontWeight: 700 }}>
                  <MessageSquare size={18} color="#3b82f6" /> Latest Discussions
                </h2>
                <Link href="/discussions" style={{ fontSize: "0.8rem", color: "#60a5fa", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  View all <ArrowRight size={12} />
                </Link>
              </div>

              {loadingD ? <DiscussionSkeleton /> : discussions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "#52525b" }}>
                  <MessageSquare size={32} style={{ marginBottom: "0.5rem", opacity: 0.4 }} />
                  <p style={{ fontSize: "0.875rem" }}>No discussions yet.</p>
                  <Link href="/discussions" className="btn btn-secondary" style={{ marginTop: "0.75rem", display: "inline-flex", fontSize: "0.8rem", padding: "0.5rem 1rem" }}>
                    Start a Thread
                  </Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {discussions.map(d => (
                    <Link key={d.id} href="/discussions" style={{ textDecoration: "none" }}>
                      <div style={{
                        display: "flex", gap: "0.75rem", padding: "0.85rem 1rem",
                        background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
                        borderRadius: 12, transition: "border-color 0.2s, background 0.2s",
                      }}
                        onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(59,130,246,0.3)"; (e.currentTarget as HTMLElement).style.background = "rgba(59,130,246,0.05)"; }}
                        onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; }}
                      >
                        <img
                          src={d.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(d.author?.name || "U")}&background=3b82f6&color=fff`}
                          alt={d.author?.name}
                          style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                          onError={e => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(d.author?.name || "U")}&background=3b82f6&color=fff`; }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#e4e4e7", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: "0.15rem" }}>
                            {d.title}
                          </p>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.72rem", color: "#71717a" }}>
                            <span>{d.author?.name || "Anonymous"}</span>
                            <span>·</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                              <Clock size={10} /> {timeAgo(d.createdAt)}
                            </span>
                            <span>·</span>
                            <span style={{ color: "#60a5fa" }}>{d.replies?.length || 0} replies</span>
                          </div>
                        </div>
                        {d.category && (
                          <span style={{ fontSize: "0.65rem", padding: "0.2rem 0.55rem", borderRadius: 99, background: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)", flexShrink: 0, alignSelf: "flex-start" }}>
                            {d.category}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Events */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.1rem", fontWeight: 700 }}>
                  <Calendar size={18} color="#8b5cf6" /> Upcoming Events
                </h2>
                <Link href="/events" style={{ fontSize: "0.8rem", color: "#a78bfa", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  View all <ArrowRight size={12} />
                </Link>
              </div>

              {loadingE ? <EventSkeleton /> : events.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "#52525b" }}>
                  <Calendar size={32} style={{ marginBottom: "0.5rem", opacity: 0.4 }} />
                  <p style={{ fontSize: "0.875rem" }}>No events scheduled yet.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {events.map(ev => (
                    <Link key={ev.id} href="/events" style={{ textDecoration: "none" }}>
                      <div style={{
                        display: "flex", gap: "0.75rem", padding: "0.85rem 1rem",
                        background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
                        borderRadius: 12, transition: "border-color 0.2s, background 0.2s",
                      }}
                        onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.3)"; (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.05)"; }}
                        onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; }}
                      >
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(139,92,246,0.15)", color: "#a78bfa", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Calendar size={18} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#e4e4e7", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: "0.15rem" }}>
                            {ev.title}
                          </p>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.72rem", color: "#71717a" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                              <Clock size={10} /> {ev.date ? new Date(ev.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBD"}
                            </span>
                            <span>·</span>
                            <span>{ev.location || "Online"}</span>
                          </div>
                        </div>
                        <span style={{ fontSize: "0.65rem", padding: "0.2rem 0.55rem", borderRadius: 99, background: "rgba(139,92,246,0.12)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.2)", flexShrink: 0, alignSelf: "flex-start", textTransform: "capitalize" }}>
                          {ev.type || "Event"}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ marginTop: "3rem", padding: "2.5rem", background: "linear-gradient(135deg, rgba(168,85,247,0.1), rgba(59,130,246,0.08))", border: "1px solid rgba(168,85,247,0.2)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "2rem", flexWrap: "wrap" }}>
          <div>
            <h3 style={{ fontWeight: 800, fontSize: "1.3rem", marginBottom: "0.5rem", fontFamily: "'Outfit', sans-serif" }}>Ready to contribute?</h3>
            <p style={{ color: "#a1a1aa", fontSize: "0.9rem" }}>Join thousands of professionals building the future of global work.</p>
          </div>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link href="/register" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              <Zap size={15} /> Join Free
            </Link>
            <Link href="/discussions" className="btn btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              <MessageSquare size={15} /> Start a Discussion
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
