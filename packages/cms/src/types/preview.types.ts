export type CmsPreviewState = {
  enabled: boolean;
  ref?: string;
};

export type CmsQueryOptions = {
  preview?: CmsPreviewState;
};

export type CmsLocalizedQueryOptions = CmsQueryOptions & {
  fallbackLocales?: string[];
};
