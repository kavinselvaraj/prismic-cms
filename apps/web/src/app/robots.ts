import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const locales = ["en", "ja"] as const;
const disallowedPaths = [
  "flight-search",
  "flight-select",
  "passenger",
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    host: siteUrl,
    sitemap: `${siteUrl}/sitemap.xml`,
    rules: [
      {
        userAgent: "*",
        allow: ["/", ...locales.map((locale) => `/${locale}`)],
        disallow: locales.flatMap((locale) =>
          disallowedPaths.map((path) => `/${locale}/${path}`),
        ),
      },
    ],
  };
}
