import { searchRoutesServerService } from "@/modules/route-search/services/route-search.server.service";
import { getApiErrorMessage } from "@/modules/utils/common/api-error";
import type { SearchRoutesRequest } from "@/types/search-routes";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SearchRoutesRequest;
    const routes = await searchRoutesServerService(body);

    return NextResponse.json({ data: routes });
  } catch (error) {
    return NextResponse.json(
      {
        error: getApiErrorMessage(error, "Unable to search routes"),
      },
      { status: 502 },
    );
  }
}
