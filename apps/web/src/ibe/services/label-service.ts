import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import * as prismic from "@prismicio/client";
import localEn from "../../../messages/en.json";
import localJa from "../../../messages/ja.json";
import {
  mapIbeLabels,
  type IbeLabelMapperInput,
} from "../mappers/label.mapper";
import type { IbeLabels } from "../types/label.types";
import { routing, type AppLocale } from "@/i18n/routing";

export type LabelSource = "local" | "prismic";

const localMessages: Record<AppLocale, IbeLabels> = {
  en: localEn,
  ja: localJa,
};

const prismicLocaleMap: Record<AppLocale, string> = {
  en: "en-us",
  ja: "ja-jp",
};

let cachedEnvOverrides: Record<string, string> | undefined;

export async function getIbeLabels(locale: AppLocale): Promise<IbeLabels> {
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
  return getEnvValue("LABEL_SOURCE") === "prismic" ? "prismic" : "local";
}

export function resolveLocale(locale: string | undefined): AppLocale {
  return routing.locales.includes(locale as AppLocale)
    ? (locale as AppLocale)
    : routing.defaultLocale;
}

async function getIbeLabelsFromPrismic(locale: AppLocale): Promise<IbeLabels> {
  const repositoryName = getEnvValue("PRISMIC_REPOSITORY_NAME") ?? "";

  if (!repositoryName) {
    throw new Error("PRISMIC_REPOSITORY_NAME is required when LABEL_SOURCE=prismic");
  }

  const lang = prismicLocaleMap[locale] ?? prismicLocaleMap.en;
  const client = prismic.createClient(repositoryName, {
    accessToken: getEnvValue("PRISMIC_ACCESS_TOKEN"),
  });

  console.log("[label-service] PRISMIC API HIT", {
    locale,
    lang,
    repositoryName,
  });

  // Today the IBE container orchestrates child documents through the service.
  // When a parent `ibe` custom type is added in Prismic, resolve child references here.
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

  const labels = mapIbeLabels({
    flightSearch,
    flightSelect,
  } as unknown as IbeLabelMapperInput);

  console.log("[label-service] MAPPED LABELS", {
    locale,
    labels,
  });

  return labels;
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

  console.log("[label-service] env:fallback", {
    cwd,
    labelSource: overrides.LABEL_SOURCE,
    hasPrismicRepository: Boolean(overrides.PRISMIC_REPOSITORY_NAME),
    hasPrismicAccessToken: Boolean(overrides.PRISMIC_ACCESS_TOKEN),
  });

  return overrides;
}
