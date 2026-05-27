"use client";

import { useState } from "react";
import { USER_SKILL_PROOFS } from "@/data/innovation";
import styles from "./vault.module.css";

export default function SkillVaultPage() {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const handleCopy = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    setTimeout(() => setCopiedLink(null), 3000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h2>🔐 Skill Proof Vault</h2>
          <p>
            Cryptographically-inspired verifications of your real-world skills.
            Share these with employers instead of just a resume.
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => handleCopy("https://zillekibriya.in/vault/zille")}
        >
          {copiedLink === "https://zillekibriya.in/vault/zille" ? "Copied!" : "Share Public Vault"}
        </button>
      </div>

      <div className={styles.grid}>
        {USER_SKILL_PROOFS.map((proof) => (
          <div key={proof.id} className={`glass-panel ${styles.proofCard}`}>
            <div className={styles.cardHeader}>
              <span className={styles.skillBadge}>{proof.skillName}</span>
              <span className={styles.proficiencyBadge}>{proof.proficiency}</span>
            </div>
            
            <div className={styles.verificationBox}>
              <div className={styles.verifiedIcon}>✓</div>
              <div>
                <strong>Verified By</strong>
                <p>{proof.verifiedBy}</p>
              </div>
            </div>

            <div className={styles.metaData}>
              <span>Issued: {proof.dateVerified}</span>
              <span className={styles.proofId}>ID: {proof.id}</span>
            </div>

            <button 
              className={`btn btn-secondary ${styles.copyBtn}`}
              onClick={() => handleCopy(proof.verificationLink)}
            >
              {copiedLink === proof.verificationLink ? "Link Copied!" : "Copy Verification Link"}
            </button>
          </div>
        ))}

        {USER_SKILL_PROOFS.length === 0 && (
          <div className={styles.emptyState}>
            <h3>Your Vault is Empty</h3>
            <p>Solve Innovation Challenges or complete Academy Courses to earn verifiable skills.</p>
          </div>
        )}
      </div>
    </div>
  );
}
