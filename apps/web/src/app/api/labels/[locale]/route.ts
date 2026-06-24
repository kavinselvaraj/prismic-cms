import { NextResponse } from "next/server";
import {
  getIbeLabels,
  getServerLabelSource,
  resolveLocale,
} from "@/i18n/label-service-config";
import { createLabelVersion } from "@/i18n/label-version";

type RouteContext = {
  params: Promise<{
    locale: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { locale } = await context.params;
  const resolvedLocale = resolveLocale(locale);
  const source = getServerLabelSource();

  console.log("[labels-api] request", {
    locale,
    resolvedLocale,
    source,
  });

  const messages = await getIbeLabels(resolvedLocale);
  const version = createLabelVersion(messages);

  return NextResponse.json({
    locale: resolvedLocale,
    messages,
    source,
    version,
  });
}
