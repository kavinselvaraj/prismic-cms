import type { Metadata } from "next";
import { SdkCsrDemo } from "@/components/sdk-csr-demo";
import type { AppLocale } from "@/i18n/routing";
import { getJsonPlaceholderDemoData } from "@/services/jsonplaceholder/demo.service";

type PageProps = {
  params: Promise<{
    locale: AppLocale;
  }>;
};

export const metadata: Metadata = {
  title: "SDK SSR Demo",
};

export default async function SdkSsrDemoPage({ params }: PageProps) {
  await params;
  const serverSnapshot = await getJsonPlaceholderDemoData();

  return <SdkCsrDemo serverSnapshot={serverSnapshot} />;
}
