import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

countries.registerLocale(enLocale);

export type CountryOption = { value: string; label: string };

/** ISO 3166-1 alpha-2 codes with English names, sorted by label. */
export function getCountryOptions(): CountryOption[] {
  const names = countries.getNames("en", { select: "official" });
  return Object.entries(names)
    .map(([code, name]) => ({ value: code, label: name }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function getCountryLabel(code: string): string {
  if (!code) return "";
  return countries.getName(code, "en", { select: "official" }) || code;
}
