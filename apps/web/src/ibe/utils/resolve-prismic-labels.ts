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
    return value;
  }

  if (typeof value !== "object") {
    if (!rootKey) {
      return value;
    }

    const fieldId = [rootKey, ...pathParts].join("_");
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
