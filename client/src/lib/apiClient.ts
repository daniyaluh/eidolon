import axios, { AxiosError } from "axios";
import type { AxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/authStore";

const baseURL =
  import.meta.env.VITE_API_BASE_URL ??
  import.meta.env.VITE_API_URL ??
  "http://localhost:4000/api";

const axiosInstance = axios.create({ baseURL, withCredentials: true });

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function toApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const status = error.response?.status ?? 0;
    const message =
      (error.response?.data as { error?: string } | undefined)?.error ?? error.message;
    return new ApiError(message, status, error.response?.data);
  }
  return new ApiError("Unexpected error", 0);
}

axiosInstance.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = useAuthStore
      .getState()
      .refreshSession()
      .then(() => useAuthStore.getState().accessToken)
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (AxiosRequestConfig & { _retried?: boolean }) | undefined;
    const isAuthEndpoint = originalRequest?.url?.includes("/auth/");

    if (error.response?.status === 401 && originalRequest && !originalRequest._retried && !isAuthEndpoint) {
      originalRequest._retried = true;
      const newToken = await refreshAccessToken();

      if (newToken) {
        originalRequest.headers = { ...originalRequest.headers, Authorization: `Bearer ${newToken}` };
        return axiosInstance(originalRequest);
      }

      useAuthStore.getState().clearSession();
    }

    return Promise.reject(error);
  }
);

export const apiClient = {
  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    try {
      const res = await axiosInstance.get<T>(url, { params });
      return res.data;
    } catch (err) {
      throw toApiError(err);
    }
  },

  async post<T>(url: string, body?: unknown): Promise<T> {
    try {
      const res = await axiosInstance.post<T>(url, body);
      return res.data;
    } catch (err) {
      throw toApiError(err);
    }
  },

  async put<T>(url: string, body?: unknown): Promise<T> {
    try {
      const res = await axiosInstance.put<T>(url, body);
      return res.data;
    } catch (err) {
      throw toApiError(err);
    }
  },

  async patch<T>(url: string, body?: unknown): Promise<T> {
    try {
      const res = await axiosInstance.patch<T>(url, body);
      return res.data;
    } catch (err) {
      throw toApiError(err);
    }
  },

  async upload<T>(url: string, file: File): Promise<T> {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axiosInstance.post<T>(url, formData);
      return res.data;
    } catch (err) {
      throw toApiError(err);
    }
  },

  async delete<T>(url: string): Promise<T> {
    try {
      const res = await axiosInstance.delete<T>(url);
      return res.data;
    } catch (err) {
      throw toApiError(err);
    }
  },
};
