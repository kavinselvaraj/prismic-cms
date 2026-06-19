import type { Config } from "prismic-ts-codegen";

const config: Config = {
  output: "../../packages/cms/src/generated/prismicio-types.d.ts",
  models: [
    "./customtypes/**/index.json",
    "../../packages/cms/src/slices/**/model.json",
  ],
};

export default config;
