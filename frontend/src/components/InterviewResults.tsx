"use client";

import Link from "next/link";
import styles from "./InterviewResults.module.css";

interface Props {
  score: number;
  feedback: string;
  name: string;
  role: string;
  onClose: () => void;
}

export default function InterviewResults({ score, feedback, name, role, onClose }: Props) {
  const getScoreColor = () => {
    if (score >= 80) return "#10b981"; // Green
    if (score >= 60) return "#f59e0b"; // Yellow
    return "#ef4444"; // Red
  };

  const getScoreMessage = () => {
    if (score >= 80) return "Outstanding Performance!";
    if (score >= 60) return "Good Effort!";
    return "Keep Practicing!";
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2>AI Interview Results</h2>
          <p>Candidate: {name} | Role: {role}</p>
        </div>

        <div className={styles.scoreSection}>
          <div className={styles.scoreCircle} style={{ borderColor: getScoreColor() }}>
            <span className={styles.scoreValue} style={{ color: getScoreColor() }}>{score}</span>
            <span className={styles.scoreMax}>/ 100</span>
          </div>
          <h3 className={styles.scoreMessage} style={{ color: getScoreColor() }}>
            {getScoreMessage()}
          </h3>
        </div>

        <div className={styles.feedbackSection}>
          <h3>Detailed Feedback</h3>
          <p className={styles.feedbackText}>{feedback}</p>
          
          <div className={styles.metricsGrid}>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Communication</span>
              <div className={styles.metricBar}><div className={styles.metricFill} style={{ width: `${Math.min(score + 10, 100)}%`, background: getScoreColor() }} /></div>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Technical Relevance</span>
              <div className={styles.metricBar}><div className={styles.metricFill} style={{ width: `${score}%`, background: getScoreColor() }} /></div>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Confidence</span>
              <div className={styles.metricBar}><div className={styles.metricFill} style={{ width: `${Math.max(score - 10, 40)}%`, background: getScoreColor() }} /></div>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.primaryBtn} onClick={onClose}>
            View Application Status
          </button>
          <Link href="/jobs" className={styles.secondaryBtn}>
            Browse More Jobs
          </Link>
        </div>
      </div>
    </div>
  );
}
