import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { cookies } from "next/headers";
import {
  FlightSearchServiceError,
  searchFlights,
} from "@/ibe/services/flight-search.service";
import {
  parseFlightSearchCookieValue,
} from "@/ibe/utils/flight-search-query";
import { FlightSelectionContainer } from "./components/flight-selection-container";
import { FlightSearchError } from "./components/flight-search-error";
import { InvalidSearch } from "./components/invalid-search";
import { NoFlightsFound } from "./components/no-flights-found";
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
    title: "Flight Selection",
    description: "Flight selection page",
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function FlightSelectPage({
  params,
}: PageProps) {
  noStore();
  const { locale } = await params;
  const cookieStore = await cookies();
  const query = parseFlightSearchCookieValue(
    cookieStore.get("flight_search_payload")?.value,
  );
  const appABaseUrl = process.env.IBE_APP_BASE_URL ?? "http://localhost:3000";

  if (!query) {
    return <InvalidSearch appABaseUrl={appABaseUrl} locale={locale} />;
  }

  try {
    const routes = await searchFlights({ locale, query });

    if (routes.length === 0) {
      return <NoFlightsFound appABaseUrl={appABaseUrl} locale={locale} />;
    }

    return (
      <FlightSelectionContainer
        appABaseUrl={appABaseUrl}
        locale={locale}
        routes={routes}
        search={query}
      />
    );
  } catch (error) {
    if (error instanceof FlightSearchServiceError && error.status === 400) {
      return (
        <InvalidSearch
          appABaseUrl={appABaseUrl}
          locale={locale}
          message={error.message}
        />
      );
    }

    if (error instanceof FlightSearchServiceError && error.status === 404) {
      return <NoFlightsFound appABaseUrl={appABaseUrl} locale={locale} />;
    }

    return (
      <FlightSearchError
        appABaseUrl={appABaseUrl}
        locale={locale}
        message={
          error instanceof Error
            ? error.message
            : "Unable to search flights right now."
        }
      />
    );
  }
}
