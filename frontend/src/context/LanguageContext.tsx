"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { languages, Language, mapBrowserLang } from "@/constants/languages";

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  isTranslating: boolean;
}

const defaultLang = languages.find((l) => l.code === "en")!;

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: defaultLang,
  setLanguage: () => {},
  isTranslating: false,
});

function getCookieLang(): string {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "en";
}

function applyGoogleTranslate(code: string) {
  if (code === "en") {
    // Remove cookie to restore English
    const past = "Thu, 01 Jan 1970 00:00:00 UTC";
    document.cookie = `googtrans=; expires=${past}; path=/`;
    document.cookie = `googtrans=; expires=${past}; path=/; domain=${window.location.hostname}`;
    document.cookie = `googtrans=; expires=${past}; path=/; domain=.${window.location.hostname}`;
  } else {
    const val = `/en/${code}`;
    document.cookie = `googtrans=${val}; path=/`;
    document.cookie = `googtrans=${val}; path=/; domain=.${window.location.hostname}`;
  }
  window.location.reload();
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>(defaultLang);

  // Sync from cookie after mount (avoids hydration mismatch)
  useEffect(() => {
    const cookieCode = getCookieLang();
    const found = languages.find((l) => l.code === cookieCode);
    if (found) setCurrentLanguage(found);

    // Auto-detect on first visit
    const saved = localStorage.getItem("zilverse_lang");
    if (!saved) {
      const browserLang = navigator.language || "en";
      const mapped = mapBrowserLang(browserLang);
      if (mapped !== "en") {
        localStorage.setItem("zilverse_lang", mapped);
        applyGoogleTranslate(mapped);
      } else {
        localStorage.setItem("zilverse_lang", "en");
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setIsTranslating(true);
    localStorage.setItem("zilverse_lang", lang.code);
    applyGoogleTranslate(lang.code);
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, isTranslating }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
