import { SampleApiPanel } from "@/components/sample-api-panel";

type LocalePageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function LocalePage({ params }: LocalePageProps) {
  const { locale } = await params;

  return (
    <section className="shell">
      <h1>NEXUZ IBE API skeleton</h1>
      <SampleApiPanel locale={locale} />
    </section>
  );
}
