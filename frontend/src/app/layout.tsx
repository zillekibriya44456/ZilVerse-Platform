import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CountryProvider } from "@/context/CountryContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { TimezoneProvider } from "@/context/TimezoneContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import CustomCursor from "@/components/CustomCursor";
import AIAssistant from "@/components/AIAssistant";
import GlobalNotificationBar from "@/components/GlobalNotificationBar";
import CookieConsent from "@/components/CookieConsent";
import ThemeCustomizerModal from "@/components/ThemeCustomizerModal";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ZilVerse | Global Tech & Creator Ecosystem",
  description: "Build. Work. Grow — All in One Place. The ultimate worldwide digital ecosystem for freelancing, projects, jobs, and digital services.",
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#A855F7" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
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

        <ThemeProvider>
          <LanguageProvider>
            <CountryProvider>
              <CurrencyProvider>
                <TimezoneProvider>
                  <AuthProvider>
                    <Navbar />
                    <main style={{ minHeight: "calc(100vh - 73px)" }}>
                      {children}
                    </main>
                    <Footer />
                    <WhatsAppButton />
                    <AIAssistant />
                    <CustomCursor />
                    <GlobalNotificationBar />
                    <CookieConsent />
                    <ThemeCustomizerModal />
                  </AuthProvider>
                </TimezoneProvider>
              </CurrencyProvider>
            </CountryProvider>
          </LanguageProvider>
        </ThemeProvider>

        {/* Google Translate Script — loads after page is interactive */}
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
