import * as prismic from "@prismicio/client";
import type { CmsPreviewState } from "../types/preview.types";
import { prismicConfig } from "./config";
import { getRepositoryName } from "./repository";

export type CreatePrismicClientOptions = prismic.ClientConfig & {
  preview?: CmsPreviewState;
};

export function createPrismicClient(options?: CreatePrismicClientOptions) {
  const { preview, ...clientOptions } = options ?? {};

  return prismic.createClient(getRepositoryName(), {
    accessToken: prismicConfig.accessToken,
    fetchOptions: preview?.enabled
      ? {
          ...clientOptions.fetchOptions,
          cache: "no-store",
        }
      : clientOptions.fetchOptions,
    ref: preview?.ref ?? clientOptions.ref,
    routes: [...prismicConfig.routes],
    ...clientOptions,
  });
}
