import { getPageLabels } from "../../prismic/label-resolver";
import type { AppLocale } from "../../prismic/types";

export async function getAboutPageContent(locale: AppLocale) {
  return getPageLabels({
    page: "about",
    locale,
  });
}
