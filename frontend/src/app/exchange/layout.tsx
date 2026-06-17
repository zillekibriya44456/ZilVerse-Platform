import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ZilVerse Exchange | Trade Skills Without Money",
  description:
    "Barter your expertise with other global creators on ZilVerse Skills Exchange. Trade services like coding, design, marketing, and more without spending a dollar.",
  openGraph: {
    title: "ZilVerse Exchange | Trade Skills Without Money",
    description: "Trade services like coding, design, marketing, and more without spending money.",
    url: "https://zilverse.com/exchange",
    siteName: "ZilVerse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZilVerse Exchange | Trade Skills Without Money",
    description: "Trade services like coding, design, and marketing without spending money.",
    creator: "@zilverse",
  },
};

export default function ExchangeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
