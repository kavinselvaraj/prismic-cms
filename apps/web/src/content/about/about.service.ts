import { getPageLabels } from "../../lib/prismic/label-resolver";
import type { AppLocale } from "../../lib/prismic/types";

export async function getAboutPageContent(locale: AppLocale) {
  return getPageLabels({
    page: "about",
    locale,
  });
}
