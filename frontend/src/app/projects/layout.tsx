import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ZilVerse Projects | Buy & Sell Tech Projects Globally",
  description:
    "Discover, buy, and sell ready-made tech projects, SaaS products, and digital assets on ZilVerse Marketplace. Verified sellers, escrow payments.",
  openGraph: {
    title: "ZilVerse Projects | Buy & Sell Tech Projects Globally",
    description: "Discover, buy, and sell ready-made tech projects, SaaS products, and digital assets.",
    url: "https://zilverse.com/projects",
    siteName: "ZilVerse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZilVerse Projects | Buy & Sell Tech Projects Globally",
    description: "Buy and sell ready-made tech projects with escrow payments.",
    creator: "@zilverse",
  },
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
