import type { Metadata } from "next";
import { LocalizedLabels } from "@/components/localized-labels";
import type { AppLocale } from "@/i18n/routing";

type PageProps = {
  params: Promise<{
    locale: AppLocale;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const landingTitle = "Flight Booking | Search and Compare Flights";
  const landingDescription =
    "Search flights, compare options, and start your booking journey with our itinerary booking experience.";

  return {
    title: landingTitle,
    description: landingDescription,
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        ja: "/ja",
      },
    },
    openGraph: {
      title: landingTitle,
      description: landingDescription,
      url: `/${locale}`,
      siteName: "IBE Web",
      locale: locale === "ja" ? "ja_JP" : "en_US",
      alternateLocale: locale === "ja" ? ["en_US"] : ["ja_JP"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: landingTitle,
      description: landingDescription,
    },
  };
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;

  return <LocalizedLabels locale={locale} page="landing" />;
}
