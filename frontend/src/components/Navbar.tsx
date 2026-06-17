"use client";
import { API_BASE } from "@/utils/api";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { 
  User, Briefcase, Code2, Play, Users, Globe, BookOpen, Lightbulb, 
  FileText, Award, MessageSquare, Search, ChevronDown, Sparkles, 
  Layers, PhoneCall, Handshake, Users2, Building2, HelpCircle,
  Video, RefreshCw, Box, GraduationCap, Calendar, Coins, Palette,
  Zap, BarChart2, MessageCircle, Send, HeadphonesIcon, FileOutput, Grip,
  UserPlus, LogIn
} from "lucide-react";
import styles from "./Navbar.module.css";
import { socket } from "@/utils/socket";
import GlobalSearchModal from "@/components/GlobalSearchModal";
import NotificationBell from "@/components/NotificationBell";

const MEGA_COLUMNS: any[] = [
  {
    title: "MARKETPLACE",
    titleColor: "#c084fc",
    items: [
      { label: "Freelancers", desc: "Hire verified global talent", href: "/freelancers", icon: User, color: "#a855f7" },
      { label: "Projects", desc: "Buy & sell projects", href: "/projects", icon: Box, color: "#3b82f6" },
      { label: "Digital Services", desc: "Web, App, AI & more", href: "/services", icon: Zap, color: "#22c55e" },
      { label: "Marketplace Categories", desc: "Explore all categories", href: "/categories", icon: Grip, color: "#f59e0b" },
    ],
    card: { title: "Top Global Talent", desc: "Access 2,400+ verified professionals worldwide", link: "Explore Talent →", href: "/freelancers", icon: Sparkles, color: "#a855f7", linkColor: "#c084fc" }
  },
  {
    title: "OPPORTUNITIES",
    titleColor: "#3b82f6",
    items: [
      { label: "Jobs", desc: "Find remote & local jobs", href: "/jobs", icon: Briefcase, color: "#3b82f6" },
      { label: "Grants & Funding", desc: "Get funding for ideas", href: "/fund", icon: Coins, color: "#22c55e" },
      { label: "Events", desc: "Join virtual & global events", href: "/events", icon: Calendar, color: "#a855f7" },
      { label: "Internships", desc: "Kickstart your career", href: "/internships", icon: GraduationCap, color: "#f59e0b" },
      { label: "Remote Opportunities", desc: "Work from anywhere", href: "/remote", icon: Globe, color: "#06b6d4" },
    ],
    card: { title: "New Opportunities", desc: "100+ new jobs posted daily", link: "View Opportunities →", href: "/opportunities", icon: Sparkles, color: "#3b82f6", linkColor: "#60a5fa" }
  },
  {
    title: "LEARN & INNOVATE",
    titleColor: "#c084fc",
    items: [
      { label: "Academy", desc: "Upskill with top courses", href: "/academy", icon: BookOpen, color: "#a855f7" },
      { label: "Innovation Hub", desc: "Explore innovative ideas", href: "/innovation", icon: Lightbulb, color: "#22c55e" },
      { label: "Research", desc: "Access global research", href: "/research", icon: BarChart2, color: "#3b82f6" },
      { label: "Certifications", desc: "Earn global certificates", href: "/certifications", icon: Award, color: "#f59e0b" },
      { label: "Learning Resources", desc: "Guides, tutorials & more", href: "/resources", icon: FileOutput, color: "#06b6d4" },
    ],
    card: { title: "Featured Course", desc: "AI for Everyone", link: "Start Learning →", href: "/academy/course", icon: Play, color: "#a855f7", linkColor: "#c084fc", isImage: true }
  },
  {
    title: "COMMUNITY",
    titleColor: "#3b82f6",
    items: [
      { label: "InnoReels", desc: "Share & watch innovation", href: "/reels", icon: Play, color: "#ec4899" },
      { label: "Exchange", desc: "Ideas, skills & resources", href: "/exchange", icon: RefreshCw, color: "#22c55e" },
      { label: "Creator Network", desc: "Connect with creators", href: "/creators", icon: Users2, color: "#f59e0b" },
      { label: "Discussions", desc: "Ask, share & learn", href: "/discussions", icon: MessageCircle, color: "#22c55e" },
      { label: "Global Community", desc: "150+ countries connected", href: "/community", icon: Globe, color: "#3b82f6" },
    ],
    card: { title: "Community Highlight", desc: "Join 25K+ members worldwide", link: "Join Now →", href: "/community", icon: Users, color: "#3b82f6", linkColor: "#60a5fa", isAvatarGroup: true }
  },
  {
    title: "COMPANY",
    titleColor: "#c084fc",
    items: [
      { label: "About ZilVerse", desc: "Our mission & story", href: "/about", icon: Building2, color: "#a855f7" },
      { label: "Contact Us", desc: "We'd love to hear from you", href: "/contact", icon: PhoneCall, color: "#22c55e" },
      { label: "Apply to ZilVerse", desc: "Join as a partner", href: "/apply", icon: Send, color: "#3b82f6" },
      { label: "Careers", desc: "Work with us", href: "/careers", icon: Briefcase, color: "#f59e0b" },
      { label: "Support Center", desc: "Help & resources", href: "/support", icon: HeadphonesIcon, color: "#06b6d4" },
    ],
    card: { title: "We're Hiring!", desc: "Join our global team", link: "View Openings →", href: "/careers", icon: Briefcase, color: "#a855f7", linkColor: "#c084fc" }
  }
];

