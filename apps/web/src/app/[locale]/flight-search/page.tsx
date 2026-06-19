import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
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
  const t = await getTranslations({ locale });

  return {
    title: "Flight Search",
    description: t("flight_search.airport.label"),
  };
}

export default async function FlightSearchPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return (
    <main style={{ padding: "32px" }}>
      <h1>Flight Search</h1>
      <p>
        <strong>Airport Label:</strong> {t("flight_search.airport.label")}
      </p>
      <p>
        <strong>Airport Name:</strong> {t("flight_search.airport.name")}
      </p>
      <p>
        <strong>PTC:</strong> {t("flight_search.ptc")}
      </p>
    </main>
  );
}
