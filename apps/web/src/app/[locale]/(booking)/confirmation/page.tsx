import type { Metadata } from "next";
import { ConfirmationView } from "@/features/booking/components/confirmation-view";
import type { AppLocale } from "@/i18n/routing";

type PageProps = {
  params: Promise<{
    locale: AppLocale;
  }>;
};

export const metadata: Metadata = {
  title: "Confirmation",
};

export default async function ConfirmationPage({ params }: PageProps) {
  const { locale } = await params;

  return <ConfirmationView locale={locale} />;
}
