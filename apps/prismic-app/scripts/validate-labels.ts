import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  getPrismicDocuments,
  type PrismicLabelDocument,
} from "../../web/src/i18n/prismic-document-registry";
import { createFieldId, createPrismicModel } from "./generate-prismic-models";
const documents = getPrismicDocuments("en");

const errors: string[] = [];

for (const document of documents) {
  validateGeneratedModel(document);
  validateDuplicateFieldIds(document);
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log("CMS labels and Prismic models are valid.");

function validateGeneratedModel(document: PrismicLabelDocument) {
  const modelPath = path.resolve(
    "customtypes",
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

function validateDuplicateFieldIds(document: PrismicLabelDocument) {
  const fieldIds = flattenObject(document.content)
    .map(([pathKey]) => createFieldId(`${document.modelId}.${pathKey}`));
  const duplicates = fieldIds.filter(
    (fieldId, index) => fieldIds.indexOf(fieldId) !== index,
  );

  for (const duplicate of duplicates) {
    errors.push(`Duplicate field ID ${duplicate} in ${document.modelId}`);
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
