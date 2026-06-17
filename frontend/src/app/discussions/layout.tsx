import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ZilVerse Discussions | Developer Q&A Forum",
  description:
    "Ask questions, share knowledge, and debate tech trends with verified engineers on ZilVerse Discussions. Topics cover Frontend, Backend, System Design, and AI.",
  openGraph: {
    title: "ZilVerse Discussions | Developer Q&A Forum",
    description: "Ask questions and share knowledge with verified engineers on ZilVerse.",
    url: "https://zilverse.com/discussions",
    siteName: "ZilVerse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZilVerse Discussions | Developer Q&A Forum",
    description: "Ask questions and share knowledge with engineers worldwide.",
    creator: "@zilverse",
  },
};

export default function DiscussionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
