import localEn from "../../../messages/en.json";
import localJa from "../../../messages/ja.json";
import {
  createPrismicClient,
  getRepositoryName,
  getSharedEnvValue,
} from "@repo/cms/prismic";
import type { FlightMessages } from "@/i18n/messages";
import { routing, type AppLocale } from "@/i18n/routing";
import { resolvePrismicLabels } from "../utils/resolve-prismic-labels";

export type LabelSource = "local" | "prismic";

const localMessages: Record<AppLocale, FlightMessages> = {
  en: localEn,
  ja: localJa,
};

const prismicLocaleMap: Record<AppLocale, string> = {
  en: "en-us",
  ja: "ja-jp",
};

export async function getIbeLabels(locale: AppLocale): Promise<FlightMessages> {
  const source = getServerLabelSource();

  console.log("[label-service] load:start", {
    locale,
    source,
  });

  if (source === "prismic") {
    return getIbeLabelsFromPrismic(locale);
  }

  console.log("[label-service] LOCAL LABELS HIT", {
    locale,
    messages: localMessages[locale],
  });

  return localMessages[locale];
}

export function getServerLabelSource(): LabelSource {
  return getSharedEnvValue("LABEL_SOURCE") === "prismic" ? "prismic" : "local";
}

export function resolveLocale(locale: string | undefined): AppLocale {
  return routing.locales.includes(locale as AppLocale)
    ? (locale as AppLocale)
    : routing.defaultLocale;
}

async function getIbeLabelsFromPrismic(
  locale: AppLocale,
): Promise<FlightMessages> {
  const lang = prismicLocaleMap[locale] ?? prismicLocaleMap.en;
  const repositoryName = getRepositoryName();
  const client = createPrismicClient();

  console.log("[label-service] PRISMIC API HIT", {
    locale,
    lang,
    repositoryName,
  });

  // Today the IBE service orchestrates child documents.
  // When a parent `ibe` custom type is added in Prismic, fetch that parent here
  // and resolve the child document list before calling the generic resolver.
  const [flightSearch, flightSelect] = await Promise.all([
    client.getSingle("flight_search", { lang }),
    client.getSingle("flight_select", { lang }),
  ]);

  console.log("[label-service] PRISMIC RAW RESPONSE", {
    locale,
    flightSearchId: flightSearch.id,
    flightSearchLang: flightSearch.lang,
    flightSearchData: flightSearch.data,
    flightSelectId: flightSelect.id,
    flightSelectLang: flightSelect.lang,
    flightSelectData: flightSelect.data,
  });

  const labels = resolvePrismicLabels(localEn, {
    flight_search: flightSearch as { data: Record<string, unknown> },
    flight_select: flightSelect as { data: Record<string, unknown> },
  });

  console.log("[label-service] MAPPED LABELS", {
    locale,
    labels,
  });

  return labels;
}
