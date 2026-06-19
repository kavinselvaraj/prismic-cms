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
  const response = await apiClient.post<SearchRoutesResponse>(
    apiEndpoints.searchRoutes(locale),
    request,
  );

  return response.data.data;
}
