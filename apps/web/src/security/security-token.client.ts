export async function handleUnauthorizedSdkResponse() {
  try {
    await fetch("/api/security-token", {
      cache: "no-store",
      credentials: "same-origin",
      method: "DELETE",
    });
  } finally {
    window.location.assign("/");
  }
}
