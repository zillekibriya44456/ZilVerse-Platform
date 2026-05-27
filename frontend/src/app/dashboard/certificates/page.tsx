"use client";

import { useState } from "react";
import Link from "next/link";
import { USER_CERTIFICATES, CertificateData } from "@/data/certificates";
import Certificate from "@/components/Certificate";
import styles from "./certificates.module.css";

export default function DashboardCertificatesPage() {
  const [selectedCert, setSelectedCert] = useState<CertificateData | null>(null);

  if (selectedCert) {
    return (
      <div className={styles.container}>
        <button className={styles.backBtn} onClick={() => setSelectedCert(null)}>
          ← Back to Certificates
        </button>
        <Certificate data={selectedCert} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>My Achievements</h2>
        <p>Your verifiable certificates from ZilVerse Academy and Internships.</p>
      </div>

      {USER_CERTIFICATES.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🎓</div>
          <h3>No Certificates Yet</h3>
          <p>Complete courses or internships to earn verifiable certificates.</p>
          <Link href="/academy" className="btn btn-primary">Go to Academy</Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {USER_CERTIFICATES.map((cert) => (
            <div key={cert.id} className={`glass-panel ${styles.card}`}>
              <div className={styles.cardHeader}>
                <span className={styles.typeBadge}>{cert.type}</span>
                <span className={styles.date}>{cert.issueDate}</span>
              </div>
              <h3 className={styles.title}>{cert.title}</h3>
              <p className={styles.instructor}>Instructor: {cert.instructorName}</p>
              <div className={styles.actions}>
                <button 
                  className="btn btn-primary"
                  onClick={() => setSelectedCert(cert)}
                >
                  View Certificate
                </button>
                <Link href={`/verify/${cert.id}`} className="btn btn-secondary" target="_blank">
                  Public Link
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
