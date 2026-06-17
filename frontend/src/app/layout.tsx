import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CountryProvider } from "@/context/CountryContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { TimezoneProvider } from "@/context/TimezoneContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import CustomCursor from "@/components/CustomCursor";
import AIAssistant from "@/components/AIAssistant";
import GlobalNotificationBar from "@/components/GlobalNotificationBar";
import CookieConsent from "@/components/CookieConsent";
import ThemeStudio from "@/components/ThemeStudio";
import ThemeStudioButton from "@/components/ThemeStudioButton";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ZilVerse | Global Tech & Creator Ecosystem",
  description: "Build. Work. Grow — All in One Place. The ultimate worldwide digital ecosystem for freelancing, projects, jobs, and digital services.",
  keywords: ["freelancing", "remote jobs", "digital marketplace", "online courses", "global opportunities", "tech ecosystem", "ZilVerse"],
  authors: [{ name: "ZilVerse" }],
  robots: "index, follow",
  alternates: { canonical: "https://zilverse.com" },
  openGraph: {
    title: "ZilVerse | Global Tech & Creator Ecosystem",
    description: "Build. Work. Grow — All in One Place. Join developers, creators, and entrepreneurs from 150+ countries.",
    url: "https://zilverse.com",
    siteName: "ZilVerse",
    images: [
      {
        url: "https://zilverse.com/images/hero_global_collab.png",
        width: 1200,
        height: 630,
        alt: "ZilVerse Platform Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZilVerse | Global Tech & Creator Ecosystem",
    description: "Build. Work. Grow — All in One Place.",
    creator: "@zilverse",
    images: ["https://zilverse.com/images/hero_global_collab.png"],
  },
};

export const viewport = {
  themeColor: "#A855F7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        {/* Structured Data — Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "ZilVerse",
            "url": "https://zilverse.com",
            "logo": "https://zilverse.com/icon-192x192.png",
            "description": "Build. Work. Grow — The ultimate global tech & creator ecosystem.",
            "sameAs": [
              "https://twitter.com/zilverse",
              "https://linkedin.com/company/zilverse",
              "https://instagram.com/zilverse"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer support",
              "url": "https://zilverse.com/contact"
            }
          }) }}
        />
        {/* Structured Data — WebSite with Sitelinks Searchbox */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "ZilVerse",
            "url": "https://zilverse.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": { "@type": "EntryPoint", "urlTemplate": "https://zilverse.com/jobs?q={search_term_string}" },
              "query-input": "required name=search_term_string"
            }
          }) }}
        />
        {/* Hide Google Translate's default toolbar/banner */}
        <style>{`
          .goog-te-banner-frame { display: none !important; }
          .goog-te-menu-frame { box-shadow: none !important; }
          .skiptranslate { display: none !important; }
          body { top: 0px !important; }
          #google_translate_element { display: none !important; }
          .goog-te-gadget { display: none !important; }
          .goog-te-balloon-frame { display: none !important; }
          font[face] { background: transparent !important; }
        `}</style>
      </head>
      <body>
        {/* Google Translate Initializer */}
        <Script
          id="google-translate-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.googleTranslateElementInit = function() {
                new window.google.translate.TranslateElement({
                  pageLanguage: 'en',
                  autoDisplay: false,
                  layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
                }, 'google_translate_element');
              };
            `,
          }}
        />
        {/* Hidden Google Translate Element — required for the API to work */}
        <div id="google_translate_element" style={{ display: "none" }} />

        <LanguageProvider>
          <CountryProvider>
            <CurrencyProvider>
              <TimezoneProvider>
                <AuthProvider>
                  <ThemeProvider>
                    <Navbar />
                    <main className="page-enter" style={{ minHeight: "calc(100vh - 73px)" }}>
                      {children}
                    </main>
                    <Footer />
                    <WhatsAppButton />
                    <AIAssistant />
                    <CustomCursor />
                    <GlobalNotificationBar />
                    <CookieConsent />
                    <ThemeStudio />
                    <ThemeStudioButton />
                  </ThemeProvider>
                </AuthProvider>
              </TimezoneProvider>
            </CurrencyProvider>
          </CountryProvider>
        </LanguageProvider>

        {/* Google Translate Script — loads after page is interactive */}
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
