import { getPrismicDocuments } from "../prismic/document-registry";
import { createPrismicClient } from "../prismic/create-client";
import { getRepositoryName } from "../prismic/repository";
import { getSharedEnvValue } from "../prismic/config";

export type LabelSource = "local" | "prismic" | "backend";

type PrismicDocumentData = Record<string, unknown>;

type PrismicDocumentMap = Record<
  string,
  {
    data: PrismicDocumentData;
  }
>;

type PrismicParentDocument = {
  id: string;
  lang: string;
  data: Record<string, unknown>;
};

type PrismicChildDocument = {
  id: string;
  type: string;
  lang: string;
  data: Record<string, unknown>;
};

export type CreateLabelServiceOptions<TMessages extends Record<string, unknown>> = {
  applicationName: string;
  defaultLocale: string;
  locales: readonly string[];
  localMessages: Record<string, TMessages>;
  labelContract: TMessages;
  parentDocumentType: string;
  prismicLocaleMap: Record<string, string>;
};

/**
 * Creates an app-specific label service without coupling CMS runtime code to an app.
 */
export function createLabelService<TMessages extends Record<string, unknown>>(
  options: CreateLabelServiceOptions<TMessages>,
) {
  const resolveLocale = (locale: string | undefined) =>
    options.locales.includes(locale ?? "")
      ? (locale as keyof typeof options.localMessages & string)
      : options.defaultLocale;

  async function getLabels(locale: string): Promise<TMessages> {
    const resolvedLocale = resolveLocale(locale);
    const source = getServerLabelSource();

    console.log("[cms-label-service] load:start", {
      application: options.applicationName,
      locale: resolvedLocale,
      source,
    });

    if (source === "prismic") {
      return loadFromPrismic(resolvedLocale);
    }

    if (source === "backend") {
      return loadFromBackend(resolvedLocale);
    }

    return getLocalMessages(resolvedLocale);
  }

  async function loadFromPrismic(locale: string): Promise<TMessages> {
    try {
      return await fetchPrismicLabels(locale);
    } catch (error) {
      console.warn("[cms-label-service] prismic:failed; local fallback", {
        application: options.applicationName,
        locale,
        message: getErrorMessage(error),
      });

      return getLocalMessages(locale);
    }
  }

  async function fetchPrismicLabels(locale: string): Promise<TMessages> {
    const lang = options.prismicLocaleMap[locale] ?? locale;
    const repositoryName = getRepositoryName();
    const client = createPrismicClient();
    const expectedDocumentTypes = getExpectedDocumentTypes(locale);

    console.log("[cms-label-service] prismic:request", {
      application: options.applicationName,
      locale,
      lang,
      repositoryName,
      parentDocumentType: options.parentDocumentType,
      expectedDocumentTypes,
    });

    // Parent type is selected from app runtime configuration, not a static SDK union.
    const parentDocument = (await client.getSingle(options.parentDocumentType as never, {
      lang,
    })) as PrismicParentDocument;
    const childIds = expectedDocumentTypes
      .map((documentType) => findChildDocumentId(parentDocument.data, documentType))
      .filter(Boolean) as string[];

    if (childIds.length !== expectedDocumentTypes.length) {
      throw new Error(
        `Prismic parent "${options.parentDocumentType}" is missing child links for: ${expectedDocumentTypes.join(", ")}`,
      );
    }

    const childDocuments = (await client.getAllByIDs(childIds, {
      lang,
    })) as PrismicChildDocument[];
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

    return resolvePrismicLabels(options.labelContract, childDocumentMap);
  }

  async function loadFromBackend(locale: string): Promise<TMessages> {
    try {
      return await fetchBackendLabels(locale);
    } catch (error) {
      console.warn("[cms-label-service] backend:failed; local fallback", {
        application: options.applicationName,
        locale,
        message: getErrorMessage(error),
      });

      return getLocalMessages(locale);
    }
  }

  async function fetchBackendLabels(locale: string): Promise<TMessages> {
    const backendBaseUrl =
      getSharedEnvValue("PRISMIC_JAVA_API_BASE_URL") ?? "http://localhost:4002";
    const backendUrl = `${backendBaseUrl.replace(/\/$/, "")}/api/prismic/labels/${locale}`;

    console.log("[cms-label-service] backend:request", {
      application: options.applicationName,
      locale,
      backendUrl,
    });

    const response = await fetch(backendUrl, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `Backend labels request failed with status ${response.status}`,
      );
    }

    const payload = (await response.json()) as {
      documents?: Record<string, { data?: PrismicDocumentData }>;
    };
    const childDocumentMap = Object.fromEntries(
      Object.entries(payload.documents ?? {})
        .filter(([documentType]) => documentType !== options.parentDocumentType)
        .map(([documentType, document]) => [
          documentType,
          { data: document.data ?? {} },
        ]),
    );
    const expectedDocumentTypes = getExpectedDocumentTypes(locale);
    const missingDocumentTypes = expectedDocumentTypes.filter(
      (documentType) => !childDocumentMap[documentType],
    );

    if (missingDocumentTypes.length > 0) {
      throw new Error(
        `Backend response is missing label documents for: ${missingDocumentTypes.join(", ")}`,
      );
    }

    return resolvePrismicLabels(options.labelContract, childDocumentMap);
  }

  function getExpectedDocumentTypes(locale: string) {
    return getPrismicDocuments(getLocalMessages(locale)).map(
      (document) => document.modelId,
    );
  }

  function getLocalMessages(locale: string): TMessages {
    return options.localMessages[resolveLocale(locale)] ??
      options.localMessages[options.defaultLocale] ??
      (() => {
        throw new Error(
          `Missing local labels for ${options.applicationName}:${locale}`,
        );
      })();
  }

  return {
    getLabels,
    resolveLocale,
  };
}

