export const routing = {
  locales: ["en", "ja"] as const,
  defaultLocale: "en" as const,
};

export type AppLocale = (typeof routing.locales)[number];
