import { createContext, useContext, useEffect, useMemo, useState } from "react";

/* StreamKart currency engine.
   Base currency: INR. All product prices in DB are stored in INR.
   Frontend converts to user's local currency for display. */

const CurrencyContext = createContext(null);
const STORAGE_KEY = "streamkart_currency_v1";

// Approximate FX rates relative to 1 INR. Update as needed.
export const CURRENCIES = {
  INR: { code: "INR", symbol: "₹", rate: 1,        locale: "en-IN", name: "Indian Rupee" },
  USD: { code: "USD", symbol: "$", rate: 0.012,    locale: "en-US", name: "US Dollar" },
  GBP: { code: "GBP", symbol: "£", rate: 0.0095,   locale: "en-GB", name: "British Pound" },
  EUR: { code: "EUR", symbol: "€", rate: 0.011,    locale: "en-IE", name: "Euro" },
  AUD: { code: "AUD", symbol: "A$", rate: 0.018,   locale: "en-AU", name: "Australian Dollar" },
  CAD: { code: "CAD", symbol: "C$", rate: 0.016,   locale: "en-CA", name: "Canadian Dollar" },
  AED: { code: "AED", symbol: "د.إ", rate: 0.044,  locale: "ar-AE", name: "UAE Dirham" },
  SGD: { code: "SGD", symbol: "S$", rate: 0.016,   locale: "en-SG", name: "Singapore Dollar" },
  JPY: { code: "JPY", symbol: "¥", rate: 1.85,     locale: "ja-JP", name: "Japanese Yen" },
};

const COUNTRY_TO_CURRENCY = {
  IN: "INR",
  US: "USD",
  GB: "GBP", UK: "GBP",
  AU: "AUD", CA: "CAD", AE: "AED", SG: "SGD", JP: "JPY",
  // Eurozone
  DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR", NL: "EUR", BE: "EUR",
  AT: "EUR", IE: "EUR", PT: "EUR", FI: "EUR", GR: "EUR", LU: "EUR",
};

export function CurrencyProvider({ children }) {
  const [code, setCode] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && CURRENCIES[saved] ? saved : "INR";
  });
  const [autoDetected, setAutoDetected] = useState(false);

  useEffect(() => {
    // Only auto-detect if user has not previously set a preference
    if (localStorage.getItem(STORAGE_KEY)) return;
    let cancelled = false;
    const backend = process.env.REACT_APP_BACKEND_URL;
    fetch(`${backend}/api/geo`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.country_code) return;
        const c = COUNTRY_TO_CURRENCY[data.country_code];
        if (c && CURRENCIES[c]) {
          setCode(c);
          setAutoDetected(true);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const setCurrency = (newCode) => {
    if (!CURRENCIES[newCode]) return;
    setCode(newCode);
    localStorage.setItem(STORAGE_KEY, newCode);
  };

  const value = useMemo(() => {
    const meta = CURRENCIES[code];
    const format = (inrAmount) => {
      const amt = (inrAmount || 0) * meta.rate;
      // Smart rounding: integer for INR/JPY; 2 decimals otherwise
      const useInt = code === "INR" || code === "JPY";
      const opts = useInt
        ? { maximumFractionDigits: 0, minimumFractionDigits: 0 }
        : { maximumFractionDigits: 2, minimumFractionDigits: 2 };
      const num = useInt ? Math.round(amt) : amt;
      return `${meta.symbol}${num.toLocaleString(meta.locale, opts)}`;
    };
    return { code, meta, currencies: CURRENCIES, setCurrency, format, autoDetected };
  }, [code, autoDetected]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used inside CurrencyProvider");
  return ctx;
};
