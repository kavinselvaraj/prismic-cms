import * as prismic from "@prismicio/client";
import { createPrismicClient } from "../prismic/create-client";
import type { ContentPageDocument } from "../generated/prismicio-types";

const localeMap: Record<string, string> = {
  en: "en-us",
  ja: "ja-jp",
};

export type ContentPageViewModel = {
  breadcrumb: Array<{
    href: string;
    label: string;
  }>;
  description: prismic.RichTextField;
  eyebrow: string;
  faqs: Array<{
    answer: prismic.RichTextField;
    question: string;
  }>;
  title: string;
  uid: string | null;
};

export async function getContentPageByUid(params: {
  locale: string;
  uid: string;
}): Promise<ContentPageViewModel | null> {
  const client = createPrismicClient();
  const lang = localeMap[params.locale] ?? params.locale;

  try {
    const page = await client.getByUID("content_page", params.uid, {
      lang,
    });

    return mapContentPage(page as ContentPageDocument);
  } catch (error) {
    if (error instanceof prismic.PrismicError && error.url?.includes("documents/search")) {
      return null;
    }

    throw error;
  }
}

function mapContentPage(document: ContentPageDocument): ContentPageViewModel {
  return {
    breadcrumb: [
      {
        label: document.data.breadcrumb_level_1_label ?? "",
        href: document.data.breadcrumb_level_1_href ?? "",
      },
      {
        label: document.data.breadcrumb_level_2_label ?? "",
        href: document.data.breadcrumb_level_2_href ?? "",
      },
      {
        label: document.data.breadcrumb_level_3_label ?? "",
        href: document.data.breadcrumb_level_3_href ?? "",
      },
    ].filter((item) => item.label),
    description: document.data.description,
    eyebrow: document.data.eyebrow ?? "",
    faqs: document.data.faq_items.map((item) => ({
      answer: item.answer,
      question: item.question ?? "",
    })),
    title: document.data.title ?? "",
    uid: document.uid,
  };
}
