import type { Metadata } from "next";
import { PackageSelectionView } from "@/features/booking/components/package-selection-view";
import type { AppLocale } from "@/i18n/routing";

type PageProps = {
  params: Promise<{
    locale: AppLocale;
  }>;
};

export const metadata: Metadata = {
  title: "Package Selection",
};

export default async function PackageSelectionPage({ params }: PageProps) {
  const { locale } = await params;

  return <PackageSelectionView locale={locale} />;
}
