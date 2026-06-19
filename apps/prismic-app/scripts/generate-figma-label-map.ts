import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  getFlightSearchDocument,
  getFlightSelectDocument,
} from "../../web/src/i18n/documents";
import { createFieldId } from "./generate-prismic-models";

type FigmaMapping = {
  figmaPage: string;
  figmaSection: string;
  figmaLayer: string;
  labelKey: string;
  modelId: string;
  prismicFieldId: string;
};

const outputPath = path.resolve("artifacts/figma-label-map.json");
const existingMappings = readExistingMappings();
const generatedMappings = [
  ...createMappings("Flight Search", getFlightSearchDocument("en")),
  ...createMappings("Flight Select", getFlightSelectDocument("en")),
];
const mergedMappings = mergeMappings(existingMappings, generatedMappings);

mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(mergedMappings, null, 2)}\n`);

console.log(`Generated ${mergedMappings.length} Figma mapping entrie(s).`);

function createMappings(
  figmaPage: string,
  document: Record<string, unknown> & { modelId: string },
): FigmaMapping[] {
  return flattenObject(document)
    .filter(([pathKey]) => !["page", "modelId", "modelType", "uid"].includes(pathKey))
    .map(([labelKey]) => {
      const prismicFieldId = createFieldId(labelKey);
      const section = labelKey.split(".")[1] ?? "Main";

      return {
        figmaPage,
        figmaSection: toReadableLabel(section),
        figmaLayer: `${toReadableLabel(section)} / ${toReadableLabel(
          prismicFieldId,
        )}`,
        labelKey,
        modelId: document.modelId,
        prismicFieldId,
      };
    });
}

function readExistingMappings(): FigmaMapping[] {
  if (!existsSync(outputPath)) {
    return [];
  }

  return JSON.parse(readFileSync(outputPath, "utf8")) as FigmaMapping[];
}

function mergeMappings(existing: FigmaMapping[], generated: FigmaMapping[]) {
  const generatedKeys = new Set(
    generated.map((mapping) => `${mapping.modelId}:${mapping.labelKey}`),
  );
  const mappings = new Map<string, FigmaMapping>();

  for (const mapping of generated) {
    mappings.set(`${mapping.modelId}:${mapping.labelKey}`, mapping);
  }

  for (const mapping of existing) {
    if (!generatedKeys.has(`${mapping.modelId}:${mapping.labelKey}`)) {
      continue;
    }

    mappings.set(`${mapping.modelId}:${mapping.labelKey}`, mapping);
  }

  return [...mappings.values()];
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

function toReadableLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (character) => character.toUpperCase())
    .replace(/\bSeo\b/g, "SEO")
    .replace(/\bCta\b/g, "CTA");
}
