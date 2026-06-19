import localeEn from "../../messages/en.json";
import localJa from "../../messages/ja.json";
import type { AppLocale } from "./routing";

export function getLocaleMessages(locale: AppLocale) {
  switch (locale) {
    case "ja":
      return localJa;
    case "en":
    default:
      return localeEn;
  }
}

export function getFlightSearchDocument(locale: AppLocale = "en") {
  const messages = getLocaleMessages(locale);

  return {
    modelId: "flight_search",
    modelType: "custom",
    flight_search: messages.flight_search,
  } as const;
}

export function getFlightSelectDocument(locale: AppLocale = "en") {
  const messages = getLocaleMessages(locale);

  return {
    modelId: "flight_select",
    modelType: "custom",
    flight_select: messages.flight_select,
  } as const;
}
