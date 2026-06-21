import { apiEndpoints } from "@/api-client/api-endpoints";
import { apiClient } from "@/api-client/axios";
import type { SearchRoute, SearchRoutesRequest } from "@/types/search-routes";

type SearchRoutesResponse = {
  data: SearchRoute[];
};

export async function searchRoutesClientService(params: {
  locale: string;
  request: SearchRoutesRequest;
}) {
  const { locale, request } = params;
  const url = apiEndpoints.searchRoutes(locale);

  console.log("[client-service] POST", url, {
    request,
    runtime: "browser",
  });

  const response = await apiClient.post<SearchRoutesResponse>(
    url,
    request,
  );

  console.log("[client-service] RESPONSE", url, {
    routeCount: response.data.data.length,
    runtime: "browser",
  });

  return response.data.data;
}
