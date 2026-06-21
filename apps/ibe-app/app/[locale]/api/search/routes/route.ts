import { searchRoutesServerService } from "@/modules/route-search/services/route-search.server.service";
import { getApiErrorMessage } from "@/modules/utils/common/api-error";
import type { SearchRoutesRequest } from "@/types/search-routes";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SearchRoutesRequest;
    console.log("[next-route] POST /api/search/routes", {
      body,
      runtime: "server",
    });
    const routes = await searchRoutesServerService(body);

    console.log("[next-route] RESPONSE /api/search/routes", {
      routeCount: routes.length,
      runtime: "server",
    });

    return NextResponse.json({ data: routes });
  } catch (error) {
    console.error("[next-route] ERROR /api/search/routes", error);
    return NextResponse.json(
      {
        error: getApiErrorMessage(error, "Unable to search routes"),
      },
      { status: 502 },
    );
  }
}
