import type { Metadata } from "next";
import { FlightSelectionView } from "@/features/booking/components/flight-selection-view";
import type { AppLocale } from "@/i18n/routing";

type PageProps = {
  params: Promise<{
    locale: AppLocale;
  }>;
};

export const metadata: Metadata = {
  title: "Flight Selection",
};

export default async function FlightSelectionPage({ params }: PageProps) {
  const { locale } = await params;

  return <FlightSelectionView locale={locale} />;
}
