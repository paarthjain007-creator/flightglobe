import { useState, useEffect } from "react";

// Robust fallback exchange rates relative to USD (1 USD = X Currency)
const FALLBACK_RATES = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.78,
  JPY: 155.4,
  CAD: 1.36,
  AUD: 1.51,
  CHF: 0.90,
  CNY: 7.24,
  INR: 83.3,
  SGD: 1.35,
  AED: 3.67,
  KRW: 1375.0,
  BRL: 5.15,
  MXN: 16.7,
  ZAR: 18.4,
  THB: 36.8,
  QAR: 3.64,
  IDR: 16050.0,
  MYR: 4.72,
  NZD: 1.64,
  HKD: 7.82,
  TRY: 32.2,
  ILS: 3.71,
  KES: 131.0,
  EGP: 47.3,
  COP: 3890.0,
  PEN: 3.73,
};

function getFallbackRate(from, to) {
  const fromRate = FALLBACK_RATES[from] || 1.0;
  const toRate = FALLBACK_RATES[to] || 1.0;
  return toRate / fromRate;
}

export function useCurrency(fromCurrency, toCurrency, amount) {
  const [result, setResult] = useState(null);
  const [rate, setRate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    const numericAmount = typeof amount === "number" ? amount : parseFloat(amount) || 0;

    if (!fromCurrency || !toCurrency) {
      setResult(0);
      setRate(1);
      return;
    }

    if (fromCurrency === toCurrency) {
      setResult(numericAmount);
      setRate(1);
      setIsFallback(false);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();
    setLoading(true);

    fetch(
      `https://api.frankfurter.app/latest?from=${fromCurrency}&to=${toCurrency}`,
      { signal: controller.signal }
    )
      .then((r) => {
        if (!r.ok) throw new Error("API status non-ok");
        return r.json();
      })
      .then((data) => {
        if (!isMounted) return;
        const r = data.rates?.[toCurrency];
        if (r) {
          setRate(r);
          setResult(numericAmount * r);
          setIsFallback(false);
        } else {
          // Currency not in Frankfurter -> use fallback rates engine
          const fb = getFallbackRate(fromCurrency, toCurrency);
          setRate(fb);
          setResult(numericAmount * fb);
          setIsFallback(true);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        if (err.name !== "AbortError") {
          // Offline / Network failure / CORS fallback
          const fb = getFallbackRate(fromCurrency, toCurrency);
          setRate(fb);
          setResult(numericAmount * fb);
          setIsFallback(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [fromCurrency, toCurrency, amount]);

  return { result, rate, loading, isFallback };
}
