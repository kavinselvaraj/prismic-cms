import {
  createPrismicClient,
  getRepositoryName,
  getSharedEnvValue,
} from "@repo/cms/prismic";
import { unstable_cache } from "next/cache";
import {
  labelMessagesContract,
  localMessages,
  type FlightMessages,
} from "@/i18n/messages";
import { getPrismicDocuments } from "@/i18n/prismic-document-registry";
import { routing, type AppLocale } from "@/i18n/routing";
import { resolvePrismicLabels } from "../utils/resolve-prismic-labels";

export type LabelSource = "local" | "prismic" | "backend";

const prismicLocaleMap: Record<AppLocale, string> = {
  en: "en-us",
  ja: "ja-jp",
};

const LABEL_CACHE_REVALIDATE_SECONDS = 60 * 15;
export const LABEL_CACHE_TAG = "ibe-labels";
const cachedPrismicLabelLoaders = new Map<
  AppLocale,
  () => Promise<FlightMessages>
>();
const cachedBackendLabelLoaders = new Map<
  AppLocale,
  () => Promise<FlightMessages>
>();

export async function getIbeLabels(locale: AppLocale): Promise<FlightMessages> {
  const source = getServerLabelSource();

  console.log("[label-service] load:start", {
    locale,
    source,
  });

  if (source === "prismic") {
    return getIbeLabelsFromPrismic(locale);
  }

  if (source === "backend") {
    return getIbeLabelsFromBackend(locale);
  }

  console.log("[label-service] LOCAL LABELS HIT", {
    locale,
    messages: localMessages[locale],
  });

  return localMessages[locale];
}

export function getServerLabelSource(): LabelSource {
  const source = getSharedEnvValue("LABEL_SOURCE");

  if (source === "prismic" || source === "backend") {
    return source;
  }

  return "local";
}

export function resolveLocale(locale: string | undefined): AppLocale {
  return routing.locales.includes(locale as AppLocale)
    ? (locale as AppLocale)
    : routing.defaultLocale;
}

async function getIbeLabelsFromPrismic(
  locale: AppLocale,
): Promise<FlightMessages> {
  try {
    return await getCachedPrismicLabels(locale)();
  } catch (error) {
    console.warn("[label-service] PRISMIC LABEL LOAD FAILED, falling back to local", {
      locale,
      message: error instanceof Error ? error.message : String(error),
    });

    return localMessages[locale];
  }
}

async function fetchPrismicLabels(locale: AppLocale): Promise<FlightMessages> {
  const lang = prismicLocaleMap[locale] ?? prismicLocaleMap.en;
  const repositoryName = getRepositoryName();
  const client = createPrismicClient();
  const expectedDocumentTypes = getPrismicDocuments(locale).map(
    (document) => document.modelId,
  );

  console.log("[label-service] PRISMIC API HIT", {
    locale,
    lang,
    repositoryName,
    expectedDocumentTypes,
  });

  const ibeDocument = (await client.getSingle("ibe", {
    lang,
  })) as {
    id: string;
    lang: string;
    data: Record<string, unknown>;
  };

  console.log("[label-service] IBE PARENT RESPONSE", {
    locale,
    ibeId: ibeDocument.id,
    ibeLang: ibeDocument.lang,
  });

  const childIds = expectedDocumentTypes
    .map((documentType) => findChildDocumentId(ibeDocument.data, documentType))
    .filter(Boolean) as string[];

  if (childIds.length !== expectedDocumentTypes.length) {
    throw new Error(
      `IBE parent is missing child document links for: ${expectedDocumentTypes.join(", ")}`,
    );
  }

  const childDocuments = (await client.getAllByIDs(childIds, {
    lang,
  })) as Array<{
    id: string;
    type: string;
    lang: string;
    data: Record<string, unknown>;
  }>;
  const childDocumentMap = Object.fromEntries(
    childDocuments.map((document) => [document.type, document]),
  );

  const missingDocumentTypes = expectedDocumentTypes.filter(
    (documentType) => !childDocumentMap[documentType],
  );

  if (missingDocumentTypes.length > 0) {
    throw new Error(
      `Prismic child documents not resolved for: ${missingDocumentTypes.join(", ")}`,
    );
  }

  console.log("[label-service] IBE CHILD DOCS RESOLVED", {
    locale,
    childTypes: childDocuments.map((document) => document.type),
    requestCount: 2,
  });

  const labels = resolvePrismicLabels(
    labelMessagesContract,
    childDocumentMap as Record<string, { data: Record<string, unknown> }>,
  );

  console.log("[label-service] MAPPED LABELS", {
    locale,
    labels,
  });

  return labels;
}

