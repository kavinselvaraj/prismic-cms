declare module "i18n-iso-countries";

declare module "i18n-iso-countries/langs/en.json" {
  const value: Record<string, unknown>;
  export default value;
}

declare module "i18n-iso-countries/langs/ja.json" {
  const value: Record<string, unknown>;
  export default value;
}

declare module "libphonenumber-js/min" {
  export function getCountries(): string[];
  export function getCountryCallingCode(countryCode: string): string;
}

declare module "libphonenumber-js" {
  export type CountryCode = string;
}
