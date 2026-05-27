"use client";

import { useState } from "react";
import Image from "next/image";
import { ACTIVE_CHALLENGES, IMPACT_SHOWCASES } from "@/data/innovation";
import styles from "./innovation.module.css";

type Tab = "Challenges" | "Showcase";

export default function InnovationHubPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Challenges");
  const [applyToast, setApplyToast] = useState<string | null>(null);

  const handleApply = (title: string) => {
    setApplyToast(`Successfully applied to solve: "${title}". The organizer will review your Skill Vault!`);
    setTimeout(() => setApplyToast(null), 4000);
  };

  return (
    <div className={styles.page}>
      {applyToast && <div className={styles.toast}>{applyToast}</div>}

      {/* Hero Section */}
      <div className={styles.header}>
        <div className="container">
          <div className={styles.badgeLabel}>Startups x Solvers</div>
          <h1>Innovation Hub</h1>
          <p>Match your skills with real-world startup challenges and build undeniable proof of impact.</p>

          <div className={styles.tabContainer}>
            <button
              className={`${styles.tabBtn} ${activeTab === "Challenges" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("Challenges")}
            >
              🚀 Active Challenges
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === "Showcase" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("Showcase")}
            >
              🏆 Impact Showcase
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        {activeTab === "Challenges" && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Solve Real Problems. Prove Your Worth.</h2>
              <p>Startups and NGOs post challenges here. If you solve them, the verified skill goes straight to your Vault.</p>
              <button className="btn btn-primary">Post a Challenge</button>
            </div>

            <div className={styles.grid}>
              {ACTIVE_CHALLENGES.map((chal) => (
                <div key={chal.id} className={`glass-panel ${styles.card}`}>
                  <div className={styles.cardHeader}>
                    <span className={styles.companyBadge}>🏢 {chal.company}</span>
                    <span className={styles.statusBadge}>{chal.status}</span>
                  </div>
                  <h3>{chal.title}</h3>
                  <p className={styles.desc}>{chal.description}</p>
                  
                  <div className={styles.skillsBox}>
                    <strong>Required Skills:</strong>
                    <div className={styles.tags}>
                      {chal.requiredSkills.map(skill => (
                        <span key={skill} className={styles.tag}>{skill}</span>
                      ))}
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    <div className={styles.rewardInfo}>
                      <span className={styles.rewardLabel}>Reward / Bounty:</span>
                      <span className={styles.rewardValue}>{chal.reward}</span>
                    </div>
                    <button className="btn btn-primary" onClick={() => handleApply(chal.title)}>
                      Apply to Solve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Showcase" && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>The Hall of Impact</h2>
              <p>Explore massive, real-world problems that have already been solved by our global community.</p>
            </div>

            <div className={styles.showcaseGrid}>
              {IMPACT_SHOWCASES.map((showcase) => (
                <div key={showcase.id} className={`glass-panel ${styles.showcaseCard}`}>
                  <div className={styles.showcaseImageWrapper}>
                    <Image src={showcase.image} alt={showcase.solver} fill className={styles.showcaseImage} />
                    <div className={styles.solverBadge}>Solved by {showcase.solver}</div>
                  </div>
                  <div className={styles.showcaseContent}>
                    <h3>{showcase.title}</h3>
                    <p className={styles.showcaseCompany}>For <strong>{showcase.company}</strong></p>
                    <p className={styles.showcaseDesc}>{showcase.description}</p>
                    <div className={styles.impactMetrics}>
                      <div className={styles.metricIcon}>📈</div>
                      <div>
                        <strong>Real-World Impact:</strong>
                        <p>{showcase.impactMetrics}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
