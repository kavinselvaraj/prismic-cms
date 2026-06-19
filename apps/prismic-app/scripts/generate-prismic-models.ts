import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  getPrismicDocuments,
  type PrismicLabelDocument,
} from "../../web/src/i18n/prismic-document-registry";

type PrismicField = {
  type: "StructuredText" | "Text" | "UID";
  config: {
    label: string;
    single?: string;
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
    const model = createPrismicModel(document);
    const outputDirectory = path.join(outputRoot, document.modelId);

    mkdirSync(outputDirectory, { recursive: true });
    writeFileSync(
      path.join(outputDirectory, "index.json"),
      `${JSON.stringify(model, null, 2)}\n`,
    );
  }

  console.log(`Generated ${documents.length} Prismic model(s).`);
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

function createPrismicTabs(document: PrismicLabelDocument) {
  const tabs: Record<string, Record<string, PrismicField>> = {
    Main: {},
  };
  const fieldIds = new Set<string>();

  for (const [pathKey, value] of flattenObject(document.content)) {
    const tabName = getTabName(pathKey);

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
    tabs[tabName][fieldId] = createField(pathKey, value);
  }

  return tabs;
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

function getTabName(pathKey: string) {
  const pathParts = pathKey.split(".");

  return pathParts.length > 1 ? toReadableLabel(pathParts[0] ?? "Main") : "Main";
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
