import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import * as prismic from "@prismicio/client";
import localEn from "../../messages/en.json";
import localJa from "../../messages/ja.json";
import type { FlightMessages } from "./messages";
import { routing, type AppLocale } from "./routing";

type LabelSource = "local" | "prismic";

const localMessages: Record<AppLocale, FlightMessages> = {
  en: localEn,
  ja: localJa,
};

const prismicLocaleMap: Record<AppLocale, string> = {
  en: "en-us",
  ja: "ja-jp",
};
let cachedEnvOverrides: Record<string, string> | undefined;

export async function loadMessages(locale: AppLocale) {
  const source = getServerLabelSource();
  console.log("[i18n] loadMessages:start", {
    locale,
    source,
  });

  if (source === "prismic") {
    return loadPrismicMessages(locale);
  }

  console.log("[i18n] loadMessages:local", {
    locale,
    messages: localMessages[locale],
  });
  return localMessages[locale];
}

function getLabelSource(): LabelSource {
  return getServerLabelSource();
}

export function getServerLabelSource(): LabelSource {
  return getEnvValue("LABEL_SOURCE") === "prismic" ? "prismic" : "local";
}

async function loadPrismicMessages(locale: AppLocale): Promise<FlightMessages> {
  const repositoryName = getEnvValue("PRISMIC_REPOSITORY_NAME") ?? "";

  if (!repositoryName) {
    throw new Error("PRISMIC_REPOSITORY_NAME is required when LABEL_SOURCE=prismic");
  }

  const client = prismic.createClient(repositoryName, {
    accessToken: getEnvValue("PRISMIC_ACCESS_TOKEN"),
  });
  const lang = prismicLocaleMap[locale] ?? prismicLocaleMap.en;
  console.log("[labels-api] PRISMIC API HIT", {
    locale,
    lang,
    repositoryName,
  });
  const [flightSearch, flightSelect] = await Promise.all([
    client.getSingle("flight_search", { lang }),
    client.getSingle("flight_select", { lang }),
  ]);

  console.log("[i18n] loadMessages:prismic:raw", {
    locale,
    lang,
    flightSearchId: flightSearch.id,
    flightSearchLang: flightSearch.lang,
    flightSearchData: flightSearch.data,
    flightSelectId: flightSelect.id,
    flightSelectLang: flightSelect.lang,
    flightSelectData: flightSelect.data,
  });

  const messages = {
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

  console.log("[i18n] loadMessages:prismic:mapped", {
    locale,
    messages,
  });

  return messages;
}

export function resolveLocale(locale: string | undefined): AppLocale {
  return routing.locales.includes(locale as AppLocale)
    ? (locale as AppLocale)
    : routing.defaultLocale;
}

function getEnvValue(key: string) {
  return process.env[key] ?? getEnvOverrides()[key];
}

function getEnvOverrides() {
  if (cachedEnvOverrides) {
    return cachedEnvOverrides;
  }

  const cwd = process.cwd();
  const envFilePaths = [
    path.resolve(cwd, ".env.local"),
    path.resolve(cwd, ".env"),
    path.resolve(cwd, "../../.env.local"),
    path.resolve(cwd, "../../.env"),
  ];
  const overrides: Record<string, string> = {};

  for (const envFilePath of envFilePaths) {
    if (!existsSync(envFilePath)) {
      continue;
    }

    for (const line of readFileSync(envFilePath, "utf8").split(/\r?\n/)) {
      const trimmedLine = line.trim();

      if (!trimmedLine || trimmedLine.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmedLine.indexOf("=");

      if (separatorIndex === -1) {
        continue;
      }

      const name = trimmedLine.slice(0, separatorIndex).trim();
      const value = trimmedLine.slice(separatorIndex + 1).trim();

      if (!name || overrides[name]) {
        continue;
      }

      overrides[name] = value.replace(/^["']|["']$/g, "");
    }
  }

  cachedEnvOverrides = overrides;

  console.log("[i18n] env:fallback", {
    cwd,
    labelSource: overrides.LABEL_SOURCE,
    hasPrismicRepository: Boolean(overrides.PRISMIC_REPOSITORY_NAME),
    hasPrismicAccessToken: Boolean(overrides.PRISMIC_ACCESS_TOKEN),
  });

  return overrides;
}
