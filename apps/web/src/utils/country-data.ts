import countries from "i18n-iso-countries";
import enCountryNames from "i18n-iso-countries/langs/en.json";
import jaCountryNames from "i18n-iso-countries/langs/ja.json";
import { getCountries, getCountryCallingCode } from "libphonenumber-js/min";
import type { CountryCode } from "libphonenumber-js";
import type { AppLocale } from "@/i18n/routing";

countries.registerLocale(enCountryNames);
countries.registerLocale(jaCountryNames);

export type CountryOption = {
  countryCode: string;
  countryName: string;
  isdCode: string;
};

const localeMap: Record<AppLocale, "en" | "ja"> = {
  en: "en",
  ja: "ja",
};

/**
 * Builds the localized country and international dialing-code dataset used by
 * the demo controls.
 */
export function getCountryDialingOptions(locale: AppLocale): CountryOption[] {
  const language = localeMap[locale] ?? "en";
  const supportedCountries = new Set<CountryCode>(getCountries());
  const localizedCountryNames = countries.getNames(language, {
    select: "official",
  }) as Record<string, string>;

  return Object.entries(localizedCountryNames)
    .flatMap(([countryCode, countryName]) => {
      if (!supportedCountries.has(countryCode as CountryCode)) {
        return [];
      }

      return [
        {
          countryCode,
          countryName,
          isdCode: `+${getCountryCallingCode(countryCode as CountryCode)}`,
        },
      ];
    })
    .sort((left, right) => left.countryName.localeCompare(right.countryName));
}
