/**
 * API Configuration
 *
 * This file centralizes all API-related configuration.
 * Change the BACKEND_URL here to point to your backend server.
 */

// Backend API URL - Change this to your actual backend URL
// To use proxy even in production (temporary CORS workaround), set NEXT_PUBLIC_USE_PROXY=true
// For proper production setup, configure CORS on the backend instead
export const BACKEND_URL =
  process.env.NEXT_PUBLIC_USE_PROXY === "true"
    ? "/api/proxy" // Use proxy if explicitly enabled
    : process.env.NODE_ENV === "development"
      ? "/api/proxy" // Use proxy in development
      : process.env.NEXT_PUBLIC_BACKEND_URL ||
        "https://glamlink-api.africacodefoundry.com"; // Direct backend in production

// Frontend URL - Used for redirects and callbacks
export const FRONTEND_URL =
  process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

// API Configuration
export const API_CONFIG = {
  backend: BACKEND_URL,
  frontend: FRONTEND_URL,
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
};

// API Endpoints - Centralized endpoint definitions
export const API_ENDPOINTS = {
  auth: {
    login: `${BACKEND_URL}/auth/login`,
    register: `${BACKEND_URL}/auth/register`,
    profile: `${BACKEND_URL}/auth/profile`,
  },
  bookings: {
    base: `${BACKEND_URL}/bookings`,
    byProvider: (providerId: string) =>
      `${BACKEND_URL}/bookings/provider/${providerId}`,
    byId: (id: string) => `${BACKEND_URL}/bookings/${id}`,
    updateStatus: (id: string) => `${BACKEND_URL}/bookings/${id}/status`,
    reschedule: (id: string) => `${BACKEND_URL}/bookings/${id}/reschedule`,
  },
  services: {
    base: `${BACKEND_URL}/services`,
    byId: (id: string) => `${BACKEND_URL}/services/${id}`,
    byStylist: (stylistId: string) =>
      `${BACKEND_URL}/services/stylist/${stylistId}`,
  },
  timeslots: {
    base: `${BACKEND_URL}/timeslots`,
    byId: (id: string) => `${BACKEND_URL}/timeslots/${id}`,
  },
  profile: {
    base: `${BACKEND_URL}/profile`,
    byId: (id: string) => `${BACKEND_URL}/profile/${id}`,
  },
  paymentMethods: {
    base: `${BACKEND_URL}/payment-methods`,
    byId: (id: string) => `${BACKEND_URL}/payment-methods/${id}`,
  },
};

export default API_CONFIG;
