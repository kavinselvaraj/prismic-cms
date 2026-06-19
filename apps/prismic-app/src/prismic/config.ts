export const prismicConfig = {
  repositoryName: process.env.PRISMIC_REPOSITORY_NAME ?? "",
  accessToken: process.env.PRISMIC_ACCESS_TOKEN,
  routes: [
    {
      type: "home_page",
      path: "/:lang?",
    },
    {
      type: "about_page",
      path: "/:lang?/about",
    },
  ],
} as const;
