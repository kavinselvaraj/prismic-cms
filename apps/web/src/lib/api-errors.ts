import { SdkRequestError } from "@repo/sdk";

export type AppApiError = {
  code: string;
  message: string;
  status: number | null;
};

export function getAppApiError(error: unknown): AppApiError {
  if (error instanceof SdkRequestError) {
    return {
      code: sdkStatusCodeToCode(error.status),
      message: sdkStatusCodeToMessage(error.status),
      status: error.status,
    };
  }

  if (error instanceof Error) {
    return {
      code: "UNKNOWN_ERROR",
      message: error.message,
      status: null,
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    message: "Something went wrong.",
    status: null,
  };
}

export function isRetryableAppApiError(status: number | null): boolean {
  return status === 500 || status === 501 || status === 502 || status === 503;
}

function sdkStatusCodeToCode(status: number | null): string {
  switch (status) {
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 500:
      return "INTERNAL_SERVER_ERROR";
    case 501:
      return "NOT_IMPLEMENTED";
    case 502:
      return "BAD_GATEWAY";
    case 503:
      return "SERVICE_UNAVAILABLE";
    default:
      return "SDK_REQUEST_FAILED";
  }
}

function sdkStatusCodeToMessage(status: number | null): string {
  switch (status) {
    case 401:
      return "Your session has expired. Please sign in again.";
    case 403:
      return "You do not have permission to view this data.";
    case 404:
      return "The requested resource could not be found.";
    case 500:
      return "The service is temporarily unavailable.";
    case 501:
      return "This operation is not implemented.";
    case 502:
      return "The upstream service returned a bad gateway error.";
    case 503:
      return "The service is currently unavailable.";
    default:
      return "The request failed.";
  }
}
