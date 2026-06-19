import aboutLabels from "../features/about/lang/en.json";
import homeLabels from "../features/home/lang/en.json";
import sharedLabels from "../shared/lang/en.json";
import { createPrismicClient } from "./create-client";
import { pageModelMap, toPrismicLocale } from "./config";
import type {
  GetPageLabelsOptions,
  LabelSource,
  PageLabels,
  PageName,
  SharedLabels,
} from "./types";

type FlatPrismicData = Record<string, unknown>;
type NestedLabels = Record<string, unknown>;

const localPageLabels = {
  home: homeLabels,
  about: aboutLabels,
} as const;

export async function getPageLabels<TPage extends PageName>({
  page,
  locale,
}: GetPageLabelsOptions<TPage>): Promise<PageLabels<TPage>> {
  const localLabels = mergeLabels(sharedLabels, localPageLabels[page]);

  try {
    const prismicLabels = await getPrismicLabels({ page, locale });

    return mergeLabels(localLabels, prismicLabels) as PageLabels<TPage>;
  } catch (error) {
    handleFallback({ error, page, source: "local" });

    return localLabels as PageLabels<TPage>;
  }
}

async function getPrismicLabels({
  page,
  locale,
}: GetPageLabelsOptions): Promise<NestedLabels> {
  const client = createPrismicClient();
  const model = pageModelMap[page];
  const lang = toPrismicLocale(locale);
  const pagePathMap = createFieldPathMap(localPageLabels[page]);
  const sharedPathMap = createFieldPathMap(sharedLabels);
  const [pageDocument, sharedDocument] = await Promise.all([
    client.getByUID(model.modelId, model.uid, { lang }),
    client.getSingle("shared_labels", { lang }),
  ]);

  return mergeLabels(
    unflattenPrismicData(sharedDocument.data as FlatPrismicData, sharedPathMap),
    unflattenPrismicData(pageDocument.data as FlatPrismicData, pagePathMap),
  );
}

function unflattenPrismicData(
  data: FlatPrismicData,
  fieldPathMap: Map<string, string>,
) {
  const labels: NestedLabels = {};

  for (const [fieldId, value] of Object.entries(data)) {
    const path = fieldPathMap.get(fieldId);

    if (!path) {
      continue;
    }

    setNestedValue(labels, path.split("."), readPrismicValue(value));
  }

  return labels;
}

function createFieldPathMap(document: NestedLabels) {
  const paths = flattenObject(document)
    .map(([pathKey]) => pathKey)
    .filter((pathKey) => !["page", "modelId", "modelType", "uid"].includes(pathKey));

  return new Map(paths.map((pathKey) => [createFieldId(pathKey), pathKey]));
}

function flattenObject(
  value: unknown,
  prefix = "",
): Array<[pathKey: string, value: unknown]> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [[prefix, value]];
  }

  return Object.entries(value).flatMap(([key, nestedValue]) =>
    flattenObject(nestedValue, prefix ? `${prefix}.${key}` : key),
  );
}

function createFieldId(pathKey: string) {
  return pathKey
    .replace(/^sections\./, "")
    .replace(/\./g, "_")
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase();
}

function setNestedValue(
  target: NestedLabels,
  path: string[],
  value: unknown,
) {
  const [head, ...tail] = path;

  if (!head) {
    return;
  }

  if (tail.length === 0) {
    target[head] = value;
    return;
  }

  if (!target[head] || typeof target[head] !== "object") {
    target[head] = {};
  }

  setNestedValue(target[head] as NestedLabels, tail, value);
}

function readPrismicValue(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((block) =>
        block && typeof block === "object" && "text" in block
          ? String(block.text)
          : "",
      )
      .filter(Boolean)
      .join("\n");
  }

  return value;
}

function mergeLabels<TBase extends NestedLabels, TNext extends NestedLabels>(
  base: TBase,
  next: TNext,
): TBase & TNext {
  return deepMerge(base, next) as TBase & TNext;
}

function deepMerge(base: NestedLabels, next: NestedLabels): NestedLabels {
  const result: NestedLabels = { ...base };

  for (const [key, value] of Object.entries(next)) {
    const current = result[key];

    if (isPlainObject(current) && isPlainObject(value)) {
      result[key] = deepMerge(current, value);
      continue;
    }

    result[key] = value;
  }

  return result;
}

function isPlainObject(value: unknown): value is NestedLabels {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function handleFallback({
  error,
  page,
  source,
}: {
  error: unknown;
  page: PageName;
  source: LabelSource;
}) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  console.warn(
    `[cms] Falling back to ${source} labels for "${page}": ${
      error instanceof Error ? error.message : "Unknown CMS error"
    }`,
  );
}
