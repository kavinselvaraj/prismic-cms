import { createAuthorizedSdkClientContext } from "@repo/sdk";
import { cookies } from "next/headers";
import { SECURITY_TOKEN_COOKIE_NAME } from "./security-token";

export async function getSecurityToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SECURITY_TOKEN_COOKIE_NAME)?.value?.trim();

  return token || null;
}

export async function requireSecurityToken(): Promise<string> {
  const token = await getSecurityToken();

  if (!token) {
    throw new Error("Security token cookie is missing");
  }

  return token;
}

export async function getAuthorizedSdkClientContextForRequest() {
  const securityToken = await requireSecurityToken();

  return createAuthorizedSdkClientContext(securityToken);
}
