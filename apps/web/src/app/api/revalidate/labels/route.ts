import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { getSharedEnvValue } from "@repo/cms/prismic";
import {
  getLabelCacheTag,
  LABEL_CACHE_TAG,
  resolveLocale,
} from "@/ibe/services/label-service";
import type { AppLocale } from "@/i18n/routing";

type RevalidateRequestBody = {
  locale?: string | string[];
  secret?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as RevalidateRequestBody;
  const secret =
    request.headers.get("x-revalidate-secret") ??
    body.secret ??
    request.headers.get("x-prismic-signature");
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

  const localeInput = Array.isArray(body.locale) ? body.locale : [body.locale];
  const locales = Array.from(
    new Set(
      localeInput
        .filter((value): value is string => Boolean(value))
        .map((value) => resolveLocale(value)),
    ),
  );
  const tags = [
    LABEL_CACHE_TAG,
    ...(locales.length > 0
      ? locales.map((locale) => getLabelCacheTag(locale))
      : (["en", "ja"] as AppLocale[]).map((locale) => getLabelCacheTag(locale))),
  ];

  for (const tag of tags) {
    revalidateTag(tag);
  }

  console.log("[labels-revalidate] success", {
    locales,
    tags,
  });

  return NextResponse.json({
    ok: true,
    revalidated: {
      locales: locales.length > 0 ? locales : "all",
      tags,
    },
  });
}
