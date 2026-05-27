"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Search, X } from "lucide-react";
import { useCountry } from "@/context/CountryContext";
import { countries } from "@/constants/countries";
import styles from "./CountrySelector.module.css";

const worldwideOption = { name: "Worldwide", code: "WW", flag: "🌐" };
const allOptions = [worldwideOption, ...countries];

export default function CountrySelector() {
  const { selectedCountry, setSelectedCountry } = useCountry();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = allOptions.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        className={styles.trigger}
        onClick={() => setOpen((o) => !o)}
        aria-label="Select Country"
        aria-expanded={open}
      >
        <Globe size={15} className={styles.globeIcon} />
        <span className={styles.flag}>{selectedCountry.flag}</span>
        <span className={styles.name}>{selectedCountry.code === "WW" ? "Worldwide" : selectedCountry.code}</span>
        <ChevronDown size={13} className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`} />
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.searchRow}>
            <Search size={14} className={styles.searchIcon} />
            <input
              ref={inputRef}
              className={styles.searchInput}
              placeholder="Search country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className={styles.clearBtn} onClick={() => setSearch("")}>
                <X size={12} />
              </button>
            )}
          </div>
          <ul className={styles.list}>
            {filtered.length === 0 && (
              <li className={styles.noResult}>No country found</li>
            )}
            {filtered.map((country) => (
              <li key={country.code}>
                <button
                  className={`${styles.item} ${selectedCountry.code === country.code ? styles.itemActive : ""}`}
                  onClick={() => {
                    setSelectedCountry(country);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <span className={styles.itemFlag}>{country.flag}</span>
                  <span className={styles.itemName}>{country.name}</span>
                  {selectedCountry.code === country.code && (
                    <span className={styles.checkmark}>✓</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
