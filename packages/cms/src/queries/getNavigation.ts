import { createPrismicClient } from "../prismic/create-client";
import type { GetNavigationDocumentParams } from "../types/navigation.types";

/**
 * Generic singleton navigation query so apps can keep navigation fetching in the
 * shared CMS package without hardcoding one app's document type here.
 */
export async function getNavigationDocument<TDocument>({
  documentType,
  lang,
}: GetNavigationDocumentParams) {
  const client = createPrismicClient();

  return client.getSingle(documentType as never, {
    lang,
  }) as Promise<TDocument>;
}
