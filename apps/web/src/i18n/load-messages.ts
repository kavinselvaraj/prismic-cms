import * as prismic from "@prismicio/client";
import localEn from "../../messages/en.json";
import localJa from "../../messages/ja.json";
import { routing, type AppLocale } from "./routing";

type FlightMessages = typeof localEn;
type LabelSource = "local" | "prismic";

const localMessages: Record<AppLocale, FlightMessages> = {
  en: localEn,
  ja: localJa,
};

const prismicLocaleMap: Record<AppLocale, string> = {
  en: "en-us",
  ja: "ja-jp",
};

export async function loadMessages(locale: AppLocale) {
  const source = getLabelSource();

  if (source === "prismic") {
    return loadPrismicMessages(locale);
  }

  return localMessages[locale];
}

function getLabelSource(): LabelSource {
  return process.env.LABEL_SOURCE === "prismic" ? "prismic" : "local";
}

async function loadPrismicMessages(locale: AppLocale): Promise<FlightMessages> {
  const repositoryName = process.env.PRISMIC_REPOSITORY_NAME ?? "";

  if (!repositoryName) {
    throw new Error("PRISMIC_REPOSITORY_NAME is required when LABEL_SOURCE=prismic");
  }

  const client = prismic.createClient(repositoryName, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
  });
  const lang = prismicLocaleMap[locale] ?? prismicLocaleMap.en;
  const [flightSearch, flightSelect] = await Promise.all([
    client.getSingle("flight_search", { lang }),
    client.getSingle("flight_select", { lang }),
  ]);

  return {
    flight_search: {
      airport: {
        label: String(flightSearch.data.flight_search_airport_label ?? ""),
        name: String(flightSearch.data.flight_search_airport_name ?? ""),
      },
      ptc: String(flightSearch.data.flight_search_ptc ?? ""),
    },
    flight_select: {
      from_date: String(flightSelect.data.flight_select_from_date ?? ""),
      to_date: String(flightSelect.data.flight_select_to_date ?? ""),
    },
  };
}

export function resolveLocale(locale: string | undefined): AppLocale {
  return routing.locales.includes(locale as AppLocale)
    ? (locale as AppLocale)
    : routing.defaultLocale;
}
