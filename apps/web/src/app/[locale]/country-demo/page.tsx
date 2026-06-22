import type { Metadata } from "next";
import { CountryIsdDemo } from "@/components/country-isd-demo";
import type { AppLocale } from "@/i18n/routing";
import { getCountryDialingOptions } from "@/utils/country-data";

type PageProps = {
  params: Promise<{
    locale: AppLocale;
  }>;
};

/**
 * Declares page metadata for the internal country and ISD demo route.
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Country and ISD Demo",
    description: "Demo page for country names and international dialing codes.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

/**
 * Renders the localized country and ISD demo page.
 */
export default async function CountryDemoPage({ params }: PageProps) {
  const { locale } = await params;
  const options = getCountryDialingOptions(locale);

  return <CountryIsdDemo locale={locale} options={options} />;
}