async function getIbeLabelsFromBackend(
  locale: AppLocale,
): Promise<FlightMessages> {
  try {
    return await getCachedBackendLabels(locale)();
  } catch (error) {
    console.warn("[label-service] BACKEND LABEL LOAD FAILED, falling back to local", {
      locale,
      message: error instanceof Error ? error.message : String(error),
    });

    return localMessages[locale];
  }
}

async function fetchBackendLabels(locale: AppLocale): Promise<FlightMessages> {
  const backendBaseUrl =
    getSharedEnvValue("PRISMIC_JAVA_API_BASE_URL") ?? "http://localhost:4002";
  const backendUrl = `${backendBaseUrl.replace(/\/$/, "")}/api/prismic/labels/${locale}`;

  console.log("[label-service] BACKEND API HIT", {
    locale,
    backendUrl,
  });

  const response = await fetch(backendUrl, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Backend labels request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as {
    locale: string;
    prismicLocale: string;
    documents?: Record<
      string,
      {
        data?: Record<string, unknown>;
      }
    >;
  };
  const childDocumentMap = Object.fromEntries(
    Object.entries(payload.documents ?? {})
      .filter(([documentType]) => documentType !== "ibe")
      .map(([documentType, document]) => [documentType, { data: document.data ?? {} }]),
  );
  const expectedDocumentTypes = getPrismicDocuments(locale).map(
    (document) => document.modelId,
  );
  const missingDocumentTypes = expectedDocumentTypes.filter(
    (documentType) => !childDocumentMap[documentType],
  );

  if (missingDocumentTypes.length > 0) {
    throw new Error(
      `Backend response is missing label documents for: ${missingDocumentTypes.join(", ")}`,
    );
  }

  const labels = resolvePrismicLabels(
    labelMessagesContract,
    childDocumentMap as Record<string, { data: Record<string, unknown> }>,
  );

  console.log("[label-service] BACKEND LABELS MAPPED", {
    locale,
    documentTypes: Object.keys(childDocumentMap),
  });

  return labels;
}

export function getLabelCacheTag(locale: AppLocale) {
  return `${LABEL_CACHE_TAG}:${locale}`;
}

function getCachedPrismicLabels(locale: AppLocale) {
  const cachedLoader = cachedPrismicLabelLoaders.get(locale);

  if (cachedLoader) {
    return cachedLoader;
  }

  const loader = unstable_cache(
    async () => fetchPrismicLabels(locale),
    [LABEL_CACHE_TAG, locale],
    {
      revalidate: LABEL_CACHE_REVALIDATE_SECONDS,
      tags: [LABEL_CACHE_TAG, getLabelCacheTag(locale)],
    },
  );

  cachedPrismicLabelLoaders.set(locale, loader);

  return loader;
}

function getCachedBackendLabels(locale: AppLocale) {
  const cachedLoader = cachedBackendLabelLoaders.get(locale);

  if (cachedLoader) {
    return cachedLoader;
  }

  const loader = unstable_cache(
    async () => fetchBackendLabels(locale),
    [`${LABEL_CACHE_TAG}:backend`, locale],
    {
      revalidate: LABEL_CACHE_REVALIDATE_SECONDS,
      tags: [LABEL_CACHE_TAG, getLabelCacheTag(locale)],
    },
  );

  cachedBackendLabelLoaders.set(locale, loader);

  return loader;
}

function isPrismicDocumentLink(
  value: unknown,
): value is { id: string; type?: string; uid?: string | null } {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof (value as { id?: unknown }).id === "string"
  );
}

function findChildDocumentId(
  data: Record<string, unknown>,
  documentType: string,
) {
  for (const value of Object.values(data)) {
    if (isPrismicDocumentLink(value) && value.type === documentType) {
      return value.id;
    }
  }

  return undefined;
}
