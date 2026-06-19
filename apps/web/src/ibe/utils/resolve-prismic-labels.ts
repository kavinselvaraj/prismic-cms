type PrismicDocumentData = Record<string, unknown>;

type PrismicDocumentMap = Record<
  string,
  {
    data: PrismicDocumentData;
  }
>;

export function resolvePrismicLabels<T extends Record<string, unknown>>(
  template: T,
  documents: PrismicDocumentMap,
): T {
  return mapObject(template, documents) as T;
}

function mapObject(
  value: unknown,
  documents: PrismicDocumentMap,
  rootKey?: string,
  pathParts: string[] = [],
): unknown {
  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    if (!rootKey) {
      return value;
    }

    const fieldId = [rootKey, rootKey, ...pathParts].join("_");
    const documentData = documents[rootKey]?.data ?? {};
    const groupValue = documentData[fieldId];

    if (!Array.isArray(groupValue)) {
      return value;
    }

    const templateItem = value[0];

    if (!templateItem || typeof templateItem !== "object" || Array.isArray(templateItem)) {
      return groupValue;
    }

    return groupValue.map((item) => mapGroupItem(templateItem, item));
  }

  if (typeof value !== "object") {
    if (!rootKey) {
      return value;
    }

    const fieldId = [rootKey, rootKey, ...pathParts].join("_");
    const documentData = documents[rootKey]?.data ?? {};

    return String(documentData[fieldId] ?? "");
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, nestedValue]) => {
      const nextRootKey = rootKey ?? key;
      const nextPathParts = rootKey ? [...pathParts, key] : [];

      return [
        key,
        mapObject(nestedValue, documents, nextRootKey, nextPathParts),
      ];
    }),
  );
}

function mapGroupItem(template: unknown, value: unknown): unknown {
  if (template === null || template === undefined) {
    return "";
  }

  if (Array.isArray(template)) {
    return Array.isArray(value) ? value : template;
  }

  if (typeof template !== "object") {
    return value ?? "";
  }

  const item = value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

  return Object.fromEntries(
    Object.entries(template).map(([key, nestedTemplate]) => [
      key,
      mapGroupItem(nestedTemplate, item[key]),
    ]),
  );
}
