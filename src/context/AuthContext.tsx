"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, logout } from "@/lib/api/auth";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  [key: string]: any; // for extra fields
}

interface AuthContextProps {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  loginUser: (userData: AuthUser, token: string) => void;
  logoutUser: () => void;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = getCurrentUser();
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const userId =
      typeof window !== "undefined" ? localStorage.getItem("userId") : null;

    if (storedUser && token) {
      // Ensure the user object has the required fields
      const normalizedUser: AuthUser = {
        id: storedUser.id || userId || "0",
        name: storedUser.name || storedUser.username || "Unknown User",
        email: storedUser.email || "",
        ...storedUser,
      };

      setUser(normalizedUser);
    } else {
      setUser(null);
      // Clear any invalid storage
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");
        localStorage.removeItem("userId");
        localStorage.removeItem("stylist_id");
      }
    }

    setLoading(false);
  }, []);

  // Function to manually refresh auth state
  const refreshAuthState = () => {
    const storedUser = getCurrentUser();
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const userId =
      typeof window !== "undefined" ? localStorage.getItem("userId") : null;

    if (storedUser && token) {
      const normalizedUser: AuthUser = {
        id: storedUser.id || userId || "0",
        name: storedUser.name || storedUser.username || "Unknown User",
        email: storedUser.email || "",
        ...storedUser,
      };

      setUser(normalizedUser);
    } else {
      setUser(null);
    }
  };

  // Listen for storage changes (e.g., after login)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token" || e.key === "userInfo") {
        refreshAuthState();
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
    }
  }, []);

  const loginUser = (userData: AuthUser, token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
      localStorage.setItem("userInfo", JSON.stringify(userData));
      localStorage.setItem("userId", userData.id.toString());

      // If stylist_id is in userData, store it too
      if (userData.stylist_id) {
        localStorage.setItem("stylist_id", userData.stylist_id.toString());
      }
    }

    setUser(userData);
  };

  const logoutUser = () => {
    logout();
    setUser(null);
  };

  // Add debug logging

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        loginUser,
        logoutUser,
        refreshAuth: refreshAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
