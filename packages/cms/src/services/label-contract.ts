/**
 * Creates a structural label contract from all supported locale message files.
 * Values are replaced with empty placeholders; only the combined key shape is
 * retained for mapping Prismic fields back into nested application messages.
 */
export function createLabelContract<T extends Record<string, unknown>>(
  messagesByLocale: Record<string, T>,
): T {
  return mergeValues(Object.values(messagesByLocale)) as T;
}

function mergeValues(values: unknown[]): unknown {
  const definedValues = values.filter(
    (value) => value !== undefined && value !== null,
  );

  if (definedValues.length === 0) {
    return "";
  }

  if (definedValues.some(Array.isArray)) {
    return mergeArrayValues(definedValues);
  }

  if (definedValues.some((value) => isRecord(value))) {
    return mergeObjectValues(definedValues);
  }

  return "";
}

function mergeObjectValues(values: unknown[]) {
  const objects = values.filter(isRecord);
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

  if (!isRecord(firstDefinedItem)) {
    return [];
  }

  return [
    mergeObjectValues(
      arrays.map((value) => value[0]).filter(isRecord),
    ),
  ];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
