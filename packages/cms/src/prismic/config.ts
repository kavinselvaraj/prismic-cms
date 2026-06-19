import type { AppLocale, PageName } from "./types";

export const prismicConfig = {
  repositoryName: process.env.PRISMIC_REPOSITORY_NAME ?? "",
  accessToken: process.env.PRISMIC_ACCESS_TOKEN,
  defaultLocale: "en",
  routes: [
    {
      type: "home_page",
      path: "/:lang?",
    },
    {
      type: "about_page",
      path: "/:lang?/about",
    },
  ],
} as const;

export const pageModelMap: Record<
  PageName,
  { modelId: "home_page" | "about_page"; uid: string }
> = {
  home: {
    modelId: "home_page",
    uid: "home",
  },
  about: {
    modelId: "about_page",
    uid: "about",
  },
};

export const prismicLocaleMap: Record<AppLocale, string> = {
  en: "en-us",
  ja: "ja-jp",
};

export function toPrismicLocale(locale: AppLocale) {
  return prismicLocaleMap[locale] ?? locale;
}
