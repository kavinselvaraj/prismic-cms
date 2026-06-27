import type { Metadata } from "next";
import { SdkErrorScenariosDemo } from "@/components/sdk-error-scenarios-demo";
import type { AppLocale } from "@/i18n/routing";

type PageProps = {
  params: Promise<{
    locale: AppLocale;
  }>;
};

export const metadata: Metadata = {
  title: "SDK Error Scenarios",
};

export default async function SdkErrorScenariosPage({ params }: PageProps) {
  await params;
  return <SdkErrorScenariosDemo />;
}
