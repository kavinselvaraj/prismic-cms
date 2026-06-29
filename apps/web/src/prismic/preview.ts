import type { CmsPreviewState } from "@repo/cms";
import { cookies, draftMode } from "next/headers";

export const PRISMIC_PREVIEW_COOKIE = "io.prismic.preview";

export async function getCmsPreviewState(): Promise<CmsPreviewState> {
  const previewMode = await draftMode();

  if (!previewMode.isEnabled) {
    return {
      enabled: false,
    };
  }

  const cookieStore = await cookies();

  return {
    enabled: true,
    ref: cookieStore.get(PRISMIC_PREVIEW_COOKIE)?.value,
  };
}
