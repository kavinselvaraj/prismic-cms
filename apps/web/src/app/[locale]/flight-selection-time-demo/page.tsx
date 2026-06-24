import type { Metadata } from "next";
import { FlightTimeOffsetDemo } from "@/components/flight-time-offset-demo";
import type { AppLocale } from "@/i18n/routing";

type PageProps = {
  params: Promise<{
    locale: AppLocale;
  }>;
};

export const metadata: Metadata = {
  title: "Flight departure-time rule demo",
  description: "48-hour flight selection eligibility demonstration",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function FlightSelectionTimeDemoPage({
  params,
}: PageProps) {
  const { locale } = await params;

  return <FlightTimeOffsetDemo locale={locale} />;
}
