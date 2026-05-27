import styles from "./page.module.css";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1 className={styles.title}>Powering the Future of the Global Workforce</h1>
        <p className={styles.subtitle}>
          ZilVerse (Technical Ilahi Hub) is the world's most comprehensive digital ecosystem, designed to bridge the gap between brilliant talent and world-changing opportunities.
        </p>
      </section>

      {/* Vision Section */}
      <section className={styles.section}>
        <div className={styles.grid}>
          <div className={styles.accentCard}>
            <div className={styles.cardContent}>
              <h2 style={{ fontSize: '2rem', color: '#fff', marginBottom: '1rem' }}>Our Global Vision</h2>
              <p style={{ color: '#a1a1aa', lineHeight: '1.8', fontSize: '1.1rem' }}>
                We envision a borderless digital economy where meritocracy reigns supreme. A world where anyone, anywhere, can learn advanced skills, secure high-paying remote work, launch global startups, and access elite funding—all from a single, unified platform.
              </p>
            </div>
          </div>
          <div className={styles.textContent}>
            <h2>Why We Exist</h2>
            <p>
              The modern professional landscape is fragmented. Freelancers use one platform to find work, another to learn skills, and a dozen more to network, raise funds, or consume tech content.
            </p>
            <p>
              ZilVerse solves this by creating a <strong>singular, interconnected ecosystem</strong>. We don't just connect you to jobs; we provide the Academy to learn the skills, the Innovation Hub to build the product, and the Grants & Funding network to scale your startup globally.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className={styles.section} style={{ marginTop: '8rem' }}>
        <div className={styles.grid} style={{ direction: 'rtl' }}>
          <div className={styles.accentCard} style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.1), rgba(79,70,229,0.1))' }}>
            <div className={styles.cardContent} style={{ direction: 'ltr' }}>
              <h2 style={{ fontSize: '2rem', color: '#fff', marginBottom: '1rem' }}>Our Core Mission</h2>
              <p style={{ color: '#a1a1aa', lineHeight: '1.8', fontSize: '1.1rem' }}>
                To democratize access to wealth creation, elite education, and startup infrastructure for the next billion digital workers, creators, and innovators across the globe.
              </p>
            </div>
          </div>
          <div className={styles.textContent} style={{ direction: 'ltr' }}>
            <h2>Building the Ultimate Ecosystem</h2>
            <p>
              Through our interconnected marketplace, we are lowering the barrier to entry for digital success. Whether you are a solo freelancer looking for high-ticket projects, a tech enterprise sourcing elite global talent, or a visionary seeking venture capital—ZilVerse is your launchpad.
            </p>
            <Link href="/register" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>
              Join the Ecosystem Today
            </Link>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className={styles.section} style={{ marginTop: '8rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '1rem' }}>Our Core Values</h2>
        <p style={{ color: '#a1a1aa', maxWidth: '600px', margin: '0 auto' }}>
          The guiding principles that shape every line of code we write and every decision we make.
        </p>

        <div className={styles.valuesGrid}>
          <div className={styles.valueCard}>
            <div className={styles.valueIcon}>🌍</div>
            <h3 className={styles.valueTitle}>Global Inclusion</h3>
            <p className={styles.valueText}>
              Talent is distributed equally, but opportunity is not. We are building infrastructure to bridge that gap worldwide.
            </p>
          </div>
          <div className={styles.valueCard}>
            <div className={styles.valueIcon}>⚖️</div>
            <h3 className={styles.valueTitle}>Pure Meritocracy</h3>
            <p className={styles.valueText}>
              Your code, your portfolio, and your reputation matter more than your geographic location or background.
            </p>
          </div>
          <div className={styles.valueCard}>
            <div className={styles.valueIcon}>🚀</div>
            <h3 className={styles.valueTitle}>Relentless Innovation</h3>
            <p className={styles.valueText}>
              We are obsessed with pushing boundaries. From AI-assisted hiring to decentralized funding protocols.
            </p>
          </div>
          <div className={styles.valueCard}>
            <div className={styles.valueIcon}>🤝</div>
            <h3 className={styles.valueTitle}>Community First</h3>
            <p className={styles.valueText}>
              A platform is nothing without its people. Every feature we build is driven by the needs of our global network.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
