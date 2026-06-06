"use client";
import { API_BASE } from "@/utils/api";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Home, ShoppingBag, Briefcase, Code2, ClipboardList, Coins, Calendar, GraduationCap, Globe, BookOpen, Lightbulb, FileText, Award, Cpu, Play, RefreshCw, Sparkles, MessageSquare, Info, Mail, FileEdit, HelpCircle, ChevronDown, ArrowRight, User, Settings, LogOut, Laptop, CheckCircle, Rocket, TrendingUp
} from "lucide-react";
import CountrySelector from "./CountrySelector";
import LanguageSelector from "./LanguageSelector";
import ThemeSelector from "./ThemeSelector";
import CurrencySelector from "./CurrencySelector";
import TimezoneSelector from "./TimezoneSelector";
import styles from "./Navbar.module.css";
import { socket } from "@/utils/socket";

const TYPE_ICONS: Record<string, string> = {
  announcement: "📢", maintenance:  "🔧", update: "🚀", warning: "⚠️",
};

const NAV_ITEMS = [
  { label: "Home", href: "/", isMega: false },
  {
    label: "Services",
    href: "/services",
    isMega: false,
    items: [
      { label: "Digital Services", href: "/services", icon: ShoppingBag },
      { label: "Website Development", href: "/services/website", icon: Laptop },
      { label: "Mobile App Development", href: "/services/mobile", icon: Play },
      { label: "SaaS Development", href: "/services/saas", icon: Code2 },
      { label: "AI Solutions", href: "/services/ai", icon: Cpu },
    ]
  },
  {
    label: "Talent",
    href: "/freelancers",
    isMega: false,
    items: [
      { label: "Freelancers", href: "/freelancers", icon: Briefcase },
      { label: "Students & Freshers", href: "/freelancers/students", icon: GraduationCap },
      { label: "Developers", href: "/freelancers/developers", icon: Code2 },
      { label: "Designers", href: "/freelancers/designers", icon: Sparkles },
      { label: "Verified Experts", href: "/freelancers/verified", icon: CheckCircle },
    ]
  },
  {
    label: "Marketplace",
    href: "/projects",
    isMega: false,
    items: [
      { label: "Projects Marketplace", href: "/projects", icon: Code2 },
      { label: "Digital Products", href: "/projects/digital", icon: ShoppingBag },
      { label: "Source Code", href: "/projects/source-code", icon: FileText },
      { label: "Startup MVPs", href: "/projects/mvps", icon: Rocket },
      { label: "Templates", href: "/projects/templates", icon: FileEdit },
    ]
  },
  {
    label: "Opportunities",
    href: "/opportunities",
    isMega: true,
    sections: [
      {
        title: "Jobs & Careers",
        items: [
          { label: "Jobs", href: "/jobs", icon: ClipboardList, desc: "Find your next role" },
          { label: "Remote Work", href: "/remote", icon: Globe, desc: "Work from anywhere" },
          { label: "Freelance Opportunities", href: "/jobs/freelance", icon: Briefcase, desc: "Contract roles" },
        ]
      },
      {
        title: "Education",
        items: [
          { label: "Internships", href: "/internships", icon: GraduationCap, desc: "Kickstart your career" },
          { label: "Certifications", href: "/certifications", icon: Award, desc: "Earn verified credentials" },
          { label: "Research", href: "/research", icon: FileText, desc: "Publish and explore" },
        ]
      },
      {
        title: "Innovation",
        items: [
          { label: "Grants & Funding", href: "/fund", icon: Coins, desc: "Capital for startups" },
          { label: "Events & Conferences", href: "/events", icon: Calendar, desc: "Tech meetups" },
        ]
      }
    ],
    featured: {
      title: "Global Grant Program 2026",
      desc: "Get up to $50,000 equity-free funding.",
      href: "/fund",
      badge: "Active",
      cta: "Apply Now"
    }
  },
  {
    label: "Learn & Grow",
    href: "/academy",
    isMega: false,
    items: [
      { label: "AI Interview Preparation", href: "/interview", icon: Cpu },
      { label: "Certifications", href: "/certifications", icon: Award },
      { label: "Research & Academy", href: "/academy", icon: BookOpen },
      { label: "Innovation Hub", href: "/innovation", icon: Lightbulb },
      { label: "Career Development", href: "/academy/career", icon: TrendingUp },
    ]
  },
  {
    label: "Community",
    href: "/community",
    isMega: false,
    items: [
      { label: "InnoReels", href: "/reels", icon: Play },
      { label: "Knowledge Exchange", href: "/exchange", icon: RefreshCw },
      { label: "Creator Network", href: "/creators", icon: Sparkles },
      { label: "Discussions", href: "/discussions", icon: MessageSquare },
      { label: "Success Stories", href: "/community/success", icon: Award },
    ]
  }
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

  // Notification Bell State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    axios.get(`${API_BASE}/api/admin/notifications`)
      .then(r => setNotifications(r.data))
      .catch(() => {});

    const handleNewNotif = (notif: any) => {
      setNotifications(prev => [notif, ...prev]);
    };
    socket.on('new_notification', handleNewNotif);
    return () => { socket.off('new_notification', handleNewNotif); };
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
  
  useEffect(() => { 
    setActiveMenu(null); 
    setIsMobileMenuOpen(false); 
    setIsProfileMenuOpen(false);
  }, [pathname]);

  const handleMouseEnter = (label: string) => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setActiveMenu(label);
  };

  const handleMouseLeave = () => {
    closeTimeout.current = setTimeout(() => {
      setActiveMenu(null);
    }, 200);
  };

  return (
    <>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          Zil<span className={styles.logoAccent}>Verse</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav}>
          {NAV_ITEMS.map((menu) => (
            <div 
              key={menu.label} 
              className={styles.navItemWrapper}
              onMouseEnter={() => handleMouseEnter(menu.label)}
              onMouseLeave={handleMouseLeave}
            >
              <Link 
                href={menu.href}
                className={`${styles.navLink} ${pathname === menu.href ? styles.active : ""} ${activeMenu === menu.label ? styles.hovered : ""}`}
                onClick={() => setActiveMenu(null)}
              >
                {menu.label}
                {(menu.items || menu.sections) && <ChevronDown size={14} className={styles.chevron} />}
              </Link>

              {activeMenu === menu.label && menu.isMega && menu.sections && (
                <div className={`${styles.dropdownContainer} ${styles.megaMenu}`}>
                  <div className={styles.megaMenuLayout}>
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
                    <div className={styles.megaSections}>
                      {menu.sections.map((section) => (
                        <div key={section.title} className={styles.megaSection}>
                          <h5 className={styles.megaSectionTitle}>{section.title}</h5>
                          {section.items.map((item) => {
                            const IconComponent = item.icon;
                            return (
                              <Link key={item.href} href={item.href} className={styles.dropdownItem} onClick={() => setActiveMenu(null)}>
                                <div className={styles.dropdownIcon}><IconComponent size={16} /></div>
                                <div>
                                  <div className={styles.dropdownLabel}>{item.label}</div>
                                  <div className={styles.dropdownDesc}>{item.desc}</div>
                                </div>
                              </Link>
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeMenu === menu.label && !menu.isMega && menu.items && (
                <div className={`${styles.dropdownContainer} ${styles.simpleDropdown}`}>
                  {menu.items.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <Link key={item.href} href={item.href} className={styles.dropdownItem} onClick={() => setActiveMenu(null)}>
                        <div className={styles.dropdownIcon}><IconComponent size={16} /></div>
                        <div className={styles.dropdownLabel}>{item.label}</div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className={styles.actions}>
          <div className={styles.selectors}>
            <LanguageSelector />
            <CountrySelector />
            <CurrencySelector />
            <TimezoneSelector />
            <ThemeSelector />
          </div>

          {/* 🔔 Notification Bell */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setIsBellOpen(!isBellOpen)}
              className={styles.bellBtn}
            >
              🔔
              {visibleNotifs.length > 0 && (
                <span className={styles.bellBadge}>{visibleNotifs.length}</span>
              )}
            </button>
            {isBellOpen && (
              <div className={styles.bellDropdown}>
                <div className={styles.bellHeader}>
                  <span>Notifications</span>
                  <button onClick={() => setIsBellOpen(false)}>✕</button>
                </div>
                {visibleNotifs.length === 0 ? (
                  <div className={styles.bellEmpty}>No new notifications</div>
                ) : (
                  <div className={styles.bellList}>
                    {visibleNotifs.map((n: any) => (
                      <div key={n.id} className={styles.bellItem}>
                        <span className={styles.bellIcon}>{TYPE_ICONS[n.type] || "📢"}</span>
                        <div className={styles.bellContent}>
                          <div className={styles.bellTitle}>{n.title}</div>
                          <div className={styles.bellDesc}>{n.message}</div>
                        </div>
                        <button onClick={() => dismissNotif(n.id)} className={styles.bellDismiss}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {user ? (
            <div className={styles.profileWrapper} onMouseEnter={() => setIsProfileMenuOpen(true)} onMouseLeave={() => setIsProfileMenuOpen(false)}>
              <div className={styles.userBadge}>
                {(user as any).avatar || (user as any).image ? (
                  <img src={(user as any).avatar || (user as any).image} alt={user.name} className={styles.avatar} />
                ) : (
                  <span>👤</span>
                )}
              </div>
              {isProfileMenuOpen && (
                <div className={`${styles.dropdownContainer} ${styles.profileDropdown}`}>
                  <div className={styles.profileHeader}>
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                  <div className={styles.profileLinks}>
                    <Link href="/dashboard" className={styles.dropdownItem}><User size={16} /> Dashboard</Link>
                    <Link href="/dashboard/settings" className={styles.dropdownItem}><Settings size={16} /> Settings</Link>
                    <div className={styles.divider}></div>
                    <Link href="/about" className={styles.dropdownItem}><Info size={16} /> About Us</Link>
                    <Link href="/contact" className={styles.dropdownItem}><Mail size={16} /> Contact Us</Link>
                    <Link href="/apply" className={styles.dropdownItem}><Briefcase size={16} /> Careers</Link>
                    <Link href="/investors" className={styles.dropdownItem}><TrendingUp size={16} /> Investors</Link>
                    <Link href="/press" className={styles.dropdownItem}><FileText size={16} /> Press Kit</Link>
                    <div className={styles.divider}></div>
                    <Link href="/privacy" className={styles.dropdownItem}><FileText size={16} /> Privacy Policy</Link>
                    <Link href="/terms" className={styles.dropdownItem}><FileText size={16} /> Terms of Service</Link>
                    <div className={styles.divider}></div>
                    <button onClick={handleLogout} className={styles.dropdownItem} style={{color: '#ef4444', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer'}}>
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.authButtons}>
              <Link href="/login" className={styles.signInBtn}>Sign In</Link>
              <Link href="/register" className={styles.primaryBtn}>Get Started</Link>
            </div>
          )}

          <button className={styles.mobileMenuToggle} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
              {isMobileMenuOpen ? (
                <><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></>
              ) : (
                <><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></>
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Slide-Out Menu */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenuOverlay}>
          <div className={styles.mobileMenuContent}>
            <div className={styles.mobileMenuHeader}>
              <h3>Menu</h3>
              <button onClick={() => setIsMobileMenuOpen(false)} className={styles.closeBtn}>✕</button>
            </div>
            <div className={styles.mobileMenuScroll}>
              {NAV_ITEMS.map((menu) => (
                <div key={menu.label} className={styles.mobileMenuGroup}>
                  <Link href={menu.href} className={styles.mobileMenuTitle} onClick={() => setIsMobileMenuOpen(false)}>{menu.label}</Link>
                  {menu.items && menu.items.map(item => {
                    const IconComponent = item.icon;
                    return (
                      <Link key={item.href} href={item.href} className={styles.mobileMenuItem} onClick={() => setIsMobileMenuOpen(false)}>
                        <IconComponent size={16} /> {item.label}
                      </Link>
                    )
                  })}
                  {menu.sections && menu.sections.map(sec => (
                    <div key={sec.title} style={{marginLeft: '1rem', marginTop: '0.5rem'}}>
                      <div style={{color: '#888', fontSize: '0.8rem', marginBottom: '0.5rem', textTransform: 'uppercase'}}>{sec.title}</div>
                      {sec.items.map(item => {
                        const IconComponent = item.icon;
                        return (
                          <Link key={item.href} href={item.href} className={styles.mobileMenuItem} onClick={() => setIsMobileMenuOpen(false)}>
                            <IconComponent size={16} /> {item.label}
                          </Link>
                        )
                      })}
                    </div>
                  ))}
                </div>
              ))}
              <div className={styles.mobileMenuGroup}>
                <div className={styles.mobileMenuTitle}>Company</div>
                <Link href="/about" className={styles.mobileMenuItem} onClick={() => setIsMobileMenuOpen(false)}><Info size={16} /> About Us</Link>
                <Link href="/contact" className={styles.mobileMenuItem} onClick={() => setIsMobileMenuOpen(false)}><Mail size={16} /> Contact Us</Link>
                <Link href="/apply" className={styles.mobileMenuItem} onClick={() => setIsMobileMenuOpen(false)}><Briefcase size={16} /> Careers</Link>
              </div>
            </div>
            {!user && (
              <div className={styles.mobileAuthGrid}>
                <Link href="/login" className={styles.signInBtn} onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                <Link href="/register" className={styles.primaryBtn} onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className={styles.mobileBottomNav}>
        <Link href="/" className={styles.bottomNavItem}>
          <Home size={20} />
          <span>Home</span>
        </Link>
        <Link href="/freelancers" className={styles.bottomNavItem}>
          <Briefcase size={20} />
          <span>Talent</span>
        </Link>
        <Link href="/projects" className={styles.bottomNavItem}>
          <Code2 size={20} />
          <span>Market</span>
        </Link>
        <Link href="/opportunities" className={styles.bottomNavItem}>
          <Globe size={20} />
          <span>Oppty</span>
        </Link>
        <Link href={user ? "/dashboard" : "/login"} className={styles.bottomNavItem}>
          <User size={20} />
          <span>Profile</span>
        </Link>
      </nav>
    </>
  );
}
