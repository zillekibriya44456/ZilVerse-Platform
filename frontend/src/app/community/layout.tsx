import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ZilVerse Community | Global Hub for Developers & Creators",
  description:
    "Join the ZilVerse community of 25,000+ developers, designers, and creators. Explore Reels, Discussions, Skills Exchange, and live Events.",
  openGraph: {
    title: "ZilVerse Community | Global Hub for Developers & Creators",
    description: "Join 25,000+ developers, designers, and creators on ZilVerse.",
    url: "https://zilverse.com/community",
    siteName: "ZilVerse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZilVerse Community | Global Hub for Developers & Creators",
    description: "Join 25,000+ developers, designers, and creators on ZilVerse.",
    creator: "@zilverse",
  },
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
