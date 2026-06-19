import type { AxiosError, AxiosInstance } from "axios";

type ApiErrorResponse = {
  error?: string;
  message?: string;
};

export function applyApiErrorInterceptor(instance: AxiosInstance) {
  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiErrorResponse>) => {
      const message =
        error.response?.data?.error ??
        error.response?.data?.message ??
        error.message ??
        "Something went wrong";

      return Promise.reject(new Error(message));
    },
  );
}
