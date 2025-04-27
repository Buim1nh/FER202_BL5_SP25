// src/services/shippingService.js
import shippingRules from "../data/shipping_rules.json";

export function calculateShippingFeeFromRules(address) {
  if (!address) return 0;

  const { country, state, city } = address;

  // Ưu tiên từ chi tiết nhất đến tổng quát nhất
  const cityRule = shippingRules.find(
    (rule) =>
      rule.country === country &&
      rule.state === state &&
      rule.city?.toLowerCase() === city?.toLowerCase()
  );

  if (cityRule) return cityRule.fee;

  const stateRule = shippingRules.find(
    (rule) => rule.country === country && rule.state === state && !rule.city
  );

  if (stateRule) return stateRule.fee;

  const countryRule = shippingRules.find(
    (rule) => rule.country === country && !rule.state
  );

  if (countryRule) return countryRule.fee;

  return 300; // default fallback fee
}
