import type { Metadata } from "next";
import { CustomerInformationView } from "@/features/booking/components/customer-information-view";
import type { AppLocale } from "@/i18n/routing";

type PageProps = {
  params: Promise<{
    locale: AppLocale;
  }>;
};

export const metadata: Metadata = {
  title: "Customer Information",
};

export default async function CustomerInformationPage({ params }: PageProps) {
  const { locale } = await params;

  return <CustomerInformationView locale={locale} />;
}
