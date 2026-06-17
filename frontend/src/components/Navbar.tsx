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
  Video, RefreshCw, Box, GraduationCap, Calendar, Coins, Moon
} from "lucide-react";
import styles from "./Navbar.module.css";
import { socket } from "@/utils/socket";

const MEGA_COLUMNS = [
  {
    title: "MARKETPLACE",
    items: [
      { label: "Freelancers", desc: "Hire verified global talent", href: "/freelancers", icon: User, color: "#8B5CF6" },
      { label: "Projects", desc: "Buy & sell projects", href: "/projects", icon: Box, color: "#3B82F6" },
      { label: "Digital Services", desc: "Web, App, AI & more", href: "/services", icon: Layers, color: "#22C55E" },
      { label: "Marketplace Categories", desc: "Explore all categories", href: "/categories", icon: Layers, color: "#F59E0B" },
    ],
    card: { title: "Top Global Talent", desc: "Access 2,400+ verified professionals worldwide.", link: "Explore Talent →", href: "/freelancers", icon: Sparkles, color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.1)" }
  },
  {
    title: "OPPORTUNITIES",
    items: [
      { label: "Jobs", desc: "Find remote & local jobs", href: "/jobs", icon: Briefcase, color: "#3B82F6" },
      { label: "Grants & Funding", desc: "Get funding for ideas", href: "/fund", icon: Coins, color: "#22C55E" },
      { label: "Events", desc: "Join virtual & global events", href: "/events", icon: Calendar, color: "#8B5CF6" },
      { label: "Internships", desc: "Kickstart your career", href: "/internships", icon: GraduationCap, color: "#F59E0B" },
      { label: "Remote Opportunities", desc: "Work from anywhere", href: "/remote", icon: Globe, color: "#06B6D4" },
    ],
    card: { title: "New Opportunities", desc: "100+ new jobs posted daily", link: "View Opportunities →", href: "/opportunities", icon: Sparkles, color: "#3B82F6", bg: "rgba(59, 130, 246, 0.1)" }
  },
  {
    title: "LEARN & INNOVATE",
    items: [
      { label: "Academy", desc: "Upskill with top courses", href: "/academy", icon: BookOpen, color: "#8B5CF6" },
      { label: "Innovation Hub", desc: "Explore innovative ideas", href: "/innovation", icon: Lightbulb, color: "#22C55E" },
      { label: "Research", desc: "Access global research", href: "/research", icon: FileText, color: "#3B82F6" },
      { label: "Certifications", desc: "Earn global certificates", href: "/certifications", icon: Award, color: "#F59E0B" },
      { label: "Learning Resources", desc: "Guides, tutorials & more", href: "/resources", icon: FileText, color: "#06B6D4" },
    ],
    card: { title: "Featured Course", desc: "AI for Everyone", link: "Start Learning →", href: "/academy/course", icon: Play, color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.1)", isImage: true }
  },
  {
    title: "COMMUNITY",
    items: [
      { label: "InnoReels", desc: "Share & watch innovation", href: "/reels", icon: Video, color: "#EC4899" },
      { label: "Exchange", desc: "Ideas, skills & resources", href: "/exchange", icon: RefreshCw, color: "#22C55E" },
      { label: "Creator Network", desc: "Connect with creators", href: "/creators", icon: Users2, color: "#F59E0B" },
      { label: "Discussions", desc: "Ask, share & learn", href: "/discussions", icon: MessageSquare, color: "#22C55E" },
      { label: "Global Community", desc: "150+ countries connected", href: "/community", icon: Globe, color: "#3B82F6" },
    ],
    card: { title: "Community Highlight", desc: "Join 25K+ members worldwide", link: "Join Now →", href: "/community", icon: Users, color: "#EC4899", bg: "rgba(236, 72, 153, 0.1)", isAvatarGroup: true }
  },
  {
    title: "COMPANY",
    items: [
      { label: "About ZilVerse", desc: "Our mission & story", href: "/about", icon: Building2, color: "#8B5CF6" },
      { label: "Contact Us", desc: "We'd love to hear from you", href: "/contact", icon: PhoneCall, color: "#22C55E" },
      { label: "Apply to ZilVerse", desc: "Join as a partner", href: "/apply", icon: Handshake, color: "#3B82F6" },
      { label: "Careers", desc: "Work with us", href: "/careers", icon: Briefcase, color: "#F59E0B" },
      { label: "Support Center", desc: "Help & resources", href: "/support", icon: HelpCircle, color: "#06B6D4" },
    ],
    card: { title: "We're Hiring!", desc: "Join our global team", link: "View Openings →", href: "/careers", icon: Briefcase, color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.1)" }
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

        {/* Massive Megamenu */}
        {isMegaOpen && (
          <div 
            className={styles.megaMenuContainer} 
            ref={megaRef}
            onMouseEnter={() => {
              if (closeTimeout.current) clearTimeout(closeTimeout.current);
            }}
            onMouseLeave={handleMouseLeaveNav}
          >
            <div className={styles.megaMenuInner}>
              {MEGA_COLUMNS.map((col) => (
                <div key={col.title} className={styles.megaColumn}>
                  <h4 className={styles.megaColTitle}>{col.title}</h4>
                  <div className={styles.megaItemList}>
                    {col.items.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <Link key={idx} href={item.href} className={styles.megaItem}>
                          <div className={styles.megaIconWrapper} style={{ color: item.color }}>
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
                          <img src="/avatars/default.png" alt="A" />
                          <img src="/avatars/default.png" alt="B" />
                          <img src="/avatars/default.png" alt="C" />
                        </div>
                      ) : col.card.isImage ? (
                        <div className={styles.megaCardImage} style={{ background: 'linear-gradient(45deg, #8B5CF6, #06B6D4)' }}>
                          <Play size={20} color="#fff" />
                        </div>
                      ) : (
                        <div className={styles.megaCardIcon} style={{ background: col.card.bg, color: col.card.color }}>
                          <col.card.icon size={20} />
                        </div>
                      )}
                      <div className={styles.megaCardInfo}>
                        <div className={styles.megaCardTitle}>{col.card.title}</div>
                        <div className={styles.megaCardDesc}>{col.card.desc}</div>
                      </div>
                    </div>
                    <div className={styles.megaCardLink}>{col.card.link}</div>
                  </Link>

                </div>
              ))}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
