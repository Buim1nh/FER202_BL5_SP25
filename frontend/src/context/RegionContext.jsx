import React, { createContext, useContext, useState, useEffect } from "react";
import { Country } from "country-state-city";
import currencyCodes from "currency-codes";
import getSymbolFromCurrency from "currency-symbol-map";
import { useExchangeRates } from "../hooks/useExchangeRates";

const RegionContext = createContext();

export const RegionProvider = ({ children }) => {
  const [country, setCountryState] = useState("United States");
  const [currencyMeta, setCurrencyMeta] = useState({
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    digits: 2,
    number: "840",
    countries: ["United States"],
  });
  const [exchangeRate, setExchangeRate] = useState(1);

  const { getExchangeRate } = useExchangeRates();

  // Khôi phục từ localStorage nếu có
  useEffect(() => {
    const storedCountry = localStorage.getItem("selectedCountry");
    if (storedCountry) {
      setCountryState(storedCountry);
    }
  }, []);

  // Đồng bộ country → currencyMeta và exchangeRate
  useEffect(() => {
    const countryInfo = Country.getAllCountries().find(
      (c) => c.name === country
    );
    const currencyCode = countryInfo?.currency || "USD";
    const currencyInfo = currencyCodes.code(currencyCode);
    const symbol = getSymbolFromCurrency(currencyCode) || "$";

    setCurrencyMeta({
      code: currencyCode,
      name: currencyInfo?.currency || "Currency",
      symbol,
      digits: currencyInfo?.digits ?? 2,
      number: currencyInfo?.number ?? "000",
      countries: currencyInfo?.countries || [country],
    });

    const fetchRate = async () => {
      const rate = await getExchangeRate(currencyCode);
      setExchangeRate(rate);
    };
    fetchRate();
  }, [country]);

  // Khi thay đổi country → lưu vào localStorage
  const setCountry = (newCountry) => {
    setCountryState(newCountry);
    localStorage.setItem("selectedCountry", newCountry);
  };

  return (
    <RegionContext.Provider
      value={{
        country,
        setCountry,
        currencyMeta,
        exchangeRate,
      }}
    >
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = () => useContext(RegionContext);
