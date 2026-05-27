import Link from "next/link";
import styles from "./Footer.module.css";

const PHONE = "7091780179";
const WA_LINK = `https://wa.me/91${PHONE}`;

const EMAIL = "zillekibriya44456@gmail.com";

const socialLinks = [
  { label: "WhatsApp", href: WA_LINK, icon: "💬", color: "#25D366" },
  { label: "LinkedIn", href: "https://in.linkedin.com/in/zille-kibriya-3168b91a7", icon: "💼", color: "#0A66C2" },
  { label: "X (Twitter)", href: "https://x.com/kibriya_zille", icon: "🐦", color: "#1DA1F2" },
  { label: "YouTube", href: "https://youtube.com/@technicalilahi5323", icon: "▶️", color: "#FF0000" },
  { label: "Facebook", href: "https://m.facebook.com/zille.kibriya.3", icon: "📘", color: "#1877F2" },
  { label: "Medium", href: "https://medium.com/@zillekibriya", icon: "✍️", color: "#fff" },
  { label: "Blog", href: "https://technicalilahi.blogspot.com/?m=1", icon: "🌐", color: "#f59e0b" },
  { label: "Gmail", href: `mailto:${EMAIL}`, icon: "📧", color: "#EA4335" },
];

const navLinks = [
  { group: "Platform", links: [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Freelancers", href: "/freelancers" },
    { label: "Projects", href: "/projects" },
    { label: "Job Board", href: "/jobs" },
  ]},
  { group: "Company", links: [
    { label: "Sign In", href: "/login" },
    { label: "Register", href: "/register" },
    { label: "Careers", href: "/careers" },
    { label: "Press Kit", href: "/press" },
    { label: "Investors", href: "/investors" },
    { label: "Contact Us", href: "/contact" },
  ]},
  { group: "Resources & Legal", links: [
    { label: "API Docs", href: "/docs" },
    { label: "Help Center", href: "/help" },
    { label: "Community Guidelines", href: "/guidelines" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Cookie Policy", href: "/cookies" },
  ]},
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.top}>

          {/* Brand + Contact */}
          <div className={styles.brand}>
            <div className={styles.logo}>
              Technical Ilahi <span>Hub</span>
            </div>
            <p className={styles.tagline}>
              Build. Work. Grow — All in One Place.<br />
              Your complete digital ecosystem for freelancing, projects & services.
            </p>

            <div className={styles.contactList}>
              <a href={WA_LINK} target="_blank" rel="noreferrer" className={styles.contactItem}>
                <span className={styles.contactIcon} style={{ background: "#25D36620" }}>💬</span>
                <div>
                  <span className={styles.contactLabel}>WhatsApp Us</span>
                  <span className={styles.contactValue}>+91 {PHONE}</span>
                </div>
              </a>
              <a href={`tel:+91${PHONE}`} className={styles.contactItem}>
                <span className={styles.contactIcon} style={{ background: "rgba(168,85,247,0.12)" }}>📞</span>
                <div>
                  <span className={styles.contactLabel}>Call Us</span>
                  <span className={styles.contactValue}>+91 {PHONE}</span>
                </div>
              </a>
              <div className={styles.contactItem}>
                <span className={styles.contactIcon} style={{ background: "rgba(59,130,246,0.12)" }}>📍</span>
                <div>
                  <span className={styles.contactLabel}>Address</span>
                  <span className={styles.contactValue}>
                    31 B, 2nd Cross, Navy Layout,<br />
                    Next to Kirloskar Layout,<br />
                    Bengaluru — 560090
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Groups */}
          {navLinks.map(group => (
            <div key={group.group} className={styles.linkGroup}>
              <h4 className={styles.groupTitle}>{group.group}</h4>
              <ul className={styles.linkList}>
                {group.links.map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className={styles.footerLink}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Social Media */}
          <div className={styles.linkGroup}>
            <h4 className={styles.groupTitle}>Follow Us</h4>
            <div className={styles.socials}>
              {socialLinks.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.socialBtn}
                  title={s.label}
                  style={{ "--social-color": s.color } as React.CSSProperties}
                >
                  <span>{s.icon}</span>
                  <span className={styles.socialLabel}>{s.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>© {new Date().getFullYear()} Technical Ilahi Hub — ZilVerse. All rights reserved.</p>
          <p>Made with ❤️ in Bengaluru, India 🇮🇳</p>
        </div>
      </div>
    </footer>
  );
}
