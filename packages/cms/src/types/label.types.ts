export type LabelSource = "local" | "prismic" | "backend";

export type PrismicLabelDocument = {
  modelId: string;
  modelType: "page" | "custom";
  content: Record<string, unknown>;
  page?: string;
  uid?: string;
};

export type CreateLabelServiceOptions<
  TMessages extends Record<string, unknown>,
> = {
  applicationName: string;
  defaultLocale: string;
  locales: readonly string[];
  localMessages: Record<string, TMessages>;
  labelContract: TMessages;
  parentDocumentType: string;
  prismicLocaleMap: Record<string, string>;
};

export type PrismicDocumentData = Record<string, unknown>;

export type PrismicDocumentMap = Record<
  string,
  {
    data: PrismicDocumentData;
  }
>;

export type PrismicParentDocument = {
  id: string;
  lang: string;
  data: Record<string, unknown>;
};

export type PrismicChildDocument = {
  id: string;
  type: string;
  lang: string;
  data: Record<string, unknown>;
};
