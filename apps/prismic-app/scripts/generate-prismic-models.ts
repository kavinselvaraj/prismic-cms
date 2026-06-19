import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  getPrismicDocuments,
  type PrismicLabelDocument,
} from "../../web/src/i18n/prismic-document-registry";

type PrismicField =
  | {
    type: "StructuredText" | "Text" | "UID";
    config: {
      label: string;
      single?: string;
    };
  }
  | {
    type: "Link";
    config: {
      label: string;
      select: "document";
      customtypes: string[];
    };
  }
  | {
    type: "Group";
    config: {
      label: string;
      repeat: true;
      fields: Record<string, PrismicField>;
    };
  };

type PrismicModel = {
  id: string;
  label: string;
  format: "custom";
  repeatable: false;
  status: true;
  json: {
    [tabName: string]: Record<string, PrismicField>;
  };
};

const outputRoot = path.resolve("customtypes");
const documents = getPrismicDocuments("en");

if (isMainModule()) {
  for (const document of documents) {
    writeModel(document.modelId, createPrismicModel(document));
  }

  writeModel("ibe", createIbeModel(documents));

  console.log(`Generated ${documents.length + 1} Prismic model(s).`);
}

export function createPrismicModel(
  document: PrismicLabelDocument,
): PrismicModel {
  const tabs = createPrismicTabs(document);

  if (document.modelType === "page") {
    tabs.Main.uid = {
      type: "UID",
      config: {
        label: "UID",
      },
    };
  }

  return {
    id: document.modelId,
    label: toReadableLabel(document.modelId),
    format: "custom",
    repeatable: false,
    status: true,
    json: {
      ...tabs,
    },
  };
}

export function createIbeModel(
  documents: PrismicLabelDocument[],
): PrismicModel {
  const mainFields = Object.fromEntries(
    documents
      .filter((document) => document.modelId !== "ibe")
      .map((document) => [
        document.modelId,
        {
          type: "Link",
          config: {
            label: toReadableLabel(document.modelId),
            select: "document" as const,
            customtypes: [document.modelId],
          },
        } satisfies PrismicField,
      ]),
  );

  return {
    id: "ibe",
    label: "IBE",
    format: "custom",
    repeatable: false,
    status: true,
    json: {
      Main: mainFields,
    },
  };
}

function createPrismicTabs(document: PrismicLabelDocument) {
  const tabs: Record<string, Record<string, PrismicField>> = {
    Main: {},
  };
  const fieldIds = new Set<string>();

  for (const [pathKey, value] of flattenObject(document.content)) {
    const tabName = getTabName(document.modelId, pathKey);

    if (!tabs[tabName]) {
      tabs[tabName] = {};
    }

    const fullPathKey = `${document.modelId}.${pathKey}`;
    const fieldId = createFieldId(fullPathKey);

    if (fieldIds.has(fieldId)) {
      throw new Error(
        `Duplicate generated field ID "${fieldId}" in ${document.modelId}`,
      );
    }

    fieldIds.add(fieldId);
    if (isArrayOfObjects(value)) {
      tabs[tabName][fieldId] = createGroupField(pathKey, value);
      continue;
    }

    tabs[tabName][fieldId] = createField(pathKey, value);
  }

  return tabs;
}

function createGroupField(
  pathKey: string,
  value: Array<Record<string, unknown>>,
): PrismicField {
  const firstItem = value[0] ?? {};
  const fields: Record<string, PrismicField> = {};

  for (const [key, nestedValue] of Object.entries(firstItem)) {
    fields[key] = createField(`${pathKey}.${key}`, nestedValue);
  }

  return {
    type: "Group",
    config: {
      label: toReadableLabel(pathKey.split(".").at(-1) ?? pathKey),
      repeat: true,
      fields,
    },
  };
}

function isArrayOfObjects(
  value: unknown,
): value is Array<Record<string, unknown>> {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (item) =>
        item &&
        typeof item === "object" &&
        !Array.isArray(item),
    )
  );
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

function createField(pathKey: string, value: unknown): PrismicField {
  const label = toReadableLabel(pathKey.split(".").at(-1) ?? pathKey);
  const normalizedPath = pathKey.toLowerCase();
  const pathParts = normalizedPath.split(".");
  const fieldName = pathParts[pathParts.length - 1] ?? normalizedPath;
  const isSeoField = normalizedPath.startsWith("seo.");
  const isTitleField = fieldName === "title";
  const isSubtitleField = fieldName === "subtitle";
  const isDescriptionField = fieldName === "description";
  const isPopularRoutesTitle =
    normalizedPath === "sections.popularroutes.title" ||
    normalizedPath === "sections.popular_routes.title";
  const isLongText =
    !isSeoField && (isTitleField || isSubtitleField || isDescriptionField);

  if (isLongText) {
    return {
      type: "StructuredText",
      config: {
        label,
        single: isPopularRoutesTitle
          ? "heading2,heading3,strong,em"
          : isTitleField
            ? "heading1,heading2,strong,em"
            : "paragraph,strong,em",
      },
    };
  }

  return {
    type: "Text",
    config: {
      label,
    },
  };
}

export function createFieldId(pathKey: string) {
  return pathKey
    .replace(/\./g, "_")
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase();
}

function getTabName(modelId: string, pathKey: string) {
  const pathParts = pathKey.split(".");
  const firstPart = pathParts[0];
  const secondPart = pathParts[1];

  if (!firstPart) {
    return "Main";
  }

  if (firstPart === modelId) {
    return pathParts.length >= 3 && secondPart
      ? toReadableLabel(secondPart)
      : "Main";
  }

  return pathParts.length > 1 ? toReadableLabel(firstPart) : "Main";
}

function toReadableLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())
    .replace(/\bSeo\b/g, "SEO")
    .replace(/\bCta\b/g, "CTA");
}

function isMainModule() {
  return process.argv[1]
    ? fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
    : false;
}

function writeModel(modelId: string, model: PrismicModel) {
  const outputDirectory = path.join(outputRoot, modelId);

  mkdirSync(outputDirectory, { recursive: true });
  writeFileSync(
    path.join(outputDirectory, "index.json"),
    `${JSON.stringify(model, null, 2)}\n`,
  );
}
