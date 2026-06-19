import Link from "next/link";
import { getMessages, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { routing, type AppLocale } from "@/i18n/routing";

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
    title: "Flight Landing",
    description: t("flight_search.airport.label"),
  };
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const messages = await getMessages({ locale });

  return (
    <main style={{ padding: "32px" }}>
      <h1>Flight Landing</h1>

      <section style={{ marginTop: "24px" }}>
        <h2>Language Switcher</h2>
        <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
          {routing.locales.map((supportedLocale) => (
            <Link
              href={`/${supportedLocale}`}
              key={supportedLocale}
              style={{
                border: "1px solid #cbd5e1",
                padding: "8px 14px",
                textDecoration: "none",
              }}
            >
              {supportedLocale.toUpperCase()}
            </Link>
          ))}
        </div>
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>Routes</h2>
        <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
          <Link href={`/${locale}/flight-search`}>Flight Search</Link>
          <Link href={`/${locale}/flight-select`}>Flight Selection</Link>
        </div>
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>Loaded Labels</h2>
        <p>
          <strong>Airport Label:</strong> {t("flight_search.airport.label")}
        </p>
        <p>
          <strong>Airport Name:</strong> {t("flight_search.airport.name")}
        </p>
        <p>
          <strong>PTC:</strong> {t("flight_search.ptc")}
        </p>
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>Flight Select</h2>
        <p>
          <strong>From Date:</strong> {t("flight_select.from_date")}
        </p>
        <p>
          <strong>To Date:</strong> {t("flight_select.to_date")}
        </p>
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>Messages Payload</h2>
        <pre
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            overflowX: "auto",
            padding: "16px",
          }}
        >
          {JSON.stringify(messages, null, 2)}
        </pre>
      </section>
    </main>
  );
}
