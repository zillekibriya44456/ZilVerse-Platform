import styles from "./contact.module.css";

const PHONE = "7091780179";
const EMAIL = "zillekibriya44456@gmail.com";
const WA_LINK = `https://wa.me/91${PHONE}?text=${encodeURIComponent("Hi! I found you on ZilVerse and would like to connect.")}`;

const socialLinks = [
  { label: "LinkedIn", href: "https://in.linkedin.com/in/zille-kibriya-3168b91a7", icon: "💼", color: "#0A66C2", handle: "zille-kibriya" },
  { label: "X (Twitter)", href: "https://x.com/kibriya_zille", icon: "🐦", color: "#1DA1F2", handle: "@kibriya_zille" },
  { label: "YouTube", href: "https://youtube.com/@technicalilahi5323", icon: "▶️", color: "#FF0000", handle: "Technical Ilahi" },
  { label: "Facebook", href: "https://m.facebook.com/zille.kibriya.3", icon: "📘", color: "#1877F2", handle: "zille.kibriya.3" },
  { label: "Medium", href: "https://medium.com/@zillekibriya", icon: "✍️", color: "#fff", handle: "@zillekibriya" },
  { label: "Blog", href: "https://technicalilahi.blogspot.com/?m=1", icon: "🌐", color: "#f59e0b", handle: "Technical Ilahi Blog" },
];

export default function ContactPage() {
  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.title}>Get in Touch</h1>
          <p className={styles.subtitle}>We typically respond within a few hours. Reach out via WhatsApp for the fastest reply.</p>
        </div>

        <div className={styles.grid}>
          {/* Contact Cards */}
          <div className={styles.cards}>
            <a href={WA_LINK} target="_blank" rel="noreferrer" className={`glass-panel ${styles.card} ${styles.waCard}`}>
              <div className={styles.cardIcon} style={{ background: "#25D36620" }}>
                <svg viewBox="0 0 24 24" fill="#25D366" width="28" height="28">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.118.553 4.1 1.518 5.82L.057 23.428a.5.5 0 00.515.572l5.808-1.524A11.956 11.956 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.858 9.858 0 01-5.032-1.375l-.36-.214-3.733.979.996-3.641-.234-.374A9.862 9.862 0 012.118 12C2.118 6.533 6.533 2.118 12 2.118c5.468 0 9.882 4.415 9.882 9.882S17.468 21.882 12 21.882z"/>
                </svg>
              </div>
              <div>
                <h3>WhatsApp</h3>
                <p>+91 {PHONE}</p>
                <span className={styles.cta}>Chat Now →</span>
              </div>
            </a>

            <a href={`tel:+91${PHONE}`} className={`glass-panel ${styles.card}`}>
              <div className={styles.cardIcon} style={{ background: "rgba(168,85,247,0.12)" }}>📞</div>
              <div>
                <h3>Phone Call</h3>
                <p>+91 {PHONE}</p>
                <span className={styles.cta}>Call Now →</span>
              </div>
            </a>

            <a href={`mailto:${EMAIL}`} className={`glass-panel ${styles.card}`}>
              <div className={styles.cardIcon} style={{ background: "rgba(234,67,53,0.12)" }}>📧</div>
              <div>
                <h3>Gmail</h3>
                <p style={{ fontSize: "0.82rem" }}>{EMAIL}</p>
                <span className={styles.cta}>Send Email →</span>
              </div>
            </a>

            <div className={`glass-panel ${styles.card}`} style={{ cursor: "default" }}>
              <div className={styles.cardIcon} style={{ background: "rgba(16,185,129,0.12)" }}>📍</div>
              <div>
                <h3>Office Address</h3>
                <p>31 B, 2nd Cross, Navy Layout,<br />Next to Kirloskar Layout,<br />Bengaluru — 560090</p>
              </div>
            </div>

            <div className={`glass-panel ${styles.card}`} style={{ cursor: "default" }}>
              <div className={styles.cardIcon} style={{ background: "rgba(245,158,11,0.12)" }}>🕐</div>
              <div>
                <h3>Working Hours</h3>
                <p>Monday – Saturday<br />9:00 AM – 7:00 PM IST</p>
              </div>
            </div>
          </div>

          {/* Right Column: Form + Social */}
          <div className={styles.rightCol}>
            {/* Contact Form */}
            <div className={`glass-panel ${styles.form}`}>
              <h2>Send a Message</h2>
              <p style={{ color: "#a1a1aa", marginBottom: "2rem", fontSize: "0.9rem" }}>We'll get back to you within 24 hours.</p>
              <div className={styles.formFields}>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label>Your Name</label>
                    <input type="text" placeholder="Full name" />
                  </div>
                  <div className={styles.field}>
                    <label>Email</label>
                    <input type="email" placeholder="you@example.com" />
                  </div>
                </div>
                <div className={styles.field}>
                  <label>Phone / WhatsApp</label>
                  <input type="tel" placeholder="+91 XXXXXXXXXX" />
                </div>
                <div className={styles.field}>
                  <label>Subject</label>
                  <select>
                    <option>Website Development</option>
                    <option>Mobile App Development</option>
                    <option>Hire a Freelancer</option>
                    <option>Buy a Project</option>
                    <option>Partnership / Collaboration</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Message</label>
                  <textarea placeholder="Describe your project or inquiry..." rows={5} />
                </div>
                <a href={WA_LINK} target="_blank" rel="noreferrer" className={`btn btn-primary ${styles.submitBtn}`}>
                  💬 Send via WhatsApp
                </a>
              </div>
            </div>

            {/* Social Media Links */}
            <div className={`glass-panel ${styles.socialsBox}`}>
              <h3>Follow & Connect</h3>
              <p style={{ color: "#a1a1aa", fontSize: "0.875rem", marginBottom: "1.5rem" }}>Stay updated with tech articles, tutorials, and project updates.</p>
              <div className={styles.socialGrid}>
                {socialLinks.map(s => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.socialCard}
                    style={{ borderColor: `${s.color}30` }}
                  >
                    <span className={styles.socialIcon}>{s.icon}</span>
                    <div>
                      <strong style={{ color: s.color === "#fff" ? "#e4e4e7" : s.color }}>{s.label}</strong>
                      <span className={styles.socialHandle}>{s.handle}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
