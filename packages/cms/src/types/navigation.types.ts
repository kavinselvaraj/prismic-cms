export type GetNavigationDocumentParams = {
  documentType: string;
  lang?: string;
};

export type GetNavigationDocumentOptions<TDocument = unknown> = {
  fallbackValue?: TDocument | null;
  preview?: import("./preview.types").CmsPreviewState;
};
