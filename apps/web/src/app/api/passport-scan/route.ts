import { NextResponse } from "next/server";
import {
  PassportScanServiceError,
  scanPassportImage,
} from "@/services/passport-scan/passport-scan.server";

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      {
        error: "Passport image file is required.",
      },
      { status: 400 },
    );
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      {
        error: "Only image uploads are supported.",
      },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      {
        error: "Passport image is too large.",
      },
      { status: 413 },
    );
  }

  try {
    const result = await scanPassportImage(file);

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof PassportScanServiceError) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: error.status },
      );
    }

    const message = error instanceof Error ? error.message : "Passport scanning failed.";

    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 },
    );
  }
}
