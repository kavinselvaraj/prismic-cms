import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  getFlightSearchDocument,
  getFlightSelectDocument,
} from "../apps/web/src/i18n/documents";
import { createFieldId, createPrismicModel } from "./generate-prismic-models";

type LabelDocument = Record<string, unknown> & {
  modelId: string;
  modelType: "page" | "custom";
};

const documents = [
  getFlightSearchDocument("en"),
  getFlightSelectDocument("en"),
] satisfies LabelDocument[];

const errors: string[] = [];

for (const document of documents) {
  validateGeneratedModel(document);
  validateDuplicateFieldIds(document);
}

validateFigmaMappings();

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log("CMS labels and Prismic models are valid.");

function validateGeneratedModel(document: LabelDocument) {
  const modelPath = path.resolve(
    "apps/prismic-app/customtypes",
    document.modelId,
    "index.json",
  );

  if (!existsSync(modelPath)) {
    errors.push(`Missing generated model for ${document.modelId}`);
    return;
  }

  const generated = JSON.parse(readFileSync(modelPath, "utf8")) as ReturnType<
    typeof createPrismicModel
  >;
  const expected = createPrismicModel(document);
  const generatedFields = Object.values(generated.json).flatMap((tab) =>
    Object.keys(tab),
  );
  const expectedFields = Object.values(expected.json).flatMap((tab) =>
    Object.keys(tab),
  );

  for (const fieldId of expectedFields) {
    if (!generatedFields.includes(fieldId)) {
      errors.push(`Missing field ${fieldId} in ${document.modelId}`);
    }
  }
}

function validateDuplicateFieldIds(document: LabelDocument) {
  const fieldIds = flattenObject(document)
    .filter(([pathKey]) => !["page", "modelId", "modelType", "uid"].includes(pathKey))
    .map(([pathKey]) => createFieldId(pathKey));
  const duplicates = fieldIds.filter(
    (fieldId, index) => fieldIds.indexOf(fieldId) !== index,
  );

  for (const duplicate of duplicates) {
    errors.push(`Duplicate field ID ${duplicate} in ${document.modelId}`);
  }
}

function validateFigmaMappings() {
  const figmaMapPath = path.resolve("prismic/figma-label-map.json");

  if (!existsSync(figmaMapPath)) {
    errors.push("Missing prismic/figma-label-map.json");
    return;
  }

  const mappings = JSON.parse(readFileSync(figmaMapPath, "utf8")) as Array<{
    labelKey: string;
    modelId: string;
    prismicFieldId: string;
  }>;
  const knownFields = new Set(
    documents.flatMap((document) =>
      Object.values(createPrismicModel(document).json).flatMap((tab) =>
        Object.keys(tab).map((fieldId) => `${document.modelId}:${fieldId}`),
      ),
    ),
  );

  for (const mapping of mappings) {
    if (!knownFields.has(`${mapping.modelId}:${mapping.prismicFieldId}`)) {
      errors.push(
        `Unused or invalid Figma mapping ${mapping.modelId}:${mapping.prismicFieldId}`,
      );
    }
  }
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
