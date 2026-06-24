import {
  type PrismicLabelDocument,
  getPrismicDocuments,
  getSharedEnvValue,
  loadSharedEnvIntoProcessEnv,
} from "@repo/cms/prismic";
import { createFieldId, createPrismicModel } from "./generate-prismic-models";
import {
  getPrismicLabelSource,
  loadPrismicLabelMessages,
} from "./label-source-loader";

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

const locale = readArgValue("--locale") ?? "en";
const shouldWrite = process.argv.includes("--write");
const prismicLocale = toPrismicLocale(locale);

loadSharedEnvIntoProcessEnv();

const labelSource = getPrismicLabelSource(readArgValue("--source"));
const documents = getPrismicDocuments(
  loadPrismicLabelMessages(labelSource, locale),
);

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
  document: PrismicLabelDocument,
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

function createPrismicDocumentData(document: PrismicLabelDocument) {
  const model = createPrismicModel(document);
  const fields = Object.values(model.json).reduce<
    Record<
      string,
      PrismicSeedField
    >
  >((accumulator, tabFields) => ({ ...accumulator, ...tabFields }), {});
  const data: Record<string, unknown> = {};

  for (const [pathKey, value] of flattenObject(document.content)) {
    const fieldId = createFieldId(`${document.modelId}.${pathKey}`);
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
  field: PrismicSeedField;
  value: unknown;
}) {
  if (field.type === "Group") {
    return toPrismicGroupValue(value, field.config.fields);
  }

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

function toPrismicGroupValue(
  value: unknown,
  fields: Record<string, PrismicSeedField>,
) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(fields).map(([key, nestedField]) => [
        key,
        toPrismicFieldValue({
          field: nestedField,
          value: (item as Record<string, unknown>)[key],
        }),
      ]),
    );
  });
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

function createDocumentTitle(document: PrismicLabelDocument) {
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

function getDocumentIdOverride(modelId: string, locale: string) {
  const key = [
    "PRISMIC",
    modelId.toUpperCase(),
    locale.toUpperCase(),
    "DOCUMENT_ID",
  ].join("_");

  const value = getSharedEnvValue(key);

  return value?.trim() ? value.trim() : undefined;
}

type PrismicSeedField =
  | {
      type: "StructuredText" | "Text" | "UID";
      config?: {
        label?: string;
        single?: string;
      };
    }
  | {
      type: "Group";
      config: {
        label: string;
        repeat: true;
        fields: Record<string, PrismicSeedField>;
      };
    };
