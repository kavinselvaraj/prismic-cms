import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  getFlightSearchDocument,
  getFlightSelectDocument,
} from "../../web/src/i18n/documents";
import type { AppLocale } from "../../web/src/i18n/routing";
import { createFieldId, createPrismicModel } from "./generate-prismic-models";

type LabelDocument = Record<string, unknown> & {
  modelId: string;
  modelType: "page" | "custom";
  page?: string;
  uid?: string;
};

type ExistingDocument = {
  id: string;
  uid?: string | null;
  type: string;
  lang: string;
  tags: string[];
  data: Record<string, unknown>;
};

type SeedOperation = {
  action: "create" | "update";
  modelId: string;
  uid?: string;
  title: string;
  fieldCount: number;
  documentId?: string;
};

const locale = (readArgValue("--locale") ?? "en") as AppLocale;
const shouldWrite = process.argv.includes("--write");
const prismicLocale = toPrismicLocale(locale);

loadEnvFiles();

const documents = [
  getFlightSearchDocument(locale),
  getFlightSelectDocument(locale),
] satisfies LabelDocument[];

main().catch((error) => {
  console.error(formatError(error));
  process.exit(1);
});

async function main() {
  const operations = await seedContent();

  console.log(
    JSON.stringify(
      {
        mode: shouldWrite ? "write" : "dry-run",
        locale,
        prismicLocale,
        operations,
      },
      null,
      2,
    ),
  );
}

async function seedContent() {
  const [{ createPrismicClient }, { createPrismicMigration, createPrismicWriteClient }] =
    await Promise.all([
      import("../../../packages/cms/src/prismic/create-client"),
      import("../src/prismic/write-client"),
    ]);
  const migration = createPrismicMigration();
  const readClient = createPrismicClient();
  const operations: SeedOperation[] = [];

  for (const document of documents) {
    const title = createDocumentTitle(document);
    const data = createPrismicDocumentData(document);
    const manualDocumentId = getDocumentIdOverride(document.modelId, locale);
    const existingDocument = await findExistingDocument(readClient, document);
    const operation: SeedOperation = {
      action: existingDocument || manualDocumentId ? "update" : "create",
      modelId: document.modelId,
      uid: document.uid,
      title,
      fieldCount: Object.keys(data).length,
      documentId: manualDocumentId ?? existingDocument?.id,
    };

    operations.push(operation);

    if (!shouldWrite) {
      continue;
    }

    if (existingDocument) {
      migration.updateDocument(
        {
          ...existingDocument,
          data,
        },
        title,
      );
      continue;
    }

    migration.createDocument(
      {
        type: document.modelId,
        uid: document.uid,
        lang: prismicLocale,
        tags: [],
        data,
      },
      title,
    );
  }

  if (shouldWrite) {
    const writeClient = createPrismicWriteClient();

    for (const document of documents) {
      const documentId = getDocumentIdOverride(document.modelId, locale);

      if (!documentId) {
        continue;
      }

      const title = createDocumentTitle(document);
      const data = createPrismicDocumentData(document);

      await writeClient.updateDocument(documentId, {
        documentTitle: title,
        uid: document.uid,
        tags: [],
        data,
      });
    }

    const hasCreateOrLookupUpdates = operations.some(
      (operation) => !getDocumentIdOverride(operation.modelId, locale),
    );

    if (!hasCreateOrLookupUpdates) {
      return operations;
    }

    await writeClient.migrate(migration, {
      reporter: (event) => {
        console.log(formatMigrationEvent(event));
      },
    });
  }

  return operations;
}

function formatMigrationEvent(event: {
  type: string;
  data?: {
    current?: number;
    total?: number;
    document?: {
      document?: {
        type?: string;
        uid?: string;
      };
    };
  };
}) {
  const document = event.data?.document?.document;
  const progress =
    event.data?.current && event.data?.total
      ? ` ${event.data.current}/${event.data.total}`
      : "";
  const documentLabel = document
    ? ` ${document.type}${document.uid ? `:${document.uid}` : ""}`
    : "";

  return `[prismic:migration] ${event.type}${progress}${documentLabel}`;
}

