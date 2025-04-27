import { useEffect, useState } from "react";
import axios from "axios";

const CACHE_KEY = "exchangeRates";
const CACHE_EXPIRY_KEY = "exchangeRatesExpiry";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function useExchangeRates(baseCurrency = "USD") {
  const [rates, setRates] = useState({});

  useEffect(() => {
    const now = Date.now();

    try {
      const cachedRatesRaw = localStorage.getItem(CACHE_KEY);
      const cachedRates = cachedRatesRaw ? JSON.parse(cachedRatesRaw) : null;
      const cachedExpiry = parseInt(localStorage.getItem(CACHE_EXPIRY_KEY));

      if (cachedRates && cachedExpiry && now < cachedExpiry) {
        setRates(cachedRates);
        return;
      }
    } catch (e) {
      console.warn("Invalid cached exchange rates, clearing...");
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_EXPIRY_KEY);
    }

    axios
      .get(`https://open.er-api.com/v6/latest/${baseCurrency}`)
      .then((res) => {
        const fetchedRates = res.data.rates || res.data.conversion_rates;
        if (fetchedRates) {
          setRates(fetchedRates);
          localStorage.setItem(CACHE_KEY, JSON.stringify(fetchedRates));
          localStorage.setItem(
            CACHE_EXPIRY_KEY,
            (now + CACHE_DURATION).toString()
          );
        } else {
          console.warn("Exchange rates not found in API response");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch exchange rates:", err);
        setRates({});
      });
  }, [baseCurrency]);

  // ✅ Bổ sung hàm helper
  const getExchangeRate = (currencyCode) => {
    return rates[currencyCode] || 1;
  };

  return { rates, getExchangeRate };
}
