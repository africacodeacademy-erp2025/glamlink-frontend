/**
 * Centralized Axios Client
 *
 * This file provides a configured axios instance with:
 * - Automatic authentication token handling
 * - Global error handling
 * - Base URL configuration
 * - Request/response interceptors
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_CONFIG } from "@/config/api";

// Create axios instance with default configuration
export const apiClient = axios.create({
  baseURL: API_CONFIG.backend,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
  withCredentials: false, // Set to true if backend requires cookies/credentials
});

// Request interceptor - automatically attach auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    // If token exists, add it to headers
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle common errors globally
apiClient.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  (error: AxiosError) => {
    // Handle common HTTP errors
    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 401:
          // Unauthorized - token might be expired
          console.error("Unauthorized access - please login again");
          // Optionally redirect to login or trigger logout
          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            // You can dispatch an event or use a state management solution here
          }
          break;

        case 403:
          console.error("Forbidden - insufficient permissions");
          break;

        case 404:
          console.error("Resource not found");
          break;

        case 500:
          console.error("Internal server error");
          break;

        case 503:
          console.error("Service unavailable");
          break;
      }
    } else if (error.code === "ERR_NETWORK") {
      console.error("Network error - please check your connection");
    } else if (error.code === "ECONNABORTED") {
      console.error("Request timeout - please try again");
    }

    return Promise.reject(error);
  }
);

export default apiClient;
