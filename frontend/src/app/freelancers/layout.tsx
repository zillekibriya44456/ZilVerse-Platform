import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ZilVerse Freelancers | Hire Verified Global Talent",
  description:
    "Browse 2,400+ verified freelancers across development, design, marketing, and AI on ZilVerse. Hire top talent from 150+ countries.",
  openGraph: {
    title: "ZilVerse Freelancers | Hire Verified Global Talent",
    description: "Browse 2,400+ verified freelancers across development, design, marketing, and AI.",
    url: "https://zilverse.com/freelancers",
    siteName: "ZilVerse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZilVerse Freelancers | Hire Verified Global Talent",
    description: "Browse 2,400+ verified freelancers from 150+ countries.",
    creator: "@zilverse",
  },
};

export default function FreelancersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
