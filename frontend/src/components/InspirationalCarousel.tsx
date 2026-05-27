"use client";

import Image from "next/image";
import { useCountry } from "@/context/CountryContext";
import styles from "./InspirationalCarousel.module.css";
import { useEffect, useRef, useState } from "react";
import { INNOVATORS, Innovator } from "@/data/innovators";
import InnovatorModal from "./InnovatorModal";

export default function InspirationalCarousel() {
  const { selectedCountry } = useCountry();
  const [sortedFigures, setSortedFigures] = useState(INNOVATORS);
  const [selectedInnovator, setSelectedInnovator] = useState<Innovator | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sort figures to show local figures first based on selectedCountry
    const sorted = [...INNOVATORS].sort((a, b) => {
      // If a matches the user's country, it goes first
      if (a.country.toLowerCase() === selectedCountry.name.toLowerCase()) return -1;
      if (b.country.toLowerCase() === selectedCountry.name.toLowerCase()) return 1;
      return 0;
    });
    setSortedFigures(sorted);
  }, [selectedCountry]);

  // Auto-scroll logic (optional, for infinite feel)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || selectedInnovator) return; // Pause scrolling when modal is open

    let interval: NodeJS.Timeout;
    const startScroll = () => {
      interval = setInterval(() => {
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
          el.scrollLeft = 0; // Reset to start
        } else {
          el.scrollLeft += 1; // Smooth scroll
        }
      }, 30);
    };

    startScroll();

    el.addEventListener("mouseenter", () => clearInterval(interval));
    el.addEventListener("mouseleave", startScroll);

    return () => {
      clearInterval(interval);
      el.removeEventListener("mouseenter", () => clearInterval(interval));
      el.removeEventListener("mouseleave", startScroll);
    };
  }, [selectedInnovator]);

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2>Voices of Innovation</h2>
        <p>Inspiration from world leaders and pioneers, curated for you in {selectedCountry.name}.</p>
      </div>

      <div className={styles.carouselContainer} ref={scrollRef}>
        <div className={styles.carouselTrack}>
          {sortedFigures.map((fig) => (
            <div 
              key={fig.id} 
              className={styles.card}
              onClick={() => setSelectedInnovator(fig)}
            >
              <div className={styles.imageWrapper}>
                <Image
                  src={fig.image}
                  alt={fig.name}
                  fill
                  className={styles.image}
                  sizes="(max-width: 768px) 300px, 400px"
                  unoptimized={true}
                />
                <div className={styles.overlay} />
              </div>
              <div className={styles.content}>
                <span className={styles.quoteIcon}>"</span>
                <p className={styles.quote}>{fig.quote}</p>
                <div className={styles.footer}>
                  <h3 className={styles.name}>{fig.name}</h3>
                  <p className={styles.role}>{fig.role} • {fig.country}</p>
                  <span className={styles.readMoreHint}>Read Full Story →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedInnovator && (
        <InnovatorModal 
          innovator={selectedInnovator} 
          onClose={() => setSelectedInnovator(null)} 
        />
      )}
    </section>
  );
}
