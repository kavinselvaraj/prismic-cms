import { PRISMIC_PREVIEW_COOKIE } from "@/prismic/preview";
import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const configuredSecret = process.env.PRISMIC_PREVIEW_SECRET;

  if (configuredSecret && secret !== configuredSecret) {
    return NextResponse.json(
      {
        message: "Invalid preview secret.",
      },
      {
        status: 401,
      },
    );
  }

  const ref = searchParams.get("ref") ?? searchParams.get("token");

  if (!ref) {
    return NextResponse.json(
      {
        message: "Missing Prismic preview ref.",
      },
      {
        status: 400,
      },
    );
  }

  const redirectTo =
    searchParams.get("redirect") ?? searchParams.get("slug") ?? "/";
  const previewMode = await draftMode();
  previewMode.enable();

  const response = NextResponse.redirect(new URL(redirectTo, request.url));
  response.cookies.set(PRISMIC_PREVIEW_COOKIE, ref, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });

  return response;
}
