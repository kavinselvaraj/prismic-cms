import type { Metadata } from "next";
import { SdkCsrDemo } from "@/components/sdk-csr-demo";
import type { AppLocale } from "@/i18n/routing";

type PageProps = {
  params: Promise<{
    locale: AppLocale;
  }>;
};

export const metadata: Metadata = {
  title: "SDK CSR Demo",
};

export default async function SdkCsrDemoPage({ params }: PageProps) {
  await params;
  return <SdkCsrDemo />;
}
