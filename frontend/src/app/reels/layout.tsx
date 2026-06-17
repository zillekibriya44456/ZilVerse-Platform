import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ZilVerse InnoReels | Creator Video Feed",
  description:
    "Watch project demos, startup pitches, and tech tutorials on ZilVerse InnoReels. A TikTok-style vertical video feed for the builder community.",
  openGraph: {
    title: "ZilVerse InnoReels | Creator Video Feed",
    description: "Watch project demos, startup pitches, and tech tutorials on ZilVerse.",
    url: "https://zilverse.com/reels",
    siteName: "ZilVerse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZilVerse InnoReels | Creator Video Feed",
    description: "Watch project demos and startup pitches from the builder community.",
    creator: "@zilverse",
  },
};

export default function ReelsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
