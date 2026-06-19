export const prismicConfig = {
  repositoryName: process.env.PRISMIC_REPOSITORY_NAME ?? "",
  accessToken: process.env.PRISMIC_ACCESS_TOKEN,
  routes: [],
} as const;
