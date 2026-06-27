export const SECURITY_TOKEN_COOKIE_NAME = "ibe_security_token";
export const SECURITY_TOKEN_HEADER_NAME = "x-security-token";
export const SECURITY_TOKEN_TTL_SECONDS = 30 * 60;

export type SecurityTokenResponse = {
  expiresInSeconds: number;
  reused: boolean;
};

export function createSecurityToken(): string {
  return `st_${crypto.randomUUID()}`;
}

export function createSecurityTokenCookieOptions() {
  return {
    httpOnly: true,
    maxAge: SECURITY_TOKEN_TTL_SECONDS,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export function createSecurityTokenClearedCookieOptions() {
  return {
    ...createSecurityTokenCookieOptions(),
    expires: new Date(0),
    maxAge: 0,
  };
}
