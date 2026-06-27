import { NextResponse, type NextRequest } from "next/server";

type ErrorDemoParams = {
  params: Promise<{
    status: string;
  }>;
};

const STATUS_MESSAGES: Record<number, { detail: string; error: string }> = {
  401: {
    detail: "Authentication is required for this scenario.",
    error: "Unauthorized",
  },
  403: {
    detail: "The authenticated user does not have access to this resource.",
    error: "Forbidden",
  },
  404: {
    detail: "The requested record could not be found.",
    error: "Not Found",
  },
  500: {
    detail: "An unexpected server error occurred.",
    error: "Internal Server Error",
  },
  501: {
    detail: "This operation is not implemented on the server.",
    error: "Not Implemented",
  },
  502: {
    detail: "The upstream service returned an invalid response.",
    error: "Bad Gateway",
  },
  503: {
    detail: "The service is temporarily unavailable.",
    error: "Service Unavailable",
  },
};

function buildResponse(status: number) {
  const payload =
    STATUS_MESSAGES[status] ?? {
      detail: "This status code is not wired in the demo.",
      error: "Unsupported status",
    };

  return NextResponse.json(
    {
      detail: payload.detail,
      error: payload.error,
      status,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
      status,
    },
  );
}

export async function GET(_request: NextRequest, { params }: ErrorDemoParams) {
  const { status } = await params;
  const parsedStatus = Number.parseInt(status, 10);

  if (!Number.isInteger(parsedStatus) || parsedStatus < 100) {
    return NextResponse.json(
      {
        detail: "The status parameter must be a valid HTTP status code.",
        error: "Bad Request",
        status: 400,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
        status: 400,
      },
    );
  }

  return buildResponse(parsedStatus);
}