export default function Navbar() {
  const { user, logout, isHydrated } = useAuth();
  const { openStudio } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMegaOpen, setIsMegaOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);
  const joinRef = useRef<HTMLDivElement>(null);

  // Cmd+K / Ctrl+K global search shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleMouseEnterNav = (title: string) => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setActiveMenu(title);
    setIsMegaOpen(true);
    setIsJoinOpen(false);
  };

  const handleMouseLeaveNav = () => {
    closeTimeout.current = setTimeout(() => {
      setIsMegaOpen(false);
      setActiveMenu(null);
    }, 300);
  };

  // Close mobile drawer and desktop dropdowns on route change
  useEffect(() => { 
    setIsMegaOpen(false);
    setActiveMenu(null);
    setIsMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileOpen]);

  const MOBILE_SECTIONS = [
    {
      label: "Marketplace",
      items: [
        { label: "Freelancers", href: "/freelancers", icon: User, color: "#a855f7" },
        { label: "Projects", href: "/projects", icon: Box, color: "#3b82f6" },
        { label: "Digital Services", href: "/services", icon: Zap, color: "#22c55e" },
      ]
    },
    {
      label: "Opportunities",
      items: [
        { label: "Jobs", href: "/jobs", icon: Briefcase, color: "#3b82f6" },
        { label: "Events", href: "/events", icon: Calendar, color: "#a855f7" },
        { label: "Internships", href: "/internships", icon: GraduationCap, color: "#f59e0b" },
        { label: "Grants & Funding", href: "/fund", icon: Coins, color: "#22c55e" },
      ]
    },
    {
      label: "Learn & Innovate",
      items: [
        { label: "Academy", href: "/academy", icon: BookOpen, color: "#a855f7" },
        { label: "Certifications", href: "/certifications", icon: Award, color: "#f59e0b" },
        { label: "Research", href: "/research", icon: BarChart2, color: "#3b82f6" },
      ]
    },
    {
      label: "Community",
      items: [
        { label: "InnoReels", href: "/reels", icon: Play, color: "#ec4899" },
        { label: "Discussions", href: "/discussions", icon: MessageCircle, color: "#22c55e" },
        { label: "Skills Exchange", href: "/exchange", icon: RefreshCw, color: "#22c55e" },
        { label: "Global Community", href: "/community", icon: Globe, color: "#3b82f6" },
      ]
    },
  ];

  return (
    <>
      <header className={styles.header} onMouseLeave={handleMouseLeaveNav}>
        <div className={styles.navLeft}>
          <Link href="/" className={styles.logoBox}>
            <div className={styles.logoIcon}>Z</div>
            <span className={styles.logoText}>ZilVerse</span>
          </Link>
          <div className={styles.logoSubtext}>Build. Work. Grow.</div>
        </div>

        <nav className={styles.desktopNav}>
          {MEGA_COLUMNS.map((col) => (
            <div 
              key={col.title} 
              className={styles.navItemWrapper}
              onMouseEnter={() => handleMouseEnterNav(col.title)}
              onMouseLeave={handleMouseLeaveNav}
            >
              <button 
                className={`${styles.navLink} ${activeMenu === col.title ? styles.active : ""}`}
              >
                {col.title === "LEARN & INNOVATE" ? "Learn & Innovate" : 
                 col.title === "MARKETPLACE" ? "Marketplace" :
                 col.title === "OPPORTUNITIES" ? "Opportunities" :
                 col.title === "COMMUNITY" ? "Community" : "Company"}
                <ChevronDown size={14} className={styles.chevron} />
              </button>

              {/* Individual Dropdown */}
              {activeMenu === col.title && (
                <div 
                  className={styles.dropdownContainer}
                  onMouseEnter={() => {
                    if (closeTimeout.current) clearTimeout(closeTimeout.current);
                  }}
                >
                  <div className={styles.megaColumn}>
                    <div className={styles.megaItemList}>
                      {col.items.map((item: any, idx: number) => {
                        const Icon = item.icon;
                        const hexToRgb = (hex: string) => {
                          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                          return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '139, 92, 246';
                        };
                        
                        return (
                          <Link key={idx} href={item.href} className={styles.megaItem}>
                            <div className={styles.megaIconWrapper} style={{ color: item.color, background: `rgba(${hexToRgb(item.color)}, 0.15)` }}>
                              <Icon size={18} />
                            </div>
                            <div className={styles.megaItemContent}>
                              <div className={styles.megaItemLabel}>{item.label}</div>
                              <div className={styles.megaItemDesc}>{item.desc}</div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>

                    {/* Bottom Card */}
                    <Link href={col.card.href} className={styles.megaCard} style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                      <div className={styles.megaCardTop}>
                        {col.card.isAvatarGroup ? (
                          <div className={styles.megaCardAvatars}>
                            <img src="https://i.pravatar.cc/150?u=a1" alt="A" />
                            <img src="https://i.pravatar.cc/150?u=a2" alt="B" />
                            <img src="https://i.pravatar.cc/150?u=a3" alt="C" />
                          </div>
                        ) : col.card.isImage ? (
                          <div className={styles.megaCardImage} style={{ background: 'url(https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=400&q=80) center/cover', border: '1px solid rgba(139, 92, 246, 0.3)' }}></div>
                        ) : (
                          <div className={styles.megaCardIcon} style={{ color: col.card.color, background: `rgba(${
                            (() => {
                              const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(col.card.color);
                              return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '139, 92, 246';
                            })()
                          }, 0.15)` }}>
                            <col.card.icon size={20} />
                          </div>
                        )}
                        <div className={styles.megaCardInfo}>
                          <div className={styles.megaCardTitle}>{col.card.title}</div>
                          <div className={styles.megaCardDesc}>{col.card.desc}</div>
                        </div>
                      </div>
                      <div className={styles.megaCardLink} style={{ color: col.card.linkColor }}>{col.card.link}</div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className={styles.navRight}>
          {/* Search Button — opens GlobalSearchModal */}
          <button
            className={styles.searchBtn}
            onClick={() => setIsSearchOpen(true)}
            aria-label="Search (Ctrl+K)"
            title="Search (⌘K)"
          >
            <Search size={16} />
            <span className={styles.searchBtnText}>Search</span>
            <kbd className={styles.searchKbd}>⌘K</kbd>
          </button>
          <button className={styles.langBtn}>
            <Globe size={16} /> EN <ChevronDown size={14} />
          </button>
          <NotificationBell />
          <button
            className={styles.iconBtn}
            onClick={openStudio}
            aria-label="Open Theme Studio"
            title="Theme Studio"
          >
            <Palette size={18} />
          </button>
          
          {/* ── Auth section — suppresses flicker until localStorage is read ── */}
          {!isHydrated ? (
            // Hydration placeholder — prevents SSR mismatch flash
            <div style={{ width: 120, height: 36, borderRadius: 20, background: 'rgba(255,255,255,0.05)' }} />
          ) : !user ? (
            <div 
              className={styles.joinWrapper}
              onMouseEnter={() => setIsJoinOpen(true)}
              onMouseLeave={() => setIsJoinOpen(false)}
              ref={joinRef}
            >
              <button className={styles.joinBtn}>
                Join ZilVerse <ChevronDown size={14} />
              </button>
              {isJoinOpen && (
                <div className={styles.joinDropdown}>
                  <Link href="/login" className={styles.joinLink}>
                    <div className={styles.joinIcon} style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6' }}>
                      <LogIn size={16} />
                    </div>
                    <div>
                      <div className={styles.joinTitle}>Sign In</div>
                      <div className={styles.joinDesc}>Access your account</div>
                    </div>
                  </Link>
                  <Link href="/register" className={styles.joinLink}>
                    <div className={styles.joinIcon} style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22C55E' }}>
                      <UserPlus size={16} />
                    </div>
                    <div>
                      <div className={styles.joinTitle}>Create Account</div>
                      <div className={styles.joinDesc}>Join the ecosystem</div>
                    </div>
                  </Link>
                  <div className={styles.joinDivider}></div>
                  <button onClick={() => window.location.href = `${API_BASE}/api/auth/google`} className={styles.googleBtn}>
                    <img src="/google-icon.png" alt="G" className={styles.googleIcon} onError={(e) => e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg'} />
                    Continue with Google
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.userMenu}>
              <Link href="/dashboard" className={styles.userAvatar} title="Dashboard">
                <img 
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=8B5CF6&color=fff`} 
                  alt={user.name} 
                />
              </Link>
              <Link href="/dashboard" style={{ color: '#e4e4e7', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
                {user.name?.split(' ')[0]}
              </Link>
              <button 
                onClick={async () => { logout(); router.push("/"); }} 
                className={styles.signInBtn}
                style={{ color: '#a1a1aa', fontSize: '0.82rem' }}
              >
                Logout
              </button>
            </div>
          )}


          <button className={styles.mobileMenuToggle} onClick={() => setIsMobileOpen(true)} aria-label="Open menu">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
              <line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>

      </header>

      {/* ─── Mobile Overlay ─────────────────────── */}
      <div 
        className={`${styles.mobileOverlay} ${isMobileOpen ? styles.open : ""}`} 
        onClick={() => setIsMobileOpen(false)} 
      />

      {/* ─── Mobile Slide-out Drawer ─────────────── */}
      <div className={`${styles.mobileDrawer} ${isMobileOpen ? styles.drawerOpen : ""}`}>
        <div className={styles.drawerHeader}>
          <Link href="/" className={styles.drawerLogo}>
            <div className={styles.logoIcon}>Z</div>
            ZilVerse
          </Link>
          <button className={styles.drawerClose} onClick={() => setIsMobileOpen(false)} aria-label="Close menu">✕</button>
        </div>

        {MOBILE_SECTIONS.map(section => (
          <div key={section.label} className={styles.drawerSection}>
            <div className={styles.drawerSectionTitle}>{section.label}</div>
            {section.items.map(item => {
              const Icon = item.icon;
              const hexToRgb = (hex: string) => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '139, 92, 246';
              };
              return (
                <Link key={item.href} href={item.href} className={styles.drawerLink}>
                  <div className={styles.drawerLinkIcon} style={{ background: `rgba(${hexToRgb(item.color)}, 0.15)`, color: item.color }}>
                    <Icon size={15} />
                  </div>
                  {item.label}
                </Link>
              );
            })}
            <div className={styles.drawerDivider} />
          </div>
        ))}

        {/* Auth Buttons */}
        <div className={styles.drawerAuthButtons}>
          {user ? (
            <>
              <Link href="/dashboard" className={`${styles.drawerAuthBtn} ${styles.drawerAuthBtnPrimary}`}>
                Go to Dashboard
              </Link>
              <button 
                onClick={async () => { await logout(); router.push("/"); setIsMobileOpen(false); }} 
                className={`${styles.drawerAuthBtn} ${styles.drawerAuthBtnSecondary}`}
                style={{ cursor: 'pointer', border: 'none' }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/register" className={`${styles.drawerAuthBtn} ${styles.drawerAuthBtnPrimary}`}>
                Join ZilVerse Free
              </Link>
              <Link href="/login" className={`${styles.drawerAuthBtn} ${styles.drawerAuthBtnSecondary}`}>
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
