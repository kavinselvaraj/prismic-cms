import { getHomePageContent } from "@/content/home/home.service";
import type { AppLocale } from "@/lib/prismic/types";
import { HeroSection, PopularRoutes } from "@repo/cms";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{
    locale: AppLocale;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const content = await getHomePageContent(locale);

  return {
    title: content.seo.metaTitle,
    description: content.seo.metaDescription,
  };
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  const content = await getHomePageContent(locale);

  return (
    <main>
      <HeroSection labels={content.sections.hero} />
      <PopularRoutes labels={content.sections.popularRoutes} />
    </main>
  );
}
