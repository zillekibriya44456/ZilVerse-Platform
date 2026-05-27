"use client";

import { useState, useRef, useEffect } from "react";
import { Languages, ChevronDown, Search, X, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { languages } from "@/constants/languages";
import styles from "./LanguageSelector.module.css";

export default function LanguageSelector() {
  const { currentLanguage, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = languages.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.native.toLowerCase().includes(search.toLowerCase()) ||
      l.code.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        className={styles.trigger}
        onClick={() => setOpen((o) => !o)}
        aria-label="Select Language"
        aria-expanded={open}
        id="language-selector-btn"
      >
        <Languages size={14} className={styles.langIcon} />
        <span className={styles.flag}>{currentLanguage.flag}</span>
        <span className={styles.code}>{currentLanguage.code === "en" ? "EN" : currentLanguage.code.toUpperCase().slice(0, 5)}</span>
        <ChevronDown size={12} className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`} />
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <Languages size={14} className={styles.headerIcon} />
            <span>Select Language</span>
          </div>
          <div className={styles.searchRow}>
            <Search size={13} className={styles.searchIcon} />
            <input
              ref={inputRef}
              className={styles.searchInput}
              placeholder="Search language..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className={styles.clearBtn} onClick={() => setSearch("")}>
                <X size={11} />
              </button>
            )}
          </div>
          <ul className={styles.list}>
            {filtered.length === 0 && (
              <li className={styles.noResult}>No language found</li>
            )}
            {filtered.map((lang) => (
              <li key={lang.code}>
                <button
                  className={`${styles.item} ${currentLanguage.code === lang.code ? styles.itemActive : ""}`}
                  onClick={() => {
                    setLanguage(lang);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <span className={styles.itemFlag}>{lang.flag}</span>
                  <div className={styles.itemText}>
                    <span className={styles.itemNative}>{lang.native}</span>
                    <span className={styles.itemName}>{lang.name}</span>
                  </div>
                  {currentLanguage.code === lang.code && (
                    <Check size={13} className={styles.checkmark} />
                  )}
                </button>
              </li>
            ))}
          </ul>
          <div className={styles.footer}>
            🌐 Powered by Google Translate
          </div>
        </div>
      )}
    </div>
  );
}
