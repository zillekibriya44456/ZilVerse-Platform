"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X, DollarSign } from "lucide-react";
import { useCurrency, currencies } from "@/context/CurrencyContext";
import styles from "./CountrySelector.module.css"; // Reuse the same CSS module for consistency

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = currencies.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.symbol.toLowerCase().includes(search.toLowerCase())
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
        aria-label="Select Currency"
        aria-expanded={open}
      >
        <DollarSign size={15} className={styles.globeIcon} />
        <span className={styles.name}>{currency.code} ({currency.symbol})</span>
        <ChevronDown size={13} className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`} />
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.searchRow}>
            <Search size={14} className={styles.searchIcon} />
            <input
              ref={inputRef}
              className={styles.searchInput}
              placeholder="Search currency..."
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
              <li className={styles.noResult}>No currency found</li>
            )}
            {filtered.map((c) => (
              <li key={c.code}>
                <button
                  className={`${styles.item} ${currency.code === c.code ? styles.itemActive : ""}`}
                  onClick={() => {
                    setCurrency(c);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <span className={styles.itemFlag}>{c.symbol}</span>
                  <span className={styles.itemName}>{c.code}</span>
                  {currency.code === c.code && (
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
