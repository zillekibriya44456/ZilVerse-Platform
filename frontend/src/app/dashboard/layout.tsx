import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ZilVerse Dashboard | Your Workspace",
  description:
    "Manage your projects, applications, messages, wallet, and analytics from your personal ZilVerse Dashboard.",
  robots: { index: false, follow: false }, // Private — don't index
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
