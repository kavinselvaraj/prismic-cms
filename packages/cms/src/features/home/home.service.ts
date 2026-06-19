import { getPageLabels } from "../../prismic/label-resolver";
import type { AppLocale } from "../../prismic/types";

export async function getHomePageContent(locale: AppLocale) {
  return getPageLabels({
    page: "home",
    locale,
  });
}
