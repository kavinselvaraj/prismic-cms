import {
  getIbeLabels,
  getServerLabelSource,
  resolveLocale,
} from "./label-service-config";
import type { AppLocale } from "./routing";

export async function loadMessages(locale: AppLocale) {
  return getIbeLabels(locale);
}

export { getServerLabelSource, resolveLocale };
