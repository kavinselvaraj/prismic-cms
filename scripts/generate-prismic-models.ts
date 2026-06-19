import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import aboutLabels from "../apps/web/src/content/about/lang/en.json";
import { aboutSchema } from "../apps/web/src/content/about/about.schema";
import homeLabels from "../apps/web/src/content/home/lang/en.json";
import { homeSchema } from "../apps/web/src/content/home/home.schema";
import sharedLabels from "../apps/web/src/content/shared/lang/en.json";
import { sharedSchema } from "../apps/web/src/content/shared/shared.schema";

type LabelDocument = Record<string, unknown> & {
  modelId: string;
  modelType: "page" | "custom";
  uid?: string;
};

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
    Main: Record<string, PrismicField>;
  };
};

const outputRoot = path.resolve("apps/prismic-app/customtypes");
const documents = [
  homeSchema.parse(homeLabels),
  aboutSchema.parse(aboutLabels),
  sharedSchema.parse(sharedLabels),
] satisfies LabelDocument[];

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

export function createPrismicModel(document: LabelDocument): PrismicModel {
  const fields = flattenLabelDocument(document);

  if (document.modelType === "page") {
    fields.uid = {
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
      Main: fields,
    },
  };
}

function flattenLabelDocument(document: LabelDocument) {
  const fields: Record<string, PrismicField> = {};

  for (const [pathKey, value] of flattenObject(document)) {
    if (isMetadataPath(pathKey)) {
      continue;
    }

    const fieldId = createFieldId(pathKey);
    fields[fieldId] = createField(pathKey, value);
  }

  return fields;
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
  const label = toReadableLabel(createFieldId(pathKey));
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
    .replace(/^sections\./, "")
    .replace(/\./g, "_")
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase();
}

function isMetadataPath(pathKey: string) {
  return ["page", "modelId", "modelType", "uid"].includes(pathKey);
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
