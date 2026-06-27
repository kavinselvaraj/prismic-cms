import type { Metadata } from "next";
import { FlightSearchForm } from "@/features/booking/components/flight-search-form";
import type { AppLocale } from "@/i18n/routing";

type PageProps = {
  params: Promise<{
    locale: AppLocale;
  }>;
};

export async function generateMetadata({
  params: _params,
}: PageProps): Promise<Metadata> {
  return {
    title: "Flight Search",
    description: "Flight search page",
    robots: {
      follow: true,
      index: false,
    },
  };
}

export default async function FlightSearchPage({ params }: PageProps) {
  const { locale } = await params;

  return <FlightSearchForm locale={locale} />;
}
