"use client";

import React, { useState, useEffect } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  addServiceToStylist,
  getServicesForStylist,
  getServiceById,
  getServices,
  updateStylistService,
  removeServiceFromStylist,
  deleteStylistService,
  createServiceAndAddToStylist,
  updateStylistServiceWithName,
  Service,
} from "@/lib/api/stylists-service";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ServicesPage() {
  const [editDescription, setEditDescription] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const { user, isAuthenticated, loading } = useAuth();

  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Modal state for add service
  const [showAddModal, setShowAddModal] = useState(false);
  const [serviceName, setServiceName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);

  // Modal state for edit service
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [editServiceName, setEditServiceName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Category dropdown state and services from backend
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const [allServices, setAllServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);

  const filteredAllServices = allServices.filter((s: Service) =>
    selectedCategory === "All" ? true : ((s as any).category || "Uncategorized") === selectedCategory
  );

  // Greeting logic
  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning,";
    if (hour < 18) return "Good afternoon,";
    return "Good evening,";
  })();

  // Helper to clear current list
  const clearAllServices = () => {
    setServices([]);
  };

  // Fetch services for this user
  const fetchServices = async () => {
    if (!user) {
      return;
    }

    try {
      setIsLoading(true);
      setIsError(false);

      // fetch stylist-specific linked services
      const data = await getServicesForStylist(String(user.id));

      // For each stylist service, fetch the service details
      const processedServices = await Promise.all(
        Array.isArray(data)
          ? data.map(async (item: any) => {
              const serviceDetails = await getServiceById(String(item.serviceId));
              return {
                id: item.id,
                name: serviceDetails.name,
                price: item.price || 0,
                description: serviceDetails.description,
                duration: item.duration,
                serviceId: item.serviceId,
                category: (serviceDetails as any).category || "Uncategorized",
              } as any;
            })
          : []
      );

      setServices(processedServices as any);

      // fetch all available services and categories
      const all = await getServices();
      setAllServices(all as Service[]);
      const cats = Array.from(
        new Set(["All", ...all.map((s: any) => (s.category || "Uncategorized"))])
      );
      setCategories(cats);
    } catch (error) {
      setIsError(true);
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      // Fetch services for this specific stylist from stylist-services table
      fetchServices();
    }
  }, [user, loading, isAuthenticated]);

  // Handle add service
  const handleAddService = async () => {
  if (!serviceName || !price || !user || !category) return;

    try {
      setIsCreating(true);

      const serviceData = {
        stylistId: String(user.id),
        serviceName: serviceName,
        price: Number(price),
        category: category,
        description: description,
      };

      await createServiceAndAddToStylist(serviceData);

  setServiceName("");
  setPrice("");
  setCategory("");
  setDescription("");
      setShowAddModal(false);
      setMessage('Service added successfully!');
      await fetchServices();
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setError("Failed to add service. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  // Handle edit service
  const handleEditService = (service: any) => {
  setEditingService(service);
  setEditServiceName(getServiceName(service));
  setEditPrice(service.price?.toString() || "");
  setEditCategory(service.category || "");
  setEditDescription(service.description || "");
  setShowEditModal(true);
  };

  // Handle update service
  const handleUpdateService = async () => {
  if (!editServiceName || !editPrice || !user || !editingService) return;

    setIsUpdating(true);
    try {
      const result = await updateStylistServiceWithName(
        editingService.id,
        editingService.serviceId,
        {
          serviceName: editServiceName,
          price: parseFloat(editPrice),
          category: editCategory,
          description: editDescription,
        }
      );

  setMessage('Service updated successfully!');
  setTimeout(() => setMessage(''), 3000);
  setShowEditModal(false);
  setEditingService(null);
  setEditServiceName("");
  setEditPrice("");
  setEditCategory("");
  fetchServices(); // Refresh the list
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Unknown error";
        setError(`Failed to update service: ${errorMessage}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle delete service
  const handleDeleteService = async (service: any) => {
    if (!user) {
      setError("Please log in to delete services.");
      return;
    }

    if (confirm("Are you sure you want to delete this service?")) {
      try {
        if (service.serviceId) {
          await removeServiceFromStylist(
            String(user.id),
            String(service.serviceId)
          );
        } else {
          await deleteStylistService(service.id);
        }

      setMessage('Service deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
        fetchServices(); // Refresh the list
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || error.message || "Unknown error";
          setError(`Failed to delete service: ${errorMessage}`);
      }
    }
  };

  // Helpers for display
  const getServiceName = (service: any): string => {
    return service?.name || "Unknown Service";
  };

  const getServicePrice = (service: any): number => {
    return service?.price || 0;
  };

  // Add an available service to the stylist
  const handleAddAvailableService = async (service: Service) => {
    if (!user) {
  setError("Please log in to add services.");
      return;
    }

    try {
      await addServiceToStylist({
        stylistId: String(user.id),
        serviceId: String(service.id),
        price: service.price,
      });
      setMessage('Service added to your list.');
      setTimeout(() => setMessage(''), 3000);
      fetchServices();
    } catch (error: any) {
      setError("Failed to add service. Please try again.");
    }
  };

  // UI states
  if (loading) {
    return (
      <div className="p-6">
        <div>Loading authentication...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="p-6">
        <div className="text-red-600">
          Error: Please log in to view your services.
          <br />
          <small>
            Not authenticated: {!isAuthenticated ? "true" : "false"}, No user:{" "}
            {!user ? "true" : "false"}
          </small>
        </div>
      </div>
    );
  }

  // Filter services by selected category (only backend)
  const displayedServices = !selectedCategory || selectedCategory === "All"
    ? filteredAllServices
    : filteredAllServices.filter((s) => ((s as any).category || "Uncategorized") === selectedCategory);

  return (
    <div className="pb-16 p-4 relative">
      {/* Success Message */}
      {message && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <p>{message}</p>
        </div>
      )}
      {/* Greeting */}
      <div className="mb-6 p-4 bg-pink-500 rounded shadow text-white">
        <h2 className="text-lg font-bold">
          {greeting} {user?.name || "User"}, Welcome to GlamLink!
        </h2>
        <p>View your services and their prices below.</p>
      </div>

      {/* Add Service Button */}
      <div className="flex flex-col items-start mb-8">
        <button
          className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-semibold px-5 py-2 rounded shadow mb-4"
          onClick={() => setShowAddModal((v) => !v)}
        >
          <span className="text-xl">+</span> Add Service
        </button>

        {showAddModal && (
          <div className="max-w-md bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-pink-600">
              Add Service
            </h2>
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleAddService();
              }}
            >
              <div>
                <label className="block text-sm font-medium mb-1">
                  Service Name
                </label>
                <input
                  type="text"
                  className="w-full border p-2 rounded"
                  placeholder="Enter service name"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                />
              </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    className="w-full border p-2 rounded"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Hair Cut">Hair Cut</option>
                    <option value="Nails">Nails</option>
                    <option value="Makeup">Makeup</option>
                    <option value="Hairstyles">Hairstyles</option>
                    <option value="Massage">Massage</option>
                    <option value="Other">Other</option>
                  
                  </select>
                </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input
                  type="number"
                  className="w-full border p-2 rounded"
                  placeholder="Enter price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="w-full border p-2 rounded"
                  placeholder="Enter description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>
              <button
                type="submit"
                disabled={isCreating || !serviceName || !price}
                className={`font-semibold px-5 py-2 rounded shadow mt-2 ${
                  isCreating || !serviceName || !price
                    ? "bg-gray-400 cursor-not-allowed text-gray-600"
                    : "bg-pink-500 hover:bg-pink-600 text-white"
                }`}
              >
                {isCreating ? "Adding..." : "Add Service"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Loading state for services */}
      {isLoading && (
        <div className="mb-4 p-4 bg-blue-100 rounded">
          Loading your services...
        </div>
      )}

      {/* Error state for services */}
      {isError && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          Error loading services. Please try refreshing the page.
        </div>
      )}

      {/* Services list (filterable) */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Services</CardTitle>
          <CardDescription>Manage your services filtered by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
              <div className="flex items-center gap-3">
              <label className="font-medium text-sm text-gray-700" htmlFor="your-services-category-filter">
                Filter by category
              </label>
              <div id="your-services-category-filter" className="w-56">
                <Select value={selectedCategory} onValueChange={(v: string) => setSelectedCategory(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Hair Cut">Hair Cut</SelectItem>
                    <SelectItem value="Nails">Nails</SelectItem>
                    <SelectItem value="Makeup">Makeup</SelectItem>
                    <SelectItem value="Hairstyles">Hairstyles</SelectItem>
                    <SelectItem value="Massage">Massage</SelectItem>
                    
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services
                  .filter((service) =>
                    selectedCategory === "All" || !selectedCategory
                      ? true
                      : ((service as any).category || "Uncategorized") === selectedCategory
                  )
                  .map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{getServiceName(service)}</TableCell>
                      <TableCell>{service.description || ""}</TableCell>
                      <TableCell>{(service as any).category || "Uncategorized"}</TableCell>
                      <TableCell>P{getServicePrice(service)}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditService(service)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteService(service)}
                          className="text-red-600 border-red-300"
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            {services.length === 0 && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                No services added yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>


      {/* Edit Service Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-pink bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4 text-pink-600">
              Edit Service
            </h2>
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateService();
              }}
            >
              <div>
                <label className="block text-sm font-medium mb-1">
                  Service Name
                </label>
                <input
                  type="text"
                  className="w-full border p-2 rounded"
                  placeholder="Enter service name"
                  value={editServiceName}
                  onChange={(e) => setEditServiceName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input
                  type="number"
                  className="w-full border p-2 rounded"
                  placeholder="Enter price (p)"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  className="w-full border p-2 rounded"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                >
                  <option value="Hair Cut">Hair Cut</option>
                  <option value="Nails">Nails</option>
                  <option value="Makeup">Makeup</option>
                  <option value="Hairstyles">Hairstyles</option>
                  <option value="Massage">Massage</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="w-full border p-2 rounded"
                  placeholder="Enter description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingService(null);
                    setEditServiceName("");
                    setEditPrice("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || !editServiceName || !editPrice}
                  className={`flex-1 font-semibold px-4 py-2 rounded ${
                    isUpdating || !editServiceName || !editPrice
                      ? "bg-gray-400 cursor-not-allowed text-gray-600"
                      : "bg-pink-500 hover:bg-pink-600 text-white"
                  }`}
                >
                  {isUpdating ? "Updating..." : "Update Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
