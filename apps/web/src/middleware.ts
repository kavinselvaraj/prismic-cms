import { SecurityTokenApi, createSdkClientContext } from "@repo/sdk";
import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { SECURITY_TOKEN_COOKIE_NAME } from "./security/security-token";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const response = intlMiddleware(request);
  const existingSecurityToken = request.cookies.get(
    SECURITY_TOKEN_COOKIE_NAME,
  )?.value;

  if (!existingSecurityToken) {
    const context = createSdkClientContext({
      baseUrl: request.nextUrl.origin,
    });
    const securityTokenApi = context.getApi(SecurityTokenApi);
    const tokenResponse = await securityTokenApi.createSecurityTokenRaw({
      cache: "no-store",
    });

    const setCookieHeader = tokenResponse.raw.headers.get("set-cookie");

    if (setCookieHeader) {
      response.headers.append("set-cookie", setCookieHeader);
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
