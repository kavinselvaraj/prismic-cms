"use client";

import Link from "next/link";
import { useLabelMessages } from "@/i18n/use-label-messages";
import type { AppLocale } from "@/i18n/routing";

type LocalizedLabelsProps = {
  locale: AppLocale;
  page: "landing" | "flight-search" | "flight-select";
};

export function LocalizedLabels({ locale, page }: LocalizedLabelsProps) {
  const { error, isLoading, messages } = useLabelMessages(locale);

  if (isLoading) {
    return <p>Loading labels...</p>;
  }

  if (error || !messages) {
    return <p>{error ?? "Unable to load labels"}</p>;
  }

  if (page === "flight-search") {
    return (
      <main>
        <h1>Flight Search</h1>
        <p>
          <strong>Airport Label:</strong> {messages.flight_search.airport.label}
        </p>
        <p>
          <strong>Airport Name:</strong> {messages.flight_search.airport.name}
        </p>
        <p>
          <strong>PTC:</strong> {messages.flight_search.ptc}
        </p>
      </main>
    );
  }

  if (page === "flight-select") {
    return (
      <main>
        <h1>Flight Selection</h1>
        <p>
          <strong>From Date:</strong> {messages.flight_select.from_date}
        </p>
        <p>
          <strong>To Date:</strong> {messages.flight_select.to_date}
        </p>
      </main>
    );
  }

  return (
    <main>
      <h1>Flight Landing</h1>

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
          <strong>Airport Label:</strong> {messages.flight_search.airport.label}
        </p>
        <p>
          <strong>Airport Name:</strong> {messages.flight_search.airport.name}
        </p>
        <p>
          <strong>PTC:</strong> {messages.flight_search.ptc}
        </p>
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>Flight Select</h2>
        <p>
          <strong>From Date:</strong> {messages.flight_select.from_date}
        </p>
        <p>
          <strong>To Date:</strong> {messages.flight_select.to_date}
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
