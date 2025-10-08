import apiClient from "./client";
import type {
  EVOwner,
  CreateEVOwnerRequest,
  UpdateEVOwnerRequest,
  PaginatedResponse,
} from "../types";

export const evOwnerApi = {
  // Get all EV owners
  getAll: async (): Promise<EVOwner[]> => {
    const response = await apiClient.get<EVOwner[]>("/api/evowners");
    return response.data;
  },

  // Get EV owner by NIC
  getByNic: async (nic: string): Promise<EVOwner> => {
    const response = await apiClient.get<EVOwner>(
      `/api/evowners/${encodeURIComponent(nic)}`
    );
    return response.data;
  },

  // Create new EV owner
  create: async (
    evOwnerData: CreateEVOwnerRequest
  ): Promise<{ message: string }> => {
    const response = await apiClient.post("/api/evowners", evOwnerData);
    return response.data;
  },

  // Update EV owner
  update: async (
    nic: string,
    evOwnerData: UpdateEVOwnerRequest
  ): Promise<{ message: string }> => {
    const response = await apiClient.put(
      `/api/evowners/${encodeURIComponent(nic)}`,
      evOwnerData
    );
    return response.data;
  },

  // Delete EV owner
  delete: async (nic: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(
      `/api/evowners/${encodeURIComponent(nic)}`
    );
    return response.data;
  },

  // Activate EV owner
  activate: async (nic: string): Promise<{ message: string }> => {
    const response = await apiClient.post(
      `/api/evowners/${encodeURIComponent(nic)}/activate`
    );
    return response.data;
  },

  // Deactivate EV owner
  deactivate: async (nic: string): Promise<{ message: string }> => {
    const response = await apiClient.post(
      `/api/evowners/${encodeURIComponent(nic)}/deactivate`
    );
    return response.data;
  },

  // Reactivate EV owner
  reactivate: async (nic: string): Promise<{ message: string }> => {
    const response = await apiClient.post(
      `/api/evowners/${encodeURIComponent(nic)}/reactivate`
    );
    return response.data;
  },

  // Search EV owners (if backend supports it)
  search: async (query: string): Promise<EVOwner[]> => {
    const response = await apiClient.get<EVOwner[]>(
      `/api/evowners/search?q=${encodeURIComponent(query)}`
    );
    return response.data;
  },
};
