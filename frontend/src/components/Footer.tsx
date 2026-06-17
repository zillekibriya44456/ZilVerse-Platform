"use client";
import { useState } from "react";
import Link from "next/link";
import styles from "./Footer.module.css";
import { Facebook, Twitter, Linkedin, Instagram, Youtube, Send, Globe, Loader2, CheckCircle2 } from "lucide-react";
import axios from "axios";
import { API_BASE } from "@/utils/api";

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
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await axios.post(`${API_BASE}/api/newsletter/subscribe`, { email });
      setMessage({ text: res.data.message, type: "success" });
      setEmail("");
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || "Subscription failed.", type: "error" });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 5000);
    }
  };

  return (
    <footer className={styles.footer}>
      <div className="container-wide">
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
            <form className={styles.newsletterForm} onSubmit={handleSubscribe}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className={styles.newsletterInput} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className={styles.newsletterBtn} disabled={loading}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </form>
            {message.text && (
              <div style={{ marginTop: "10px", fontSize: "0.85rem", color: message.type === "error" ? "#fca5a5" : "#86efac", display: "flex", alignItems: "center", gap: "5px" }}>
                {message.type === "success" && <CheckCircle2 size={14} />}
                {message.text}
              </div>
            )}
          </div>

        </div>

        <div className={styles.bottom}>
          <p>© {new Date().getFullYear()} ZilVerse. All rights reserved.</p>
          <div className={styles.langSelector}>
            <Globe size={16} /> English <span>v</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
