/**
 * Stylists Service API
 * Handles service and stylist-service operations
 */

import apiClient from "./client";

// TypeScript interfaces
export interface Service {
  id: string;
  name: string;
  price: number;
  description?: string;
  duration?: number;
}

export const addServiceToStylist = async (data: {
  stylistId: string;
  serviceId: string;
  price?: number;
  duration?: number;
}) => {
  const res = await apiClient.post(`/stylist-services`, {
    stylistId: data.stylistId,
    serviceId: data.serviceId,
    price: data.price,
    duration: data.duration,
  });
  return res.data;
};

// Get all available services from database
export const getServices = async (): Promise<Service[]> => {
  const res = await apiClient.get(`/services`);
  return res.data;
};

// Get services for a specific stylist from database
export const getServicesForStylist = async (
  stylistId: string
): Promise<Service[]> => {
  const res = await apiClient.get(`/stylist-services?stylist_id=${stylistId}`);
  // Filter on frontend to ensure we only get the correct stylist's services
  const filteredData = Array.isArray(res.data)
    ? res.data.filter(
        (item: any) =>
          String(item.stylistId) === stylistId ||
          String(item.stylist_id) === stylistId
      )
    : [];
  return filteredData;
};

// Get service by ID from database
export const getServiceById = async (id: string): Promise<Service> => {
  const res = await apiClient.get(`/services/${id}`);
  return res.data;
};

// Fetch service names for given service IDs
export const fetchServiceNames = async (
  serviceIds: string[],
  serviceNames: { [key: string]: string },
  setServiceNames: (names: { [key: string]: string }) => void
) => {
  const newServiceNames = { ...serviceNames };
  const idsToFetch = serviceIds.filter((id) => !newServiceNames[id]);
  if (idsToFetch.length === 0) return;
  try {
    const promises = idsToFetch.map((id: string) => getServiceById(id));
    const services = await Promise.all(promises);
    services.forEach((service, index) => {
      if (service?.name) {
        newServiceNames[idsToFetch[index]] = service.name;
      }
    });
    setServiceNames(newServiceNames);
  } catch (error) {
    console.error("Failed to fetch service names", error);
  }
};

// Update service in database
export const updateService = async (
  id: string,
  data: { name?: string; description?: string; price?: number }
): Promise<Service> => {
  const res = await apiClient.put(`/stylist-services/${id}`, data);
  return res.data;
};

// Update stylist service (price, duration, etc.)
export const updateStylistService = async (
  id: string,
  data: { serviceId?: string; price?: number; duration?: number }
) => {
  const res = await apiClient.put(`/stylist-services/${id}`, data);
  return res.data;
};

// Update service category
export const updateServiceCategory = async (
  serviceId: string,
  category: string
) => {
  const res = await apiClient.put(`/services/${serviceId}`, { category });
  return res.data;
};

// Delete service from stylist
export const removeServiceFromStylist = async (
  stylistId: string,
  serviceId: string
) => {
  const res = await apiClient.delete(`/stylist-services`, {
    data: {
      stylistId: stylistId,
      serviceId: serviceId,
    },
  });
  return res.data;
};

// Delete stylist service by record ID
export const deleteStylistService = async (id: string) => {
  const res = await apiClient.delete(`/stylist-services/${id}`);
  return res.data;
};

// Create a new service and add it to stylist
export const createServiceAndAddToStylist = async (data: {
  stylistId: string;
  serviceName: string;
  price: number;
  description?: string;
  category?: string;
}) => {
  try {
    // First, check if the service already exists
    let existingServiceId: string | null = null;
    try {
      const allServicesRes = await apiClient.get(`/services`);
      const existingService = Array.isArray(allServicesRes.data)
        ? allServicesRes.data.find(
            (s: any) => s.name.toLowerCase() === data.serviceName.toLowerCase()
          )
        : null;
      if (existingService) {
        existingServiceId = existingService.id;
      }
    } catch (fetchErr) {
      // If fetching services fails, log but continue to try creating
      console.error("Error fetching services:", fetchErr);
    }

    let serviceIdToUse = existingServiceId;
    if (!serviceIdToUse) {
      // Create the new service if it doesn't exist
      const serviceRes = await apiClient.post(`/services`, {
        name: data.serviceName,
        description: data.description || `${data.serviceName} service`,
        category: data.category,
      });
      serviceIdToUse = serviceRes.data.id;
    }

    // Then, link the service to the stylist
    const linkRes = await apiClient.post(`/stylist-services`, {
      stylistId: String(data.stylistId),
      serviceId: String(serviceIdToUse),
      price: data.price,
    });
    return linkRes.data;
  } catch (error) {
    const err = error as any;
    if (err.response && err.response.data) {
      console.error("Service creation error:", err.response.data);
    } else if (err.message) {
      console.error("Service creation error:", err.message);
    } else {
      console.error("Service creation error:", err);
    }
    throw error;
  }
};

// Update both service name and stylist service data
export const updateStylistServiceWithName = async (
  stylistServiceId: string,
  serviceId: string,
  data: {
    serviceName?: string;
    price?: number;
    duration?: number;
    category?: string;      // add this
    description?: string;   // add this
  }
) => {
  try {
    // If service name needs to be updated, update the service record
    if (data.serviceName && serviceId) {
      const updatePayload = {
        name: data.serviceName,
        category: data.category,
        description: data.description,
        price: data.price
      };
      console.log('[DEBUG] Updating service:', serviceId, updatePayload);
      await apiClient.put(`/services/${serviceId}`, updatePayload);
    }

    // Update the stylist service record (price, duration)
    const updateData: any = {};
    if (data.price !== undefined) updateData.price = data.price;
    if (data.duration !== undefined) updateData.duration = data.duration;

    if (Object.keys(updateData).length > 0) {
      const res = await apiClient.put(
        `/stylist-services/${stylistServiceId}`,
        updateData
      );
      return res.data;
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating stylist service with name:", error);
    throw error;
  }
};
