import { PRISMIC_PREVIEW_COOKIE } from "@/prismic/preview";
import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const redirectTo = searchParams.get("redirect") ?? "/";
  const previewMode = await draftMode();
  previewMode.disable();

  const response = NextResponse.redirect(new URL(redirectTo, request.url));
  response.cookies.delete(PRISMIC_PREVIEW_COOKIE);

  return response;
}
