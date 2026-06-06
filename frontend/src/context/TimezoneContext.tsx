"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Timezone {
  id: string;
  label: string;
  offset: number; // offset in hours from UTC
}

export const timezones: Timezone[] = [
  { id: "UTC", label: "UTC / GMT", offset: 0 },
  { id: "America/New_York", label: "Eastern Time (EST/EDT)", offset: -5 },
  { id: "America/Los_Angeles", label: "Pacific Time (PST/PDT)", offset: -8 },
  { id: "Europe/London", label: "London (GMT/BST)", offset: 0 },
  { id: "Europe/Paris", label: "Central European Time (CET/CEST)", offset: 1 },
  { id: "Asia/Dubai", label: "Dubai (GST)", offset: 4 },
  { id: "Asia/Kolkata", label: "India Standard Time (IST)", offset: 5.5 },
  { id: "Asia/Tokyo", label: "Japan Standard Time (JST)", offset: 9 },
  { id: "Australia/Sydney", label: "Australian Eastern Time (AEST/AEDT)", offset: 10 },
];

interface TimezoneContextType {
  timezone: Timezone;
  setTimezone: (t: Timezone) => void;
  formatDate: (dateStr: string | Date) => string;
}

// Default to browser timezone or UTC
const defaultTz = timezones[0];

const TimezoneContext = createContext<TimezoneContextType>({
  timezone: defaultTz,
  setTimezone: () => {},
  formatDate: (d) => new Date(d).toLocaleString(),
});

export function TimezoneProvider({ children }: { children: React.ReactNode }) {
  const [timezone, setTimezoneState] = useState<Timezone>(defaultTz);

  useEffect(() => {
    const saved = localStorage.getItem("zilverse_timezone");
    if (saved) {
      const found = timezones.find((t) => t.id === saved);
      if (found) {
        setTimezoneState(found);
        return;
      }
    }
    
    // Auto-detect timezone
    try {
      const systemTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const foundSys = timezones.find((t) => t.id === systemTz);
      if (foundSys) {
        setTimezoneState(foundSys);
      }
    } catch (e) {}
  }, []);

  const setTimezone = (t: Timezone) => {
    setTimezoneState(t);
    localStorage.setItem("zilverse_timezone", t.id);
  };

  const formatDate = (dateStr: string | Date) => {
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat(undefined, {
        timeZone: timezone.id,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(d);
    } catch {
      return new Date(dateStr).toLocaleString();
    }
  };

  return (
    <TimezoneContext.Provider value={{ timezone, setTimezone, formatDate }}>
      {children}
    </TimezoneContext.Provider>
  );
}

export const useTimezone = () => useContext(TimezoneContext);