/**
 * Resolves the configured server-side label source.
 */
export function getServerLabelSource(): LabelSource {
  const source = getSharedEnvValue("LABEL_SOURCE");

  return source === "prismic" || source === "backend" ? source : "local";
}

/**
 * Maps flat Prismic field data back to the application's nested label contract.
 */
export function resolvePrismicLabels<T extends Record<string, unknown>>(
  template: T,
  documents: PrismicDocumentMap,
): T {
  return mapObject(template, documents) as T;
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

function isPrismicDocumentLink(
  value: unknown,
): value is { id: string; type?: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof (value as { id?: unknown }).id === "string"
  );
}

function mapObject(
  value: unknown,
  documents: PrismicDocumentMap,
  rootKey?: string,
  pathParts: string[] = [],
): unknown {
  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    if (!rootKey) {
      return value;
    }

    const fieldId = [rootKey, rootKey, ...pathParts].join("_");
    const groupValue = documents[rootKey]?.data[fieldId];

    if (!Array.isArray(groupValue)) {
      return value;
    }

    const templateItem = value[0];

    if (!isRecord(templateItem)) {
      return groupValue;
    }

    return groupValue.map((item) => mapGroupItem(templateItem, item));
  }

  if (typeof value !== "object") {
    if (!rootKey) {
      return value;
    }

    const fieldId = [rootKey, rootKey, ...pathParts].join("_");
    return String(documents[rootKey]?.data[fieldId] ?? "");
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, nestedValue]) => {
      const nextRootKey = rootKey ?? key;
      const nextPathParts = rootKey ? [...pathParts, key] : [];

      return [key, mapObject(nestedValue, documents, nextRootKey, nextPathParts)];
    }),
  );
}

function mapGroupItem(template: Record<string, unknown>, value: unknown): unknown {
  const item = isRecord(value) ? value : {};

  return Object.fromEntries(
    Object.entries(template).map(([key, nestedTemplate]) => [
      key,
      isRecord(nestedTemplate)
        ? mapGroupItem(nestedTemplate, item[key])
        : item[key] ?? "",
    ]),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
