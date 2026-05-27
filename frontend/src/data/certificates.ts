export interface CertificateData {
  id: string; // Unique Verification ID
  studentName: string;
  title: string;
  type: "Course" | "Internship" | "Project Milestone";
  issueDate: string;
  instructorName: string;
  instructorSignature: string; // URL to a mock signature image or cursive font text
  platformSignature: string; // URL to CEO signature or generic platform stamp
  qrData: string; // URL to the verification page
}

// Mock database of earned certificates
export const USER_CERTIFICATES: CertificateData[] = [
  {
    id: "ZIL-CERT-83492X",
    studentName: "Alex Developer",
    title: "Full Stack Web Development (MERN)",
    type: "Course",
    issueDate: "October 15, 2025",
    instructorName: "Rahul Sharma",
    instructorSignature: "Rahul S.",
    platformSignature: "ZilVerse Admin",
    qrData: "https://zillekibriya.in/verify/ZIL-CERT-83492X",
  },
  {
    id: "ZIL-CERT-11938Y",
    studentName: "Alex Developer",
    title: "Senior UI/UX Designer Summer Program",
    type: "Internship",
    issueDate: "December 01, 2025",
    instructorName: "Priya Patel",
    instructorSignature: "P. Patel",
    platformSignature: "ZilVerse Admin",
    qrData: "https://zillekibriya.in/verify/ZIL-CERT-11938Y",
  }
];

export function getCertificateById(id: string): CertificateData | undefined {
  return USER_CERTIFICATES.find((cert) => cert.id === id);
}
