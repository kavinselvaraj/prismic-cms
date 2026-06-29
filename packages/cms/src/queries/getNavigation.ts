import { createPrismicClient } from "../prismic/create-client";
import type {
  GetNavigationDocumentOptions,
  GetNavigationDocumentParams,
} from "../types/navigation.types";

/**
 * Generic singleton navigation query so apps can keep navigation fetching in the
 * shared CMS package without hardcoding one app's document type here.
 */
export async function getNavigationDocument<TDocument>(
  { documentType, lang }: GetNavigationDocumentParams,
  options?: GetNavigationDocumentOptions<TDocument>,
) {
  const client = createPrismicClient({
    preview: options?.preview,
  });

  try {
    return (await client.getSingle(documentType as never, {
      lang,
    })) as TDocument;
  } catch (error) {
    if (options?.fallbackValue !== undefined) {
      return options.fallbackValue;
    }

    throw error;
  }
}
