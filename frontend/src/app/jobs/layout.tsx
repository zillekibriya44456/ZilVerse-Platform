import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ZilVerse Job Board | Remote Jobs, Tech & Freelance Opportunities",
  description:
    "Find remote jobs, full-time tech positions, and freelance contracts on the ZilVerse Job Board. 100+ new postings daily from global companies.",
  openGraph: {
    title: "ZilVerse Job Board | Remote Jobs, Tech & Freelance",
    description: "Find remote jobs, full-time tech positions, and freelance contracts. 100+ new postings daily.",
    url: "https://zilverse.com/jobs",
    siteName: "ZilVerse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZilVerse Job Board | Remote Jobs, Tech & Freelance",
    description: "Find remote jobs, full-time tech positions, and freelance contracts.",
    creator: "@zilverse",
  },
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
