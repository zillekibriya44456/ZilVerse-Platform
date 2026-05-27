"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { countries, Country } from "@/constants/countries";

interface CountryContextType {
  selectedCountry: Country;
  setSelectedCountry: (country: Country) => void;
}

const defaultCountry: Country = { name: "Worldwide", code: "WW", flag: "🌐" };

const CountryContext = createContext<CountryContextType>({
  selectedCountry: defaultCountry,
  setSelectedCountry: () => {},
});

export function CountryProvider({ children }: { children: React.ReactNode }) {
  const [selectedCountry, setSelectedCountryState] = useState<Country>(defaultCountry);

  useEffect(() => {
    const saved = localStorage.getItem("zilverse_country");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const found = [defaultCountry, ...countries].find((c) => c.code === parsed.code);
        if (found) setSelectedCountryState(found);
      } catch {}
    }
  }, []);

  const setSelectedCountry = (country: Country) => {
    setSelectedCountryState(country);
    localStorage.setItem("zilverse_country", JSON.stringify(country));
  };

  return (
    <CountryContext.Provider value={{ selectedCountry, setSelectedCountry }}>
      {children}
    </CountryContext.Provider>
  );
}

export const useCountry = () => useContext(CountryContext);
