"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Currency {
  code: string;
  symbol: string;
  rate: number; // Against USD
}

export const currencies: Currency[] = [
  { code: "USD", symbol: "$", rate: 1 },
  { code: "INR", symbol: "₹", rate: 83.5 },
  { code: "EUR", symbol: "€", rate: 0.92 },
  { code: "GBP", symbol: "£", rate: 0.79 },
  { code: "AED", symbol: "د.إ", rate: 3.67 },
  { code: "AUD", symbol: "A$", rate: 1.52 },
  { code: "CAD", symbol: "C$", rate: 1.36 },
  { code: "NGN", symbol: "₦", rate: 1200 },
];

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (usdAmount: number) => string;
}

const defaultCurrency = currencies[0];

const CurrencyContext = createContext<CurrencyContextType>({
  currency: defaultCurrency,
  setCurrency: () => {},
  formatPrice: (usdAmount: number) => `$${usdAmount.toFixed(2)}`,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(defaultCurrency);

  useEffect(() => {
    const saved = localStorage.getItem("zilverse_currency");
    if (saved) {
      const found = currencies.find((c) => c.code === saved);
      if (found) setCurrencyState(found);
    }
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem("zilverse_currency", c.code);
  };

  const formatPrice = (usdAmount: number) => {
    const converted = usdAmount * currency.rate;
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.code,
    }).format(converted);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
