"use client";
import Link from "next/link";
import styles from "./Footer.module.css";
import { Facebook, Twitter, Linkedin, Instagram, Youtube, Send, Globe } from "lucide-react";

const socialLinks = [
  { icon: Facebook, href: "https://m.facebook.com/zille.kibriya.3" },
  { icon: Twitter, href: "https://x.com/zilverse01gmai" },
  { icon: Linkedin, href: "https://www.linkedin.com/company/zilverse/" },
  { icon: Instagram, href: "#" },
  { icon: Youtube, href: "https://www.youtube.com/@TheZilVerse" },
];

const navLinks = [
  { group: "Platform", links: [
    { label: "Services", href: "/services" },
    { label: "Talent", href: "/freelancers" },
    { label: "Marketplace", href: "/projects" },
    { label: "Opportunities", href: "/jobs" },
    { label: "Community", href: "/community" },
  ]},
  { group: "Resources", links: [
    { label: "Blog", href: "/blog" },
    { label: "Guides", href: "/guides" },
    { label: "Help Center", href: "/help" },
    { label: "FAQs", href: "/faqs" },
    { label: "Contact Us", href: "/contact" },
  ]},
  { group: "Company", links: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
    { label: "Partners", href: "/partners" },
    { label: "Terms & Privacy", href: "/terms" },
  ]},
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.top}>

          {/* Column 1: Brand & Socials */}
          <div className={styles.brandCol}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}></span> Zil<span>Verse</span>
            </div>
            <p className={styles.tagline}>
              Building the future of work through technology, talent, and global opportunities.
            </p>
            <div className={styles.socials}>
              {socialLinks.map((s, idx) => {
                const Icon = s.icon;
                return (
                  <a key={idx} href={s.href} target="_blank" rel="noreferrer" className={styles.socialBtn}>
                    <Icon size={16} />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Navigation Columns */}
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

          {/* Column 5: Newsletter */}
          <div className={styles.newsletterCol}>
            <h4 className={styles.groupTitle}>Stay Updated</h4>
            <p className={styles.newsletterDesc}>Subscribe to our newsletter</p>
            <form className={styles.newsletterForm} onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Enter your email" className={styles.newsletterInput} />
              <button type="submit" className={styles.newsletterBtn}>
                <Send size={16} />
              </button>
            </form>
          </div>

        </div>

        <div className={styles.bottom}>
          <p>© 2024 ZilVerse. All rights reserved.</p>
          <div className={styles.langSelector}>
            <Globe size={16} /> English <span>v</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
