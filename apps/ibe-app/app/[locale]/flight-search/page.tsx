import { FlightSearchForm } from "./components/FlightSearchForm";
import { readFlightSearchDraftFromSearchParams } from "@/modules/route-search/utils/route-search-query";

type FlightSearchPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FlightSearchPage({
  params,
  searchParams,
}: FlightSearchPageProps) {
  const { locale } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const initialValues = readFlightSearchDraftFromSearchParams(
    resolvedSearchParams,
  );

  return (
    <section className="shell">
      <div className="hero-block">
        <div>
          <p className="eyebrow">APP-A</p>
          <h1>Flight Search</h1>
          <p className="hero-copy">
            This page belongs to <code>ibe-app</code>. It validates search input
            and redirects to the <code>web</code> app with URL query params. It
            does not call the flight search API.
          </p>
        </div>
      </div>

      <FlightSearchForm initialValues={initialValues} locale={locale} />
    </section>
  );
}
