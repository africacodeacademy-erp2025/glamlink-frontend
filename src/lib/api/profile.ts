/**
 * Profile API
 * Handles user profile operations
 */

import apiClient from "./client";

// Profile interface
export interface UserProfile {
  country: string;
  subscriptionPlan: string;
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  location?: string;
  profilePicture?: string;
  role?: string;
  bio?: string;
  isActive?: boolean;
  rating?: number;
  totalReviews?: number;
  priceRangeMin?: number;
  priceRangeMax?: number;
  password?: string; // Backend includes this but we don't display it
  createdAt?: string;
  updatedAt?: string;
  paymentMethods?: string[];
}

// Get user profile by user ID
export const getUserProfileById = async (
  userId: string
): Promise<UserProfile> => {
  try {
    // Use only the working providers endpoint
    const response = await apiClient.get(`/providers/${userId}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error("Unauthorized: Please log in again");
    }
    if (error.response?.status === 404) {
      throw new Error("Stylist not found");
    }
    if (error.code === "ERR_NETWORK") {
      throw new Error("Network error: Please check your connection");
    }
    throw new Error(
      error.response?.data?.message || "Failed to fetch stylist profile"
    );
  }
};

// Update user profile by user ID
export const updateUserProfileById = async (
  userId: string,
  profileData: Partial<UserProfile>
): Promise<UserProfile> => {
  try {
    const response = await apiClient.put(`/providers/${userId}`, profileData);
    return response.data;
  } catch (error: any) {
    // Log the full error for debugging
    console.error(
      "Profile update error:",
      error.response?.data || error.message
    );
    if (error.response?.status === 401) {
      throw new Error("Unauthorized: Please log in again");
    }
    if (error.response?.status === 404) {
      throw new Error("Stylist not found for update");
    }
    if (error.response?.status === 400) {
      throw new Error("Invalid profile data: Please check your inputs");
    }
    if (error.code === "ERR_NETWORK") {
      throw new Error("Network error: Please check your connection");
    }
    throw new Error(
      error.response?.data?.message || "Failed to update profile"
    );
  }
};

// Upload profile picture for user by ID
export const uploadProfilePictureById = async (
  userId: string,
  file: File
): Promise<string> => {
  const formData = new FormData();
  formData.append("profilePicture", file);

  try {
    // Use only the working providers endpoint
    const response = await apiClient.post(
      `/providers/${userId}/upload-picture`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data.profilePictureUrl;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error("Unauthorized: Please log in again");
    }
    if (error.response?.status === 404) {
      throw new Error("Upload endpoint not found");
    }
    if (error.response?.status === 400) {
      throw new Error("Invalid file: Please select a valid image");
    }
    if (error.code === "ERR_NETWORK") {
      throw new Error("Network error: Please check your connection");
    }
    throw new Error(
      error.response?.data?.message || "Failed to upload picture"
    );
  }
};
