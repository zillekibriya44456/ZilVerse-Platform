"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X, Clock } from "lucide-react";
import { useTimezone, timezones } from "@/context/TimezoneContext";
import styles from "./CountrySelector.module.css"; // Reuse the same CSS module for consistency

export default function TimezoneSelector() {
  const { timezone, setTimezone } = useTimezone();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = timezones.filter((t) =>
    t.label.toLowerCase().includes(search.toLowerCase()) ||
    t.id.toLowerCase().includes(search.toLowerCase())
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
        aria-label="Select Timezone"
        aria-expanded={open}
      >
        <Clock size={15} className={styles.globeIcon} />
        <span className={styles.name}>{timezone.id.split("/").pop()?.replace(/_/g, " ")}</span>
        <ChevronDown size={13} className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`} />
      </button>

      {open && (
        <div className={styles.dropdown} style={{ minWidth: "220px" }}>
          <div className={styles.searchRow}>
            <Search size={14} className={styles.searchIcon} />
            <input
              ref={inputRef}
              className={styles.searchInput}
              placeholder="Search timezone..."
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
              <li className={styles.noResult}>No timezone found</li>
            )}
            {filtered.map((t) => (
              <li key={t.id}>
                <button
                  className={`${styles.item} ${timezone.id === t.id ? styles.itemActive : ""}`}
                  onClick={() => {
                    setTimezone(t);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <span className={styles.itemName} style={{ marginLeft: 0 }}>{t.label}</span>
                  {timezone.id === t.id && (
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
