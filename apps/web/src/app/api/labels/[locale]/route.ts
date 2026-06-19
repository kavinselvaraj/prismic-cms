import { NextResponse } from "next/server";
import { loadMessages, resolveLocale, getServerLabelSource } from "@/i18n/load-messages";

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

  const messages = await loadMessages(resolvedLocale);

  return NextResponse.json({
    locale: resolvedLocale,
    messages,
    source,
  });
}
