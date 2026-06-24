import {
  createLabelService,
  getServerLabelSource,
  type LabelSource,
} from "@repo/cms";
import {
  labelMessagesContract,
  localMessages,
  type FlightMessages,
} from "./messages";
import { routing, type AppLocale } from "./routing";

export type { LabelSource };

const labelService = createLabelService<FlightMessages>({
  applicationName: "web",
  defaultLocale: routing.defaultLocale,
  locales: routing.locales,
  localMessages,
  labelContract: labelMessagesContract,
  parentDocumentType: "ibe",
  prismicLocaleMap: {
    en: "en-us",
    ja: "ja-jp",
  },
});

export const getIbeLabels = labelService.getLabels;
export { getServerLabelSource };

export function resolveLocale(locale: string | undefined): AppLocale {
  return labelService.resolveLocale(locale) as AppLocale;
}
