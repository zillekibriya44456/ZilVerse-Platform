"use client";

import { motion } from "framer-motion";
import styles from "./TestimonialSlider.module.css";
import TiltCard from "./TiltCard";

interface Testimonial {
  text: string;
  name: string;
  role: string;
  stars: number;
  avatar?: string;
  color?: string;
  initials?: string;
  verified?: boolean;
}

export default function TestimonialSlider({ testimonials }: { testimonials: Testimonial[] }) {
  if (!testimonials || testimonials.length === 0) {
    return (
      <div style={{ textAlign: "center", color: "var(--muted)", padding: "3rem 0" }}>
        Loading reviews from database...
      </div>
    );
  }

  // Duplicate for seamless infinite scroll
  const items = [...testimonials, ...testimonials, ...testimonials];

  return (
    <div className={styles.sliderContainer}>
      <motion.div
        className={styles.sliderTrack}
        animate={{
          x: ["0%", "-33.333333%"] // Move left exactly one set of items
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 30 // Adjust speed here
        }}
      >
        {items.map((t, i) => (
          <div key={i} className={styles.slideItem}>
            <TiltCard className={styles.testimonialCard}>
              <div className={styles.stars}>
                {"⭐".repeat(Math.max(1, Math.min(5, Number(t.stars) || 5)))}
              </div>
              <p className={styles.testimonialText}>"{t.text}"</p>
              <div className={styles.testimonialAuthor}>
                {t.avatar ? (
                  <img src={t.avatar} alt={t.name} className={styles.tAvatar} />
                ) : (
                  <div className={styles.tAvatar} style={{ background: t.color || "#333" }}>
                    {t.initials}
                  </div>
                )}
                <div className={styles.tInfo}>
                  <span className={styles.tName}>
                    {t.name}
                    {t.verified && <span className={styles.verifiedBadge} title="Verified User">✓</span>}
                  </span>
                  <span className={styles.tRole}>{t.role}</span>
                </div>
              </div>
            </TiltCard>
          </div>
        ))}
      </motion.div>
      
      {/* Gradient fades on edges */}
      <div className={styles.fadeLeft} />
      <div className={styles.fadeRight} />
    </div>
  );
}
