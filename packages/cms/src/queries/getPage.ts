import * as prismic from "@prismicio/client";
import type { ContentPageDocument } from "../generated/prismicio-types";
import { createPrismicClient } from "../prismic/create-client";
import type { ContentPageBreadcrumbItem } from "../types/content-page.types";

const localeMap: Record<string, string> = {
  en: "en-us",
  ja: "ja-jp",
};

export async function getContentPageDocumentByUid(params: {
  locale: string;
  uid: string;
}): Promise<ContentPageDocument | null> {
  const client = createPrismicClient();
  const lang = localeMap[params.locale] ?? params.locale;

  try {
    return await client.getByUID("content_page", params.uid, {
      lang,
    });
  } catch (error) {
    if (
      error instanceof prismic.PrismicError &&
      error.url?.includes("documents/search")
    ) {
      return null;
    }

    throw error;
  }
}

export function getContentPageBreadcrumb(
  document: ContentPageDocument,
): ContentPageBreadcrumbItem[] {
  return [
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
  ].filter((item) => item.label);
}
