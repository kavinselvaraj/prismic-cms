import { getCmsPreviewState } from "@/prismic/preview";
import {
  getIbeLabels,
  getServerLabelSource,
  resolveLocale,
} from "./label-service-config";
import type { AppLocale } from "./routing";

export async function loadMessages(locale: AppLocale) {
  return getIbeLabels(locale, {
    preview: await getCmsPreviewState(),
  });
}

export { getServerLabelSource, resolveLocale };
