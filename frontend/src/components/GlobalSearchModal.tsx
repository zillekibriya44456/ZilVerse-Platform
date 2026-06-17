"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X, ArrowRight, Clock, Zap, Briefcase, Users, Box, BookOpen, Calendar, MessageCircle } from "lucide-react";
import axios from "axios";
import { API_BASE } from "@/utils/api";

interface SearchResult {
  id: string;
  type: "job" | "freelancer" | "project" | "course" | "event" | "discussion";
  title: string;
  subtitle: string;
  href: string;
  icon: any;
  color: string;
}

const TYPE_META: Record<string, { icon: any; color: string; prefix: string }> = {
  job:        { icon: Briefcase,     color: "#3b82f6", prefix: "/jobs/" },
  freelancer: { icon: Users,         color: "#a855f7", prefix: "/freelancers/" },
  project:    { icon: Box,           color: "#22c55e", prefix: "/projects/" },
  course:     { icon: BookOpen,      color: "#f59e0b", prefix: "/academy" },
  event:      { icon: Calendar,      color: "#ec4899", prefix: "/events" },
  discussion: { icon: MessageCircle, color: "#06b6d4", prefix: "/discussions" },
};

const QUICK_LINKS = [
  { label: "Browse Jobs",       href: "/jobs",         icon: Briefcase,     color: "#3b82f6" },
  { label: "Hire Freelancers",  href: "/freelancers",  icon: Users,         color: "#a855f7" },
  { label: "Projects",          href: "/projects",     icon: Box,           color: "#22c55e" },
  { label: "Academy Courses",   href: "/academy",      icon: BookOpen,      color: "#f59e0b" },
  { label: "Events",            href: "/events",       icon: Calendar,      color: "#ec4899" },
  { label: "Discussions",       href: "/discussions",  icon: MessageCircle, color: "#06b6d4" },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearchModal({ isOpen, onClose }: Props) {
  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState<SearchResult[]>([]);
  const [loading, setLoading]   = useState(false);
  const [history, setHistory]   = useState<string[]>([]);
  const [selected, setSelected] = useState(-1);
  const inputRef  = useRef<HTMLInputElement>(null);
  const debounce  = useRef<NodeJS.Timeout | null>(null);
  const router    = useRouter();

  // Load search history from localStorage
  useEffect(() => {
    try {
      const h = JSON.parse(localStorage.getItem("zv_search_history") || "[]");
      setHistory(h.slice(0, 5));
    } catch {}
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setResults([]);
      setSelected(-1);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Search across all APIs
  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const [jobs, freelancers, projects, courses, events] = await Promise.allSettled([
        axios.get(`${API_BASE}/api/jobs?limit=5`),
        axios.get(`${API_BASE}/api/freelancers?limit=5`),
        axios.get(`${API_BASE}/api/projects?limit=5`),
        axios.get(`${API_BASE}/api/academy?limit=5`),
        axios.get(`${API_BASE}/api/events`),
      ]);

      const lq = q.toLowerCase();
      const hits: SearchResult[] = [];

      const extract = (res: PromiseSettledResult<any>, type: string, titleKey: string, subKey: string) => {
        if (res.status === "fulfilled") {
          const items: any[] = Array.isArray(res.value.data) ? res.value.data : res.value.data?.data || [];
          items.forEach(item => {
            if ((item[titleKey] || "").toLowerCase().includes(lq) || (item[subKey] || "").toLowerCase().includes(lq)) {
              const meta = TYPE_META[type] || TYPE_META.job;
              hits.push({
                id: item.id,
                type: type as any,
                title: item[titleKey] || "Untitled",
                subtitle: item[subKey] || "",
                href: `${meta.prefix}${item.id || ""}`,
                icon: meta.icon,
                color: meta.color,
              });
            }
          });
        }
      };

      extract(jobs,        "job",        "title",    "company");
      extract(freelancers, "freelancer", "name",     "bio");
      extract(projects,    "project",    "title",    "description");
      extract(courses,     "course",     "title",    "instructor");
      extract(events,      "event",      "title",    "location");

      setResults(hits.slice(0, 8));
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => search(query), 350);
    return () => { if (debounce.current) clearTimeout(debounce.current); };
  }, [query, search]);

  // Keyboard navigation
  const total = results.length;
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected(s => Math.min(s + 1, total - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setSelected(s => Math.max(s - 1, -1)); }
    if (e.key === "Enter" && selected >= 0 && results[selected]) {
      navigate(results[selected].href, results[selected].title);
    }
  };

  const navigate = (href: string, title: string) => {
    const updated = [title, ...history.filter(h => h !== title)].slice(0, 5);
    setHistory(updated);
    localStorage.setItem("zv_search_history", JSON.stringify(updated));
    router.push(href);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 999997,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(4px)",
          animation: "fadeInUp 0.15s ease",
        }}
      />

      {/* Modal */}
      <div style={{
        position: "fixed",
        top: "10vh",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 999998,
        width: "min(640px, calc(100vw - 32px))",
        animation: "scaleIn 0.2s ease",
      }}>
        <div style={{
          background: "rgba(11, 11, 20, 0.98)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        }}>

          {/* Search Input */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <Search size={20} color="#71717a" style={{ flexShrink: 0 }} />
            <input
              ref={inputRef}
              value={query}
              onChange={e => { setQuery(e.target.value); setSelected(-1); }}
              onKeyDown={handleKeyDown}
              placeholder="Search jobs, talent, projects, courses..."
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                color: "#fff", fontSize: "1rem", fontFamily: "inherit",
              }}
            />
            {query && (
              <button onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}
                style={{ background: "none", border: "none", color: "#71717a", cursor: "pointer", padding: 0 }}>
                <X size={18} />
              </button>
            )}
            <kbd style={{ padding: "0.2rem 0.5rem", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, fontSize: "0.72rem", color: "#71717a", flexShrink: 0 }}>
              ESC
            </kbd>
          </div>

          <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
            {/* Loading */}
            {loading && (
              <div style={{ padding: "1.5rem", display: "flex", justifyContent: "center" }}>
                <div className="spinner" />
              </div>
            )}

            {/* Results */}
            {!loading && results.length > 0 && (
              <div style={{ padding: "0.5rem" }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.08em", padding: "0.5rem 0.75rem" }}>
                  Results ({results.length})
                </div>
                {results.map((r, i) => {
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.id + r.type}
                      onClick={() => navigate(r.href, r.title)}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: "0.85rem",
                        padding: "0.7rem 0.75rem", borderRadius: 12, border: "none", cursor: "pointer",
                        background: selected === i ? "rgba(168,85,247,0.1)" : "transparent",
                        textAlign: "left", transition: "background 0.15s",
                      }}
                      onMouseEnter={() => setSelected(i)}
                    >
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: `${r.color}20`, color: r.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={16} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#e4e4e7", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                          {r.title}
                        </div>
                        {r.subtitle && (
                          <div style={{ fontSize: "0.75rem", color: "#71717a", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                            {r.subtitle}
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: "0.68rem", padding: "0.15rem 0.5rem", borderRadius: 99, background: `${r.color}15`, color: r.color, border: `1px solid ${r.color}30`, flexShrink: 0, textTransform: "capitalize" }}>
                        {r.type}
                      </span>
                      <ArrowRight size={14} color="#52525b" style={{ flexShrink: 0 }} />
                    </button>
                  );
                })}
              </div>
            )}

            {/* No results */}
            {!loading && query && results.length === 0 && (
              <div style={{ padding: "2rem", textAlign: "center", color: "#71717a" }}>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🔍</div>
                <p style={{ fontSize: "0.875rem" }}>No results for "<strong style={{ color: "#e4e4e7" }}>{query}</strong>"</p>
              </div>
            )}

            {/* Quick links (empty state) */}
            {!query && (
              <div style={{ padding: "0.75rem 0.5rem" }}>
                {history.length > 0 && (
                  <>
                    <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.08em", padding: "0.25rem 0.75rem 0.5rem" }}>
                      Recent
                    </div>
                    {history.map(h => (
                      <button key={h} onClick={() => setQuery(h)} style={{ width: "100%", display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.55rem 0.75rem", borderRadius: 10, border: "none", cursor: "pointer", background: "transparent", textAlign: "left", color: "#a1a1aa", fontSize: "0.875rem" }}>
                        <Clock size={14} color="#52525b" style={{ flexShrink: 0 }} />
                        {h}
                      </button>
                    ))}
                    <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "0.5rem 0.75rem" }} />
                  </>
                )}

                <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.08em", padding: "0.25rem 0.75rem 0.5rem" }}>
                  Quick Links
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem", padding: "0 0.25rem" }}>
                  {QUICK_LINKS.map(l => {
                    const Icon = l.icon;
                    return (
                      <Link key={l.href} href={l.href} onClick={onClose} style={{
                        display: "flex", alignItems: "center", gap: "0.6rem",
                        padding: "0.6rem 0.75rem", borderRadius: 10, textDecoration: "none",
                        background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
                        transition: "background 0.15s", color: "#e4e4e7", fontSize: "0.825rem", fontWeight: 500,
                      }}>
                        <Icon size={15} color={l.color} style={{ flexShrink: 0 }} />
                        {l.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer hint */}
          <div style={{ padding: "0.6rem 1.25rem", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: "1rem", fontSize: "0.7rem", color: "#52525b" }}>
            <span><kbd style={{ background: "rgba(255,255,255,0.07)", padding: "0.1rem 0.4rem", borderRadius: 4 }}>↑↓</kbd> Navigate</span>
            <span><kbd style={{ background: "rgba(255,255,255,0.07)", padding: "0.1rem 0.4rem", borderRadius: 4 }}>↵</kbd> Open</span>
            <span><kbd style={{ background: "rgba(255,255,255,0.07)", padding: "0.1rem 0.4rem", borderRadius: 4 }}>ESC</kbd> Close</span>
          </div>
        </div>
      </div>
    </>
  );
}