function formatError(error: unknown) {
  if (!(error instanceof Error)) {
    return String(error);
  }

  const response = (error as { response?: unknown }).response;

  if (!response) {
    return error.message;
  }

  return `${error.message}\n${JSON.stringify(response, null, 2)}`;
}

async function findExistingDocument(
  client: {
    getByUID: (
      type: string,
      uid: string,
      options: { lang: string },
    ) => Promise<unknown>;
    getSingle: (type: string, options: { lang: string }) => Promise<unknown>;
  },
  document: LabelDocument,
): Promise<ExistingDocument | undefined> {
  try {
    if (document.uid) {
      return (await client.getByUID(document.modelId, document.uid, {
        lang: prismicLocale,
      })) as ExistingDocument;
    }

    return (await client.getSingle(document.modelId, {
      lang: prismicLocale,
    })) as ExistingDocument;
  } catch {
    return undefined;
  }
}

function createPrismicDocumentData(document: LabelDocument) {
  const model = createPrismicModel(document);
  const fields = Object.values(model.json).reduce<
    Record<
      string,
      {
        type: string;
        config?: {
          single?: string;
        };
      }
    >
  >((accumulator, tabFields) => ({ ...accumulator, ...tabFields }), {});
  const data: Record<string, unknown> = {};

  for (const [pathKey, value] of flattenObject(document)) {
    if (isMetadataPath(pathKey)) {
      continue;
    }

    const fieldId = createFieldId(pathKey);
    const field = fields[fieldId];

    if (!field) {
      throw new Error(
        `Missing generated field "${fieldId}" for ${document.modelId}`,
      );
    }

    data[fieldId] = toPrismicFieldValue({
      field,
      value,
    });
  }

  return data;
}

function toPrismicFieldValue({
  field,
  value,
}: {
  field: {
    type: string;
    config?: {
      single?: string;
    };
  };
  value: unknown;
}) {
  const text = String(value ?? "");

  if (field.type !== "StructuredText") {
    return text;
  }

  return [
    {
      type: selectStructuredTextBlockType(field.config?.single),
      text,
      spans: [],
    },
  ];
}

function selectStructuredTextBlockType(single?: string) {
  const supportedBlockTypes = [
    "heading1",
    "heading2",
    "heading3",
    "heading4",
    "heading5",
    "heading6",
    "paragraph",
  ];
  const configuredTypes =
    single?.split(",").map((type) => type.trim()).filter(Boolean) ?? [];

  return (
    configuredTypes.find((type) => supportedBlockTypes.includes(type)) ??
    "paragraph"
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

function isMetadataPath(pathKey: string) {
  return ["page", "modelId", "modelType", "uid"].includes(pathKey);
}

function createDocumentTitle(document: LabelDocument) {
  if (document.page && typeof document.page === "string") {
    return `${toReadableLabel(document.page)} Page`;
  }

  return toReadableLabel(document.modelId);
}

function toReadableLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function toPrismicLocale(value: string) {
  const localeMap: Record<string, string> = {
    en: "en-us",
    ja: "ja-jp",
  };

  return localeMap[value] ?? value;
}

function readArgValue(name: string) {
  const index = process.argv.indexOf(name);

  return index === -1 ? undefined : process.argv[index + 1];
}

function loadEnvFiles() {
  for (const envFilePath of [
    ".env",
    ".env.local",
    "../../.env",
    "../../.env.local",
  ]) {
    const resolvedPath = path.resolve(envFilePath);

    if (!existsSync(resolvedPath)) {
      continue;
    }

    for (const line of readFileSync(resolvedPath, "utf8").split(/\r?\n/)) {
      const trimmedLine = line.trim();

      if (!trimmedLine || trimmedLine.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmedLine.indexOf("=");

      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmedLine.slice(0, separatorIndex).trim();
      const value = trimmedLine.slice(separatorIndex + 1).trim();

      if (key && process.env[key] === undefined) {
        process.env[key] = value.replace(/^["']|["']$/g, "");
      }
    }
  }
}

function getDocumentIdOverride(modelId: string, locale: AppLocale) {
  const key = [
    "PRISMIC",
    modelId.toUpperCase(),
    locale.toUpperCase(),
    "DOCUMENT_ID",
  ].join("_");

  const value = process.env[key];

  return value?.trim() ? value.trim() : undefined;
}
