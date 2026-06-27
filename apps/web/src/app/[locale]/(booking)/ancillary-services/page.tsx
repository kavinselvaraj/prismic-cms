import type { Metadata } from "next";
import { AncillaryServicesView } from "@/features/booking/components/ancillary-services-view";
import type { AppLocale } from "@/i18n/routing";

type PageProps = {
  params: Promise<{
    locale: AppLocale;
  }>;
};

export const metadata: Metadata = {
  title: "Ancillary Services",
};

export default async function AncillaryServicesPage({ params }: PageProps) {
  const { locale } = await params;

  return <AncillaryServicesView locale={locale} />;
}
