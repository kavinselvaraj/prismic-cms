import {
  SECURITY_TOKEN_COOKIE_NAME,
  SECURITY_TOKEN_TTL_SECONDS,
  type SecurityTokenResponse,
  createSecurityToken,
  createSecurityTokenCookieOptions,
} from "@/security/security-token";
import { NextResponse } from "next/server";

export async function POST() {
  const token = createSecurityToken();
  const payload: SecurityTokenResponse = {
    expiresInSeconds: SECURITY_TOKEN_TTL_SECONDS,
    reused: false,
  };

  const response = NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store",
    },
  });

  response.cookies.set(
    SECURITY_TOKEN_COOKIE_NAME,
    token,
    createSecurityTokenCookieOptions(),
  );

  return response;
}
