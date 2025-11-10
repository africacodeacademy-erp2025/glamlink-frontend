/**
 * Timeslots API
 * Handles time slot management for stylists
 */

import apiClient from "./client";
import { getCurrentStylistId } from "./auth";

export interface Slot {
  id: string;
  startTime?: string;
  start_time?: string;
  endTime?: string;
  end_time?: string;
  date?: string;
  isAvailable?: boolean;
  stylistId?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface CreateSlotData {
  startTime: string;
  endTime: string;
  date: string;
  stylistId: string;
  description?: string;
}

export const updateSlotBookedStatus = async (
  slotId: string,
  isBooked: boolean
): Promise<void> => {
  try {
    await apiClient.patch(`/timeslots/${slotId}/status`, { status: isBooked });
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to update slot status"
    );
  }
};

// Update a timeslot by ID
export const updateTimeSlot = async (
  slotId: string,
  updateData: Partial<CreateSlotData>
): Promise<Slot> => {
  if (!slotId || typeof slotId !== 'string' || slotId.trim() === '') {
    throw new Error('Invalid or missing timeslot id.');
  }
  try {
  const res = await apiClient.patch(`/timeslots/${slotId.trim()}`, updateData);
    return res.data;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      error?.toString() ||
      'Failed to update time slot';
    throw new Error(errorMsg);
  }
};

export const getSlotById = async (id: string): Promise<Slot> => {
  try {
    const res = await apiClient.get(`/timeslots/${id}`);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch slot");
  }
};

export const getAvailableSlots = async (stylistId: string): Promise<Slot[]> => {
  const res = await apiClient.get(`/slots?stylistId=${stylistId}`);
  return res.data;
};

export const createTimeSlot = async (
  slotData: CreateSlotData
): Promise<Slot> => {
  // Use the current logged-in stylist ID if not provided
  const stylistId = slotData.stylistId || getCurrentStylistId();
  if (!stylistId) {
    throw new Error("No stylist ID available. Please log in again.");
  }

  // Clean the date to be just YYYY-MM-DD format
  const cleanDate = slotData.date.split("T")[0]; // Remove time portion if present

  // Parse the time input (HH:MM format)
  const [startHour, startMinute] = slotData.startTime.split(":").map(Number);
  const [endHour, endMinute] = slotData.endTime.split(":").map(Number);

  // Format as ISO strings with the exact time values in UTC
  // This preserves the time the user selected when displayed with getUTCHours()
  const startDateTime = `${cleanDate}T${String(startHour).padStart(
    2,
    "0"
  )}:${String(startMinute).padStart(2, "0")}:00.000Z`;
  const endDateTime = `${cleanDate}T${String(endHour).padStart(
    2,
    "0"
  )}:${String(endMinute).padStart(2, "0")}:00.000Z`;

  const requestData = {
    provider_id: stylistId,
    datetime: startDateTime,
    start_time: slotData.startTime,
    end_time: slotData.endTime,
    date: cleanDate,
    is_available: true,
  };

  try {
    const res = await apiClient.post(`/timeslots`, requestData);
    return res.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error("Unauthorized: Please log in again");
    }
    if (error.response?.status === 400) {
      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        JSON.stringify(error.response?.data);
      throw new Error(
        `Backend validation failed: ${backendMessage}. Sent data: ${JSON.stringify(
          requestData
        )}`
      );
    }
    if (error.response?.status === 500) {
      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        JSON.stringify(error.response?.data);
      throw new Error(`Server error: ${backendMessage}`);
    }
    if (error.code === "ERR_NETWORK") {
      throw new Error("Network error: Please check your connection");
    }
    throw new Error(
      error.response?.data?.message || "Failed to create time slot"
    );
  }
};

export const getTimeSlotsByStylist = async (
  providedStylistId?: string
): Promise<Slot[]> => {
  // Use the provided stylist ID or get the current logged-in stylist ID
  const stylistId = providedStylistId || getCurrentStylistId();
  if (!stylistId) {
    throw new Error("No stylist ID available. Please log in again.");
  }

  try {
    // Use the correct endpoint format: /timeslots/provider/:provider_id
    const res = await apiClient.get(`/timeslots/provider/${stylistId}`);
    return res.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error("Unauthorized: Please log in again");
    }
    if (error.response?.status === 404) {
      throw new Error("No time slots found for this stylist");
    }
    if (error.code === "ERR_NETWORK") {
      throw new Error("Network error: Please check your connection");
    }
    throw new Error(
      error.response?.data?.message || "Failed to fetch time slots"
    );
  }
};

// Fetch slot times for given slot IDs
export const fetchSlotTimes = async (
  slotIds: string[],
  slotTimes: { [key: string]: string },
  setSlotTimes: (times: { [key: string]: string }) => void
) => {
  const newSlotTimes = { ...slotTimes };
  const idsToFetch = slotIds.filter((id) => !newSlotTimes[id]);
  if (idsToFetch.length === 0) return;
  try {
    const promises = idsToFetch.map((id) => getSlotById(id));
    const slots = await Promise.all(promises);
    slots.forEach((slot, index) => {
      const startTime =
        slot?.startTime ||
        slot?.start_time ||
        slot?.bookingTime ||
        slot?.booking_time;
      if (startTime) {
        newSlotTimes[idsToFetch[index]] = startTime;
      }
    });
    setSlotTimes(newSlotTimes);
  } catch (error) {
    console.error("Failed to fetch slot times", error);
  }
};

// Delete a timeslot (no body, no content-type header)
export const deleteTimeSlot = async (
  slotId: string,
  notify?: (msg: string, type?: "success" | "error") => void
): Promise<void> => {
  if (!slotId || typeof slotId !== 'string' || slotId.trim() === '') {
    const msg = 'Invalid or missing timeslot id.';
    if (notify) notify(msg, "error");
    throw new Error(msg);
  }
  try {
    await apiClient.delete(`/timeslots/${slotId.trim()}`);
    if (notify) notify('Timeslot deleted successfully', "success");
  } catch (error: any) {
    // Try to extract a meaningful message
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      error?.toString() ||
      "Failed to delete time slot";
    if (notify) notify(errorMsg, "error");
    throw new Error(errorMsg);
  }
};
