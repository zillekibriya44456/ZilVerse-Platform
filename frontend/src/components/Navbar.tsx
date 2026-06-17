"use client";
import { API_BASE } from "@/utils/api";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  User, Briefcase, Code2, Play, Users, Globe, BookOpen, Lightbulb, 
  FileText, Award, MessageSquare, Search, ChevronDown, Sparkles, 
  Layers, PhoneCall, Handshake, Users2, Building2, HelpCircle,
  Video, RefreshCw, Box, GraduationCap, Calendar, Coins, Moon,
  Zap, BarChart2, MessageCircle, Send, HeadphonesIcon, FileOutput, Grip
} from "lucide-react";
import styles from "./Navbar.module.css";
import { socket } from "@/utils/socket";

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
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMegaOpen, setIsMegaOpen] = useState(false);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);
  const megaRef = useRef<HTMLDivElement>(null);

  const handleMouseEnterNav = (title: string) => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setActiveMenu(title);
    setIsMegaOpen(true);
  };

  const handleMouseLeaveNav = () => {
    closeTimeout.current = setTimeout(() => {
      setIsMegaOpen(false);
      setActiveMenu(null);
    }, 300);
  };

  useEffect(() => { 
    setIsMegaOpen(false);
    setActiveMenu(null);
  }, [pathname]);

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
          <button className={styles.iconBtn}>
            <Search size={18} />
          </button>
          <button className={styles.langBtn}>
            <Globe size={16} /> EN <ChevronDown size={14} />
          </button>
          <button className={styles.iconBtn}>
            <Moon size={18} />
          </button>
          
          {!user ? (
            <div className={styles.authButtons}>
              <Link href="/login" className={styles.signInBtn}>Sign In</Link>
              <Link href="/register" className={styles.primaryBtn}>Get Started Free</Link>
            </div>
          ) : (
            <button onClick={async () => { await logout(); router.push("/"); }} className={styles.signInBtn}>Logout</button>
          )}

          <button className={styles.mobileMenuToggle}>
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
              <line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>

      </header>
    </>
  );
}
