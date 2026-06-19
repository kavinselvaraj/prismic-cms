"use client";

import Link from "next/link";
import { useLabelMessages } from "@/i18n/use-label-messages";
import type { AppLocale } from "@/i18n/routing";

type LocalizedLabelsProps = {
  locale: AppLocale;
  page: "landing" | "flight-search" | "flight-select" | "passenger";
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

  if (page === "passenger") {
    return (
      <main>
        <h1>Passenger Demo</h1>

        <section style={{ marginTop: "24px" }}>
          <h2>Personal Info</h2>
          <p>
            <strong>First Name:</strong>{" "}
            {messages.passenger.personal_info.first_name}
          </p>
          <p>
            <strong>Last Name:</strong>{" "}
            {messages.passenger.personal_info.last_name}
          </p>
          <p>
            <strong>Middle Name:</strong>{" "}
            {messages.passenger.personal_info.middle_name}
          </p>
          <p>
            <strong>Date of Birth:</strong>{" "}
            {messages.passenger.personal_info.date_of_birth}
          </p>
        </section>

        <section style={{ marginTop: "24px" }}>
          <h2>Travel Info</h2>
          <p>
            <strong>Region Label:</strong>{" "}
            {messages.passenger.travel_info.region_label}
          </p>
          <p>
            <strong>US Routes:</strong>
          </p>
          <ul>
            {messages.passenger.travel_info.us_route.map((route) => (
              <li key={`us-${route.code}`}>
                {route.code} - {route.name}
              </li>
            ))}
          </ul>
          <p>
            <strong>Asia Routes:</strong>
          </p>
          <ul>
            {messages.passenger.travel_info.asia_route.map((route) => (
              <li key={`asia-${route.code}`}>
                {route.code} - {route.name}
              </li>
            ))}
          </ul>
        </section>

        <section style={{ marginTop: "24px" }}>
          <h2>Documents</h2>
          <p>
            <strong>Passport Number:</strong>{" "}
            {messages.passenger.documents.passport_number}
          </p>
          <p>
            <strong>Passport Expiry:</strong>{" "}
            {messages.passenger.documents.passport_expiry}
          </p>
          <p>
            <strong>Nationality:</strong>{" "}
            {messages.passenger.documents.nationality}
          </p>
        </section>

        <section style={{ marginTop: "24px" }}>
          <h2>Preferences</h2>
          <p>
            <strong>Meal Preference:</strong>{" "}
            {messages.passenger.preferences.meal_preference}
          </p>
          <p>
            <strong>Seat Preference:</strong>{" "}
            {messages.passenger.preferences.seat_preference}
          </p>
          <p>
            <strong>Special Assistance:</strong>{" "}
            {messages.passenger.preferences.special_assistance}
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
            {JSON.stringify(messages.passenger, null, 2)}
          </pre>
        </section>
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
          <Link href={`/${locale}/passenger`}>Passenger</Link>
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
        <h2>Passenger</h2>
        <p>
          <strong>First Name:</strong>{" "}
          {messages.passenger.personal_info.first_name}
        </p>
        <p>
          <strong>Region Label:</strong>{" "}
          {messages.passenger.travel_info.region_label}
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
