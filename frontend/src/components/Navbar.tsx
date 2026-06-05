"use client";
import { API_BASE } from "@/utils/api";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Home, 
  ShoppingBag, 
  Briefcase, 
  Code2, 
  ClipboardList, 
  Coins, 
  Calendar, 
  GraduationCap, 
  Globe, 
  BookOpen, 
  Lightbulb, 
  FileText, 
  Award, 
  Cpu, 
  Play, 
  RefreshCw, 
  Sparkles, 
  MessageSquare, 
  Info, 
  Mail, 
  FileEdit, 
  HelpCircle,
  ChevronDown,
  ArrowRight
} from "lucide-react";
import CountrySelector from "./CountrySelector";
import LanguageSelector from "./LanguageSelector";
import ThemeSelector from "./ThemeSelector";
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
      { label: "Home", href: "/", desc: "Go to ecosystem homepage.", icon: Home },
      { label: "Services", href: "/services", desc: "Premium digital services.", icon: ShoppingBag },
      { label: "Freelancers", href: "/freelancers", desc: "Hire top global talent.", icon: Briefcase },
      { label: "Projects", href: "/projects", desc: "Browse pre-built source code & assets.", icon: Code2 },
      { label: "Job Board", href: "/jobs", desc: "Find remote & local tech jobs.", icon: ClipboardList },
    ]
  },
  {
    title: "Opportunities",
    featured: {
      title: "Global Grant Program 2026",
      desc: "Get up to $50,000 equity-free funding to build tools on ZilVerse.",
      href: "/fund",
      badge: "Active",
      cta: "Apply Now"
    },
    items: [
      { label: "Grants & Funding", href: "/fund", desc: "Capital for your startup.", icon: Coins },
      { label: "Events", href: "/events", desc: "Tech meetups & conferences.", icon: Calendar },
      { label: "Internships", href: "/internships", desc: "Kickstart your career.", icon: GraduationCap },
      { label: "Remote Work", href: "/remote", desc: "Work from anywhere.", icon: Globe },
    ]
  },
  {
    title: "Learn & Innovate",
    featured: {
      title: "Verified Credentials",
      desc: "Master new tech skills and earn industry-recognized certifications.",
      href: "/certifications",
      badge: "Hot",
      cta: "View Courses"
    },
    items: [
      { label: "Academy", href: "/academy", desc: "Master new tech skills.", icon: BookOpen },
      { label: "Innovation Hub", href: "/innovation", desc: "Incubate your ideas.", icon: Lightbulb },
      { label: "Research", href: "/research", desc: "Deep-dive whitepapers.", icon: FileText },
      { label: "Certifications", href: "/certifications", desc: "Earn verified credentials.", icon: Award },
      { label: "AI Interview Prep", href: "/interview", desc: "Interactive sandboxed prep.", icon: Cpu },
    ]
  },
  {
    title: "Community",
    featured: {
      title: "InnoReels Network",
      desc: "Swipe through short-form tech tutorials and project demos.",
      href: "/reels",
      badge: "Trending",
      cta: "Start Swiping"
    },
    items: [
      { label: "InnoReels", href: "/reels", desc: "Short-form tech content.", icon: Play },
      { label: "Exchange", href: "/exchange", desc: "Trade ideas & assets.", icon: RefreshCw },
      { label: "Creator Network", href: "/creators", desc: "Join top influencers.", icon: Sparkles },
      { label: "Discussions", href: "/discussions", desc: "Engage in tech forums.", icon: MessageSquare },
    ]
  },
  {
    title: "Company",
    featured: {
      title: "We are hiring!",
      desc: "Join the core team building the next generation ecosystem.",
      href: "/apply",
      badge: "Careers",
      cta: "Open Roles"
    },
    items: [
      { label: "About", href: "/about", desc: "Our mission & vision.", icon: Info },
      { label: "Contact", href: "/contact", desc: "Get in touch with us.", icon: Mail },
      { label: "Apply", href: "/apply", desc: "Join the core team.", icon: FileEdit },
      { label: "Support", href: "/help", desc: "24/7 global assistance.", icon: HelpCircle },
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
            <Link 
              href={menu.title === "Opportunities" ? "/opportunities" : menu.title === "Learn & Innovate" ? "/academy" : "#"}
              className={`${styles.navLink} ${activeMenu === menu.title ? styles.active : ""}`}
              onClick={() => setActiveMenu(null)}
            >
              {menu.title}
              <ChevronDown size={14} className={styles.chevron} />
            </Link>

            {activeMenu === menu.title && (
              <div className={styles.megaMenuDropdown}>
                <div className={styles.dropdownLayout}>
                  {menu.featured && (
                    <div className={styles.featuredCard}>
                      <span className={styles.featuredBadge}>{menu.featured.badge}</span>
                      <h4 className={styles.featuredTitle}>{menu.featured.title}</h4>
                      <p className={styles.featuredDesc}>{menu.featured.desc}</p>
                      <Link href={menu.featured.href} className={styles.featuredCta} onClick={() => setActiveMenu(null)}>
                        {menu.featured.cta} <ArrowRight size={14} style={{ marginLeft: "4px" }} />
                      </Link>
                    </div>
                  )}
                  <div className={styles.megaMenuGrid}>
                    {menu.items.map(item => {
                      const IconComponent = item.icon;
                      return (
                        <Link key={item.href} href={item.href} className={styles.megaMenuItem} onClick={() => setActiveMenu(null)}>
                          <div className={styles.menuItemIcon}>
                            <IconComponent size={18} />
                          </div>
                          <div>
                            <div className={styles.menuItemLabel}>{item.label}</div>
                            <div className={styles.menuItemDesc}>{item.desc}</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
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
          <ThemeSelector />
        </div>

        {/* 🔔 Notification Bell */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setIsBellOpen(!isBellOpen)}
            style={{
              background: "var(--card)", border: "1px solid var(--card-border)",
              borderRadius: "10px", padding: ".45rem .65rem",
              cursor: "pointer", position: "relative", color: "var(--foreground)",
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
              width: "340px", background: "var(--glass-bg)",
              border: "1px solid var(--primary)", borderRadius: "16px",
              backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", zIndex: 99999,
              boxShadow: "0 16px 48px rgba(0,0,0,.2)", overflow: "hidden", color: "var(--foreground)"
            }}>
              <div style={{ padding: "1rem 1.2rem", borderBottom: "1px solid var(--card-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, fontSize: ".95rem" }}>Notifications</span>
                <button onClick={() => setIsBellOpen(false)} style={{ background: "none", border: "none", color: "var(--foreground)", cursor: "pointer", fontSize: "1rem" }}>✕</button>
              </div>
              {visibleNotifs.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", opacity: 0.7, fontSize: ".88rem" }}>No new notifications</div>
              ) : (
                <div style={{ maxHeight: "360px", overflowY: "auto" }}>
                  {visibleNotifs.map((n: any) => (
                    <div key={n.id} style={{
                      padding: "1rem 1.2rem",
                      borderBottom: "1px solid var(--card-border)",
                      display: "flex", gap: ".8rem", alignItems: "flex-start"
                    }}>
                      <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>{TYPE_ICONS[n.type] || "📢"}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: ".88rem", marginBottom: ".2rem" }}>{n.title}</div>
                        <div style={{ opacity: 0.7, fontSize: ".8rem", lineHeight: 1.5 }}>{n.message}</div>
                      </div>
                      <button
                        onClick={() => dismissNotif(n.id)}
                        style={{ background: "none", border: "none", color: "var(--foreground)", opacity: 0.7, cursor: "pointer", fontSize: ".8rem", flexShrink: 0 }}
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ padding: ".8rem 1.2rem", borderTop: "1px solid var(--card-border)", textAlign: "center" }}>
                <span style={{ opacity: 0.6, fontSize: ".75rem" }}>Powered by ZilVerse Admin</span>
              </div>
            </div>
          )}
        </div>
        
        {user ? (
          <>
            <Link href="/dashboard" className={styles.userBadge}>
              {(user as any).avatar || (user as any).image ? (
                <img
                  src={(user as any).avatar || (user as any).image}
                  alt={user.name}
                  style={{ width: "22px", height: "22px", borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <span>👤</span>
              )}
              <span>{user.name}</span>
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
                {menu.items.map(item => {
                  const IconComponent = item.icon;
                  return (
                    <Link key={item.href} href={item.href} className={styles.mobileMenuItem} onClick={() => setIsMobileMenuOpen(false)}>
                      <IconComponent size={18} style={{ marginRight: "8px" }} /> {item.label}
                    </Link>
                  );
                })}
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
