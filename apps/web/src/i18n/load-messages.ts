import { getIbeLabels, getServerLabelSource, resolveLocale } from "@/ibe/services/label-service";
import type { AppLocale } from "./routing";

export async function loadMessages(locale: AppLocale) {
  return getIbeLabels(locale);
}

export { getServerLabelSource, resolveLocale };
