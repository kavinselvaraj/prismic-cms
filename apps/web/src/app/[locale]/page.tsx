import type { Metadata } from "next";
import { LocalizedLabels } from "@/components/localized-labels";
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
    title: "Flight Landing",
    description: "Flight landing page",
  };
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;

  return <LocalizedLabels locale={locale} page="landing" />;
}
