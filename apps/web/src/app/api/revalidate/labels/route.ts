import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { createPrismicClient, getSharedEnvValue } from "@repo/cms/prismic";
import {
  getLabelCacheTag,
  LABEL_CACHE_TAG,
  resolveLocale,
} from "@/ibe/services/label-service";
import { getPrismicDocuments } from "@/i18n/prismic-document-registry";
import { routing, type AppLocale } from "@/i18n/routing";

type RevalidateRequestBody = {
  locale?: string | string[];
  secret?: string;
  documents?: string[];
  lang?: string;
  langs?: string[];
  languages?: string[];
  type?: string;
  domain?: string;
  apiUrl?: string;
  masterRef?: string;
  release?: unknown;
  releases?: unknown[];
  tags?: string[];
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as RevalidateRequestBody;
  const url = new URL(request.url);
  const secret =
    request.headers.get("x-revalidate-secret") ??
    body.secret ??
    request.headers.get("x-prismic-signature") ??
    url.searchParams.get("secret");
  const expectedSecret =
    getSharedEnvValue("LABEL_REVALIDATE_SECRET") ??
    getSharedEnvValue("PRISMIC_WEBHOOK_SECRET");

  if (!expectedSecret || secret !== expectedSecret) {
    console.warn("[labels-revalidate] unauthorized", {
      hasExpectedSecret: Boolean(expectedSecret),
      hasProvidedSecret: Boolean(secret),
    });

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isWebhookPayload =
    Array.isArray(body.documents) ||
    Boolean(body.type) ||
    Boolean(body.domain) ||
    Boolean(body.apiUrl) ||
    Boolean(body.masterRef) ||
    Array.isArray(body.releases);
  const manualLocales = getLocalesFromManualPayload(body);
  const webhookLocales =
    manualLocales.length > 0
      ? manualLocales
      : await getLocalesFromWebhookPayload(body);
  const locales = webhookLocales;
  const tags = [
    LABEL_CACHE_TAG,
    ...(locales.length > 0
      ? locales.map((locale) => getLabelCacheTag(locale))
      : routing.locales.map((locale) => getLabelCacheTag(locale))),
  ];

  for (const tag of tags) {
    revalidateTag(tag);
  }

  console.log("[labels-revalidate] success", {
    mode: isWebhookPayload ? "prismic-webhook" : "manual",
    locales,
    tags,
    changedDocumentIds: body.documents ?? [],
  });

  return NextResponse.json({
    ok: true,
    revalidated: {
      locales: locales.length > 0 ? locales : "all",
      tags,
    },
  });
}

function getLocalesFromManualPayload(body: RevalidateRequestBody) {
  const localeInput = Array.isArray(body.locale) ? body.locale : [body.locale];

  return Array.from(
    new Set(
      localeInput
        .filter((value): value is string => Boolean(value))
        .map((value) => resolveLocale(value)),
    ),
  );
}

async function getLocalesFromWebhookPayload(
  body: RevalidateRequestBody,
): Promise<AppLocale[]> {
  const payloadLocales = [
    ...(Array.isArray(body.langs) ? body.langs : []),
    ...(Array.isArray(body.languages) ? body.languages : []),
    ...(body.lang ? [body.lang] : []),
  ]
    .map(mapPrismicLocaleToAppLocale)
    .filter((locale): locale is AppLocale => Boolean(locale));

  if (payloadLocales.length > 0) {
    console.log("[labels-revalidate] webhook:payload-locales", {
      payloadLocales,
    });

    return Array.from(new Set(payloadLocales));
  }

  if (!Array.isArray(body.documents) || body.documents.length === 0) {
    console.log("[labels-revalidate] webhook:no-document-ids", {
      fallback: "all-locales",
    });

    return [];
  }

  try {
    const client = createPrismicClient();
    const changedDocuments = (await client.getAllByIDs(body.documents)) as Array<{
      id: string;
      type: string;
      lang: string;
    }>;
    const trackedDocumentTypes = new Set([
      "ibe",
      ...getPrismicDocuments("en").map((document) => document.modelId),
    ]);
    const relevantDocuments = changedDocuments.filter((document) =>
      trackedDocumentTypes.has(document.type),
    );

    console.log("[labels-revalidate] webhook:prismic-documents", {
      requestedDocumentIds: body.documents,
      changedDocuments: changedDocuments.map((document) => ({
        id: document.id,
        type: document.type,
        lang: document.lang,
      })),
      relevantDocuments: relevantDocuments.map((document) => ({
        id: document.id,
        type: document.type,
        lang: document.lang,
      })),
    });

    if (relevantDocuments.length === 0) {
      console.log("[labels-revalidate] webhook:no-relevant-label-documents", {
        fallback: "all-locales",
      });

      return [];
    }

    return Array.from(
      new Set(
        relevantDocuments
          .map((document) => mapPrismicLocaleToAppLocale(document.lang))
          .filter((locale): locale is AppLocale => Boolean(locale)),
      ),
    );
  } catch (error) {
    console.warn("[labels-revalidate] webhook:document-resolution-failed", {
      message: error instanceof Error ? error.message : String(error),
      fallback: "all-locales",
    });

    return [];
  }
}

function mapPrismicLocaleToAppLocale(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const normalizedValue = value.toLowerCase();

  if (normalizedValue.startsWith("en")) {
    return "en" satisfies AppLocale;
  }

  if (normalizedValue.startsWith("ja")) {
    return "ja" satisfies AppLocale;
  }

  return undefined;
}
