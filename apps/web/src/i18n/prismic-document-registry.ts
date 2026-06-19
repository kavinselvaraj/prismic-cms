import { getLocaleMessages } from "./messages";
import type { AppLocale } from "./routing";

export type PrismicLabelDocument = {
  modelId: string;
  modelType: "page" | "custom";
  content: Record<string, unknown>;
  page?: string;
  uid?: string;
};

export function getFlightSearchDocument(locale: AppLocale = "en") {
  const messages = getLocaleMessages(locale);

  return {
    modelId: "flight_search",
    modelType: "custom",
    content: {
      flight_search: messages.flight_search,
    },
  } satisfies PrismicLabelDocument;
}

export function getFlightSelectDocument(locale: AppLocale = "en") {
  const messages = getLocaleMessages(locale);

  return {
    modelId: "flight_select",
    modelType: "custom",
    content: {
      flight_select: messages.flight_select,
    },
  } satisfies PrismicLabelDocument;
}

export function getPassengerDocument(locale: AppLocale = "en") {
  const messages = getLocaleMessages(locale);

  return {
    modelId: "passenger",
    modelType: "custom",
    content: {
      passenger: messages.passenger,
    },
  } satisfies PrismicLabelDocument;
}

export function getPrismicDocuments(locale: AppLocale = "en") {
  return [
    getFlightSearchDocument(locale),
    getFlightSelectDocument(locale),
    getPassengerDocument(locale),
  ] satisfies PrismicLabelDocument[];
}
