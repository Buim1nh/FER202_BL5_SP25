import React from "react";
import { Country } from "country-state-city";
import { useRegion } from "../context/RegionContext";

// Lấy link cờ từ CDN (flagcdn.com)
const getFlagUrl = (isoCode2) =>
  `https://flagcdn.com/w40/${isoCode2.toLowerCase()}.png`;

export default function RegionSelector() {
  const { country, setCountry } = useRegion();
  const allCountries = Country.getAllCountries();

  const selected = allCountries.find((c) => c.name === country);

  return (
    <div className="flex items-center gap-2">
      {selected && (
        <img
          src={getFlagUrl(selected.isoCode)}
          alt={selected.name}
          className="w-5 h-4 object-cover"
        />
      )}
      <select
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        className="text-[11px] border border-gray-300 rounded px-2 py-[1px] text-[#333333]"
      >
        {allCountries.map((c) => (
          <option key={c.isoCode} value={c.name}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
