import { CertificateData } from "@/data/certificates";
import styles from "./Certificate.module.css";
import React from "react";

interface Props {
  data: CertificateData;
  isPublicView?: boolean;
}

export default function Certificate({ data, isPublicView = false }: Props) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles.certificateContainer}>
      {!isPublicView && (
        <div className={styles.actions}>
          <button onClick={handlePrint} className="btn btn-primary">
            Download / Print PDF
          </button>
        </div>
      )}

      {/* The Printable Area */}
      <div className={styles.printArea}>
        <div className={styles.certificateCanvas}>
          <div className={styles.borderInner}>
            <div className={styles.watermark}>ZILVERSE</div>
            
            <div className={styles.header}>
              <div className={styles.logo}>
                Technical Ilahi <span>Hub</span>
              </div>
              <div className={styles.certType}>Certificate of Completion</div>
            </div>

            <div className={styles.body}>
              <p className={styles.presentedTo}>This is proudly presented to</p>
              <h1 className={styles.studentName}>{data.studentName}</h1>
              <p className={styles.reason}>
                For successfully completing the {data.type.toLowerCase()}:
              </p>
              <h2 className={styles.courseTitle}>{data.title}</h2>
              <p className={styles.date}>Granted on {data.issueDate}</p>
            </div>

            <div className={styles.footer}>
              <div className={styles.signatureBlock}>
                <div className={styles.signatureText}>{data.instructorSignature}</div>
                <div className={styles.signatureLine}></div>
                <p>Instructor Signature</p>
                <p className={styles.instructorName}>{data.instructorName}</p>
              </div>

              <div className={styles.verificationBlock}>
                {/* CSS Mock QR Code for visual fidelity */}
                <div className={styles.mockQr}>
                  <div className={styles.qrCornerTopLeft} />
                  <div className={styles.qrCornerTopRight} />
                  <div className={styles.qrCornerBottomLeft} />
                  <div className={styles.qrCenter} />
                </div>
                <p>Scan to Verify</p>
                <p className={styles.certId}>ID: {data.id}</p>
              </div>

              <div className={styles.signatureBlock}>
                <div className={styles.signatureText}>{data.platformSignature}</div>
                <div className={styles.signatureLine}></div>
                <p>Platform Authorization</p>
                <p className={styles.instructorName}>ZilVerse</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
