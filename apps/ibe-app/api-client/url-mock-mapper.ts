import { backendEndpoints } from "@/api-client/endpoints";
import { mockSearchRoutes } from "@/mock/search-routes.mock";
import type { InternalAxiosRequestConfig, Method } from "axios";

type UrlMockMapperItem = {
  url: string;
  method?: Method;
  mockData: unknown;
  useMock: boolean;
};

export const urlMockMapper: UrlMockMapperItem[] = [
  {
    url: backendEndpoints.searchRoutes,
    method: "get",
    mockData: mockSearchRoutes,
    useMock: false,
  },
];

export function resolveMockData(config: InternalAxiosRequestConfig) {
  const mapper = urlMockMapper.find((item) => {
    const isSameUrl = normalizeUrl(config.url) === normalizeUrl(item.url);
    const isSameMethod =
      !item.method ||
      item.method.toLowerCase() === config.method?.toLowerCase();

    return isSameUrl && isSameMethod;
  });

  return mapper?.mockData;
}

function normalizeUrl(url?: string) {
  return url?.replace(/^https?:\/\/[^/]+/, "").replace(/\/$/, "") ?? "";
}
