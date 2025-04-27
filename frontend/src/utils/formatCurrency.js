export const countryCurrencyMap = {
  Vietnam: { code: "VND", symbol: "₫" },
  "United Kingdom": { code: "GBP", symbol: "£" },
  "United States": { code: "USD", symbol: "$" },
  Japan: { code: "JPY", symbol: "¥" },
  Germany: { code: "EUR", symbol: "€" },
  Switzerland: { code: "CHF", symbol: "CHF" },
  Norway: { code: "NOK", symbol: "kr" },
  Sweden: { code: "SEK", symbol: "kr" },
  Denmark: { code: "DKK", symbol: "kr" },
  Poland: { code: "PLN", symbol: "zł" },
  "Czech Republic": { code: "CZK", symbol: "Kč" },
  Czechia: { code: "CZK", symbol: "Kč" },
  Hungary: { code: "HUF", symbol: "Ft" },
  Turkey: { code: "TRY", symbol: "₺" },
  Argentina: { code: "ARS", symbol: "$" },
  Chile: { code: "CLP", symbol: "$" },
  Colombia: { code: "COP", symbol: "$" },
  Peru: { code: "PEN", symbol: "S/." },
  Venezuela: { code: "VES", symbol: "Bs." },
  Ukraine: { code: "UAH", symbol: "₴" },
  Israel: { code: "ILS", symbol: "₪" },
  Singapore: { code: "SGD", symbol: "$" },
  "Hong Kong": { code: "HKD", symbol: "$" },
  Taiwan: { code: "TWD", symbol: "NT$" },
  Morocco: { code: "MAD", symbol: "د.م." },
  Tanzania: { code: "TZS", symbol: "Sh" },
};

export function getCurrencyFromCountry(country) {
  return countryCurrencyMap[country]?.code || "USD";
}

export function getCurrencySymbolFromCountry(country) {
  return countryCurrencyMap[country]?.symbol || "$";
}

export function formatCurrency(amount, currencyCode, symbol = null) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currencyCode,
    currencyDisplay: symbol ? "code" : "symbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(amount)
    .replace(currencyCode, symbol || currencyCode);
}
