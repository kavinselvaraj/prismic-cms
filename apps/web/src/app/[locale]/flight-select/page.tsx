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
    title: "Flight Selection",
    description: t("flight_select.from_date"),
  };
}

export default async function FlightSelectPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return (
    <main style={{ padding: "32px" }}>
      <h1>Flight Selection</h1>
      <p>
        <strong>From Date:</strong> {t("flight_select.from_date")}
      </p>
      <p>
        <strong>To Date:</strong> {t("flight_select.to_date")}
      </p>
    </main>
  );
}
