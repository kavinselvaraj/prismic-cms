import localEn from "../../messages/en.json";
import localJa from "../../messages/ja.json";
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

function createLabelContract(
  messagesByLocale: Record<AppLocale, FlightMessages>,
): FlightMessages {
  return mergeValues(Object.values(messagesByLocale)) as FlightMessages;
}

function mergeValues(values: unknown[]): unknown {
  const definedValues = values.filter((value) => value !== undefined && value !== null);

  if (definedValues.length === 0) {
    return "";
  }

  if (definedValues.some(Array.isArray)) {
    return mergeArrayValues(definedValues);
  }

  if (definedValues.some((value) => typeof value === "object")) {
    return mergeObjectValues(definedValues);
  }

  return "";
}

function mergeObjectValues(values: unknown[]) {
  const objects = values.filter(
    (value): value is Record<string, unknown> =>
      typeof value === "object" && value !== null && !Array.isArray(value),
  );
  const keys = new Set(objects.flatMap((value) => Object.keys(value)));

  return Object.fromEntries(
    Array.from(keys).map((key) => [
      key,
      mergeValues(objects.map((value) => value[key])),
    ]),
  );
}

function mergeArrayValues(values: unknown[]) {
  const arrays = values.filter(Array.isArray);
  const firstDefinedItem = arrays
    .flatMap((value) => value)
    .find((value) => value !== undefined && value !== null);

  if (firstDefinedItem === undefined) {
    return [];
  }

  if (
    typeof firstDefinedItem === "object" &&
    firstDefinedItem !== null &&
    !Array.isArray(firstDefinedItem)
  ) {
    return [
      mergeObjectValues(
        arrays
          .map((value) => value[0])
          .filter(
            (value): value is Record<string, unknown> =>
              typeof value === "object" &&
              value !== null &&
              !Array.isArray(value),
          ),
      ),
    ];
  }

  return [];
}
