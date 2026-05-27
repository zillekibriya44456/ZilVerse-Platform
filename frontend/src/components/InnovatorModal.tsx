import Image from "next/image";
import { Innovator } from "@/data/innovators";
import styles from "./InnovatorModal.module.css";

interface Props {
  innovator: Innovator;
  onClose: () => void;
}

export default function InnovatorModal({ innovator, onClose }: Props) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
        
        <div className={styles.modalContent}>
          <div className={styles.imageSection}>
            <div className={styles.imageWrapper}>
              {/* Note: Unoptimized true is used because we're pulling from external wikimedia domains without configuring next.config.js for external domains to avoid build breakages */}
              <Image 
                src={innovator.image} 
                alt={innovator.name} 
                fill 
                className={styles.image}
                unoptimized={true}
              />
            </div>
          </div>
          
          <div className={styles.textSection}>
            <div className={styles.badge}>{innovator.country}</div>
            <h2 className={styles.name}>{innovator.name}</h2>
            <h3 className={styles.role}>{innovator.role}</h3>
            
            <div className={styles.quoteBlock}>
              <span className={styles.quoteMark}>"</span>
              <p>{innovator.quote}</p>
            </div>
            
            <div className={styles.bioSection}>
              <h4>Biography</h4>
              <p>{innovator.bio}</p>
            </div>
            
            <div className={styles.contributionSection}>
              <h4>Major Contributions to Society</h4>
              <ul className={styles.contributionsList}>
                {innovator.contributions.map((contribution, index) => (
                  <li key={index}>{contribution}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
