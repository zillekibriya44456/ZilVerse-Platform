import { getCertificateById } from "@/data/certificates";
import Certificate from "@/components/Certificate";
import Link from "next/link";
import styles from "./verify.module.css";
import { notFound } from "next/navigation";

export default function VerifyCertificatePage({ params }: { params: { id: string } }) {
  const data = getCertificateById(params.id);

  if (!data) {
    return (
      <div className={styles.page}>
        <div className="container">
          <div className={styles.errorBox}>
            <h2>Certificate Not Found</h2>
            <p>The Certificate ID <strong>{params.id}</strong> could not be found in our records.</p>
            <Link href="/" className="btn btn-primary">Return Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className="container">
          <div className={styles.verifiedBadge}>
            ✅ VERIFIED CREDENTIAL
          </div>
          <h1>ZilVerse Certificate Verification</h1>
          <p>
            This document certifies that <strong>{data.studentName}</strong> successfully completed the 
            {data.type.toLowerCase()}: <strong>{data.title}</strong> on {data.issueDate}.
          </p>
        </div>
      </div>

      <div className="container">
        <div className={styles.certContainer}>
          <Certificate data={data} isPublicView={true} />
        </div>
      </div>
    </div>
  );
}
