import type { Metadata } from "next";
import { PassportScannerDemo } from "@/components/passport-scanner-demo";
import type { AppLocale } from "@/i18n/routing";

type PageProps = {
  params: Promise<{
    locale: AppLocale;
  }>;
};

export const metadata: Metadata = {
  title: "Passport Scanner Demo",
};

export default async function PassportScannerDemoPage({ params }: PageProps) {
  const { locale } = await params;

  return <PassportScannerDemo locale={locale} />;
}
