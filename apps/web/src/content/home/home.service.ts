import { getPageLabels } from "../../lib/prismic/label-resolver";
import type { AppLocale } from "../../lib/prismic/types";

export async function getHomePageContent(locale: AppLocale) {
  return getPageLabels({
    page: "home",
    locale,
  });
}
