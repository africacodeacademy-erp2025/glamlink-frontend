/**
 * Authentication API
 * Handles user registration, login, and auth state management
 */

import axios from "axios";
import { BACKEND_URL } from "@/config/api";
import apiClient from "./client";

// Use centralized backend URL from config
const API_URL = BACKEND_URL;

export interface RegisterData {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  location: string;
  country: string;
  priceRangeMin: number;
  priceRangeMax: number;
  subscription_plan: string; 
}

export interface LoginData {
  email: string;
  password: string;
}

export const register = async (data: RegisterData) => {
  // Convert plan to subscription_plan if present
  const payload = { ...data };
  if ((data as any).plan) {
    payload.subscription_plan = (data as any).plan;
    delete (payload as any).plan;
  }
  // Debug: log registration payload
  console.log('Submitting registration:', payload);
  const res = await axios.post(`${API_URL}/auth/register`, payload);
  return res.data;
};

export const login = async (data: LoginData) => {
  try {
    // Note: Using axios directly here since login is the point where we GET the token
    const res = await axios.post(`${API_URL}/auth/login`, data);

    // Check if we have any user identification data in the response
    const possibleId = String(
      res.data?.id ||
        res.data?.user?.id ||
        res.data?.stylist?.id ||
        res.data?.userId ||
        res.data?.stylistId ||
        ""
    );
    const possibleName =
      res.data?.name ||
      res.data?.user?.name ||
      res.data?.stylist?.name ||
      res.data?.username;
    const possibleEmail =
      res.data?.email || res.data?.user?.email || res.data?.stylist?.email;

    if (res.data && res.data.token) {
      if (typeof window !== "undefined") {
        localStorage.setItem("token", res.data.token);

        // Normalize user object - handle different possible structures
        let userObj = res.data.user || res.data.stylist || res.data || {};

        // Ensure we have the essential fields
        if (!userObj.id && res.data.id) userObj.id = String(res.data.id);
        if (!userObj.name && res.data.name) userObj.name = res.data.name;
        if (!userObj.email && res.data.email) userObj.email = res.data.email;

        if (userObj.id) {
          localStorage.setItem("userInfo", JSON.stringify(userObj));
          localStorage.setItem("userId", String(userObj.id));
        }

        // Handle stylist_id from various possible locations
        const stylistId =
          res.data.stylist_id || userObj.stylist_id || res.data.id;
        if (stylistId) {
          localStorage.setItem("stylist_id", String(stylistId));
        }
      }
    } else if (possibleId) {
      // If we have some user data but no token, try to work with it
      if (typeof window !== "undefined") {
        const tempToken = "temp_token_" + Date.now();
        const extractedUser = {
          id: possibleId,
          name: possibleName || "Stylist User",
          email: possibleEmail || data.email,
        };

        localStorage.setItem("token", tempToken);
        localStorage.setItem("userInfo", JSON.stringify(extractedUser));
        localStorage.setItem("userId", extractedUser.id);
        localStorage.setItem("stylist_id", extractedUser.id);
      }
    } else {
      // As a last resort, we could make an additional API call to get user info
      // if we know the login was successful (status 200)
      if (res.status === 200) {
        try {
          // Try to get current user info from a profile endpoint
          const profileRes = await axios.get(`${API_URL}/auth/profile`, {
            headers: {
              Authorization: `Bearer temp_token_${Date.now()}`,
            },
          });

          if (profileRes.data?.id) {
            const profileUser = {
              id: String(profileRes.data.id),
              name: profileRes.data.name || "Stylist User",
              email: profileRes.data.email || data.email,
            };

            const tempToken = "temp_token_" + Date.now();
            localStorage.setItem("token", tempToken);
            localStorage.setItem("userInfo", JSON.stringify(profileUser));
            localStorage.setItem("userId", profileUser.id);
            localStorage.setItem("stylist_id", profileUser.id);
          }
        } catch (profileError) {
          // Final fallback - ask user for their ID or redirect to manual setup
        }
      }
    }

    return res.data;
  } catch (error) {
    throw error;
  }
};

// Helper function to get current stylist ID
export const getCurrentStylistId = (): string | null => {
  if (typeof window !== "undefined") {
    const stylistId = localStorage.getItem("stylist_id");
    const userId = localStorage.getItem("userId");
    // Try stylist_id first, then fallback to userId
    const id = stylistId || userId;
    return id || null;
  }
  return null;
};

// Helper function to get current user info
export const getCurrentUser = () => {
  if (typeof window !== "undefined") {
    try {
      const userInfo = localStorage.getItem("userInfo");
      if (userInfo) {
        const parsed = JSON.parse(userInfo);
        return parsed;
      }
    } catch (error) {
      // Clear corrupted data
      localStorage.removeItem("userInfo");
    }
  }
  return null;
};

// Helper function to check if user is logged in
export const isLoggedIn = (): boolean => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    const userInfo = localStorage.getItem("userInfo");

    return !!token && !!userInfo;
  }
  return false;
};

// Helper function to logout and clear storage
export const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("stylist_id");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("userId");
  }
};
