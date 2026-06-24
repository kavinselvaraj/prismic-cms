import localEn from "../../messages/en.json";
import localJa from "../../messages/ja.json";
import { createLabelContract } from "@repo/cms";
import type { AppLocale } from "./routing";

export type FlightMessages = typeof localEn;

export const localMessages: Record<AppLocale, FlightMessages> = {
  en: localEn,
  ja: localJa,
};

export function getLocaleMessages(locale: AppLocale): FlightMessages {
  return localMessages[locale] ?? localMessages.en;
}

export const labelMessagesContract = createLabelContract(localMessages);
