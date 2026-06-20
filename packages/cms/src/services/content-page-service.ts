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
  categoryLinks: Array<{
    href: string;
    label: string;
  }>;
  description: prismic.RichTextField;
  detailCtaHref: string;
  detailCtaLabel: string;
  eyebrow: string;
  faqs: Array<{
    answer: prismic.RichTextField;
    href: string;
    question: string;
  }>;
  pageKind: "faq_landing" | "faq_category" | "faq_detail" | "";
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
    categoryLinks: document.data.category_links.map((item) => ({
      href: item.href ?? "",
      label: item.label ?? "",
    })),
    description: document.data.description,
    detailCtaHref: document.data.detail_cta_href ?? "",
    detailCtaLabel: document.data.detail_cta_label ?? "",
    eyebrow: document.data.eyebrow ?? "",
    faqs: document.data.faq_items.map((item) => ({
      answer: item.answer,
      href: item.href ?? "",
      question: item.question ?? "",
    })),
    pageKind: (document.data.page_kind ?? "") as ContentPageViewModel["pageKind"],
    title: document.data.title ?? "",
    uid: document.uid,
  };
}
