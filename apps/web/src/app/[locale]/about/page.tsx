import { getAboutPageContent } from "@/content/about/about.service";
import type { AppLocale } from "@/lib/prismic/types";
import { RichTextSection } from "@repo/cms";
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
  const content = await getAboutPageContent(locale);

  return {
    title: content.seo.metaTitle,
    description: content.seo.metaDescription,
  };
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  const content = await getAboutPageContent(locale);

  return (
    <main>
      <RichTextSection
        description={content.sections.hero.subtitle}
        title={content.sections.hero.title}
      />
      <RichTextSection
        description={content.sections.content.description}
        title={content.sections.content.title}
      />
    </main>
  );
}
