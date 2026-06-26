import type { PassportScanResponse } from "@/utils/passport-scan";

const DEFAULT_TIMEOUT_MS = 45_000;
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;

export class PassportScanServiceError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "PassportScanServiceError";
    this.status = status;
  }
}

function resolvePassportScanServiceUrl(
  env = process.env.PASSPORT_SCAN_SERVICE_URL,
): string {
  if (!env?.trim()) {
    throw new Error("PASSPORT_SCAN_SERVICE_URL is not configured");
  }

  return env.trim();
}

function resolvePassportScanServiceToken(
  env = process.env.PASSPORT_SCAN_SERVICE_TOKEN,
): string | null {
  return env?.trim() ? env.trim() : null;
}

function isPassportScanResponse(value: unknown): value is PassportScanResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "candidateLines" in value &&
    "passportData" in value &&
    "processedPreviewDataUrl" in value &&
    "statusMessage" in value &&
    "transcript" in value
  );
}

type ScanServiceErrorPayload = {
  error?: string;
};

function createForwardFormData(file: File): FormData {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new PassportScanServiceError("Passport image is too large.", 413);
  }

  const formData = new FormData();
  formData.set("file", file, file.name || "passport-image");
  return formData;
}

export async function scanPassportImage(file: File): Promise<PassportScanResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(resolvePassportScanServiceUrl(), {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(resolvePassportScanServiceToken()
          ? {
              "x-api-key": resolvePassportScanServiceToken() as string,
            }
          : {}),
      },
      body: createForwardFormData(file),
      cache: "no-store",
      signal: controller.signal,
    });

    const payload = (await response.json().catch(() => undefined)) as
      | PassportScanResponse
      | ScanServiceErrorPayload
      | undefined;

    if (!response.ok) {
      throw new PassportScanServiceError(
        payload && "error" in payload && payload.error
          ? payload.error
          : "Passport scan service failed.",
        response.status,
      );
    }

    if (!isPassportScanResponse(payload)) {
      throw new PassportScanServiceError(
        "Passport scan service returned an invalid response.",
        502,
      );
    }

    return payload;
  } catch (error) {
    if (error instanceof PassportScanServiceError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new PassportScanServiceError("Passport scan service timed out.", 504);
    }

    throw new PassportScanServiceError(
      error instanceof Error ? error.message : "Passport scanning failed.",
      500,
    );
  } finally {
    clearTimeout(timeout);
  }
}
