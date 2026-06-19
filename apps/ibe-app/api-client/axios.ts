import { applyApiErrorInterceptor } from "@/api-client/interceptors/api-error.interceptor";
import { resolveMockData, urlMockMapper } from "@/api-client/url-mock-mapper";
import axios from "axios";

const backendBaseUrl =
  process.env.BACKEND_API_BASE_URL ?? "http://localhost:4000";

export const api = axios.create({
  baseURL: backendBaseUrl,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 30_000,
});

export const apiClient = axios.create({
  baseURL: "",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 30_000,
});

api.interceptors.request.use((config) => {
  const token = process.env.BACKEND_API_TOKEN;
  const shouldUseMock =
    process.env.API_SOURCE !== "backend" ||
    urlMockMapper.some(
      (item) =>
        item.useMock &&
        item.url === config.url &&
        (!item.method ||
          item.method.toLowerCase() === config.method?.toLowerCase()),
    );

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (shouldUseMock) {
    config.adapter = async () => ({
      data: resolveMockData(config),
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    });
  }

  return config;
});

applyApiErrorInterceptor(api);
applyApiErrorInterceptor(apiClient);
