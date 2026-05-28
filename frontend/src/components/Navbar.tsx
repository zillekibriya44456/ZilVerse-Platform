"use client";
import { API_BASE } from "@/utils/api";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import CountrySelector from "./CountrySelector";
import LanguageSelector from "./LanguageSelector";
import styles from "./Navbar.module.css";
import { socket } from "@/utils/socket";

const TYPE_ICONS: Record<string, string> = {
  announcement: "📢",
  maintenance:  "🔧",
  update:       "🚀",
  warning:      "⚠️",
};

const MEGA_MENU = [
  {
    title: "Platform",
    items: [
      { label: "Home", href: "/", desc: "Go to ecosystem homepage.", icon: "🏠" },
      { label: "Services", href: "/services", desc: "Premium digital services.", icon: "🛒" },
      { label: "Freelancers", href: "/freelancers", desc: "Hire top global talent.", icon: "💼" },
      { label: "Projects", href: "/projects", desc: "Browse pre-built source code & assets.", icon: "🚀" },
      { label: "Job Board", href: "/jobs", desc: "Find remote & local tech jobs.", icon: "👔" },
    ]
  },
  {
    title: "Opportunities",
    items: [
      { label: "Grants & Funding", href: "/fund", desc: "Capital for your startup.", icon: "💰" },
      { label: "Events", href: "/events", desc: "Tech meetups & conferences.", icon: "📅" },
      { label: "Internships", href: "/internships", desc: "Kickstart your career.", icon: "🎓" },
      { label: "Remote Work", href: "/remote", desc: "Work from anywhere.", icon: "🌍" },
    ]
  },
  {
    title: "Learn & Innovate",
    items: [
      { label: "Academy", href: "/academy", desc: "Master new tech skills.", icon: "📚" },
      { label: "Innovation Hub", href: "/innovation", desc: "Incubate your ideas.", icon: "💡" },
      { label: "Research", href: "/research", desc: "Deep-dive whitepapers.", icon: "🔬" },
      { label: "Certifications", href: "/certifications", desc: "Earn verified credentials.", icon: "🏆" },
      { label: "AI Interview Prep", href: "/interview", desc: "Interactive role & sandbox coding prep.", icon: "🤖" },
    ]
  },
  {
    title: "Community",
    items: [
      { label: "InnoReels", href: "/reels", desc: "Short-form tech content.", icon: "📱" },
      { label: "Exchange", href: "/exchange", desc: "Trade ideas & assets.", icon: "🔄" },
      { label: "Creator Network", href: "/creators", desc: "Join top influencers.", icon: "✨" },
      { label: "Discussions", href: "/discussions", desc: "Engage in tech forums.", icon: "💬" },
    ]
  },
  {
    title: "Company",
    items: [
      { label: "About", href: "/about", desc: "Our mission & vision.", icon: "🏢" },
      { label: "Contact", href: "/contact", desc: "Get in touch with us.", icon: "📬" },
      { label: "Apply", href: "/apply", desc: "Join the core team.", icon: "📝" },
      { label: "Support", href: "/help", desc: "24/7 global assistance.", icon: "🛟" },
    ]
  }
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

  // Notification Bell State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    // Initial load
    axios.get(`${API_BASE}/api/admin/notifications`)
      .then(r => setNotifications(r.data))
      .catch(() => {});

    // Real-time socket listener
    const handleNewNotif = (notif: any) => {
      setNotifications(prev => [notif, ...prev]);
    };

    socket.on('new_notification', handleNewNotif);

    return () => {
      socket.off('new_notification', handleNewNotif);
    };
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem("zv_dismissed_notifs");
    if (stored) setDismissed(JSON.parse(stored));
  }, []);

  const dismissNotif = (id: string) => {
    const updated = [...dismissed, id];
    setDismissed(updated);
    sessionStorage.setItem("zv_dismissed_notifs", JSON.stringify(updated));
  };

  const visibleNotifs = notifications.filter(n => !dismissed.includes(n.id));

  const handleLogout = async () => { await logout(); router.push("/"); };
  useEffect(() => { setActiveMenu(null); setIsMobileMenuOpen(false); }, [pathname]);

  const handleMouseEnter = (title: string) => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setActiveMenu(title);
  };

  const handleMouseLeave = () => {
    closeTimeout.current = setTimeout(() => {
      setActiveMenu(null);
    }, 150); // slight delay to make moving to dropdown smooth
  };

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        Zil<span className={styles.logoAccent}>Verse</span>
      </Link>

      {/* Desktop Navigation */}
      <nav className={styles.desktopNav}>
        <Link href="/" className={styles.navLink} style={{ textDecoration: 'none' }}>
          Home
        </Link>
        <Link href="/services" className={styles.navLink} style={{ textDecoration: 'none' }}>
          Services
        </Link>
        <Link href="/freelancers" className={styles.navLink} style={{ textDecoration: 'none' }}>
          Freelancers
        </Link>
        <Link href="/projects" className={styles.navLink} style={{ textDecoration: 'none' }}>
          Projects
        </Link>
        <Link href="/jobs" className={styles.navLink} style={{ textDecoration: 'none' }}>
          Job Board
        </Link>
        {MEGA_MENU.filter(menu => menu.title !== "Platform").map((menu) => (
          <div 
            key={menu.title} 
            className={styles.navItemWrapper}
            onMouseEnter={() => handleMouseEnter(menu.title)}
            onMouseLeave={handleMouseLeave}
          >
            <button className={`${styles.navLink} ${activeMenu === menu.title ? styles.active : ""}`}>
              {menu.title}
              <svg className={styles.chevron} viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            {activeMenu === menu.title && (
              <div className={styles.megaMenuDropdown}>
                <div className={styles.megaMenuGrid}>
                  {menu.items.map(item => (
                    <Link key={item.href} href={item.href} className={styles.megaMenuItem} onClick={() => setActiveMenu(null)}>
                      <div className={styles.menuItemIcon}>{item.icon}</div>
                      <div>
                        <div className={styles.menuItemLabel}>{item.label}</div>
                        <div className={styles.menuItemDesc}>{item.desc}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className={styles.actions}>
        <div className={styles.selectors}>
          <LanguageSelector />
          <CountrySelector />
        </div>

        {/* 🔔 Notification Bell */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setIsBellOpen(!isBellOpen)}
            style={{
              background: "none", border: "1px solid rgba(255,255,255,.1)",
              borderRadius: "10px", padding: ".45rem .65rem",
              cursor: "pointer", position: "relative", color: "#d4d4d8",
              fontSize: "1.1rem", transition: "border-color .2s",
              display: "flex", alignItems: "center", gap: ".3rem"
            }}
          >
            🔔
            {visibleNotifs.length > 0 && (
              <span style={{
                position: "absolute", top: "-6px", right: "-6px",
                background: "#7c3aed", color: "#fff",
                fontSize: ".6rem", fontWeight: 800,
                borderRadius: "99px", padding: "2px 5px",
                lineHeight: 1, minWidth: "16px", textAlign: "center"
              }}>{visibleNotifs.length}</span>
            )}
          </button>

          {isBellOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 12px)", right: 0,
              width: "340px", background: "rgba(9,9,11,.95)",
              border: "1px solid rgba(139,92,246,.3)", borderRadius: "16px",
              backdropFilter: "blur(20px)", zIndex: 99999,
              boxShadow: "0 16px 48px rgba(0,0,0,.6)", overflow: "hidden"
            }}>
              <div style={{ padding: "1rem 1.2rem", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: ".95rem" }}>Notifications</span>
                <button onClick={() => setIsBellOpen(false)} style={{ background: "none", border: "none", color: "#71717a", cursor: "pointer", fontSize: "1rem" }}>✕</button>
              </div>
              {visibleNotifs.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "#52525b", fontSize: ".88rem" }}>No new notifications</div>
              ) : (
                <div style={{ maxHeight: "360px", overflowY: "auto" }}>
                  {visibleNotifs.map((n: any) => (
                    <div key={n.id} style={{
                      padding: "1rem 1.2rem",
                      borderBottom: "1px solid rgba(255,255,255,.04)",
                      display: "flex", gap: ".8rem", alignItems: "flex-start"
                    }}>
                      <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>{TYPE_ICONS[n.type] || "📢"}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: "#fff", fontWeight: 600, fontSize: ".88rem", marginBottom: ".2rem" }}>{n.title}</div>
                        <div style={{ color: "#a1a1aa", fontSize: ".8rem", lineHeight: 1.5 }}>{n.message}</div>
                      </div>
                      <button
                        onClick={() => dismissNotif(n.id)}
                        style={{ background: "none", border: "none", color: "#52525b", cursor: "pointer", fontSize: ".8rem", flexShrink: 0 }}
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ padding: ".8rem 1.2rem", borderTop: "1px solid rgba(255,255,255,.06)", textAlign: "center" }}>
                <span style={{ color: "#52525b", fontSize: ".75rem" }}>Powered by ZilVerse Admin</span>
              </div>
            </div>
          )}
        </div>
        
        {user ? (
          <>
            <Link href="/dashboard" className={styles.userBadge}>
              👤 {user.name}
            </Link>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              Logout
            </button>
          </>
        ) : (
          <div className={styles.authButtons}>
            <Link href="/login" className={styles.signInBtn}>Sign In</Link>
            <Link href="/register" className={styles.primaryBtn}>Get Started</Link>
          </div>
        )}

        <button className={styles.mobileMenuToggle} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {isMobileMenuOpen ? (
              <><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></>
            ) : (
              <><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileMenuScroll}>
            <div className={styles.mobileMenuGroup}>
              <Link href="/" className={styles.mobileMenuItem} style={{ fontWeight: 'bold' }} onClick={() => setIsMobileMenuOpen(false)}>
                🏠 Home Page
              </Link>
            </div>
            {MEGA_MENU.map(menu => (
              <div key={menu.title} className={styles.mobileMenuGroup}>
                <div className={styles.mobileMenuTitle}>{menu.title}</div>
                {menu.items.map(item => (
                  <Link key={item.href} href={item.href} className={styles.mobileMenuItem} onClick={() => setIsMobileMenuOpen(false)}>
                    {item.icon} {item.label}
                  </Link>
                ))}
              </div>
            ))}
            {!user && (
              <div className={styles.mobileAuthGrid}>
                <Link href="/login" className={styles.signInBtn} style={{justifyContent: 'center'}} onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                <Link href="/register" className={styles.primaryBtn} style={{justifyContent: 'center'}} onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
