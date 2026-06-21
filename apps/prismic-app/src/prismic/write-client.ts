import * as prismic from "@prismicio/client";
import {
  getRepositoryName,
  getSharedEnvValue,
  prismicConfig,
} from "@repo/cms/prismic";

export function createPrismicWriteClient(options?: prismic.ClientConfig) {
  const writeToken = getSharedEnvValue("PRISMIC_WRITE_TOKEN");

  if (!writeToken) {
    throw new Error("PRISMIC_WRITE_TOKEN is required to seed Prismic content");
  }

  return prismic.createWriteClient(getRepositoryName(), {
    accessToken: prismicConfig.accessToken,
    routes: [...prismicConfig.routes],
    writeToken,
    ...options,
  });
}

export function createPrismicMigration() {
  return prismic.createMigration();
}
