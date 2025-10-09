import apiClient from "./client";
import type {
  EVOwner,
  CreateEVOwnerRequest,
  UpdateEVOwnerRequest,
} from "../types";

export const evOwnerApi = {
  // Get all EV owners (Backoffice only)
  getAll: async (): Promise<EVOwner[]> => {
    const response = await apiClient.get<EVOwner[]>("/api/evowners");
    return response.data;
  },

  // Get EV owner by NIC (Backoffice only)
  getByNic: async (nic: string): Promise<EVOwner> => {
    const response = await apiClient.get<EVOwner>(
      `/api/evowners/${encodeURIComponent(nic)}`
    );
    return response.data;
  },

  // Create EV owner profile only (Backoffice only)
  create: async (
    evOwnerData: CreateEVOwnerRequest
  ): Promise<{ message: string; evOwner: EVOwner }> => {
    const response = await apiClient.post("/api/evowners", evOwnerData);
    return response.data;
  },

  // Create EV owner with login credentials (Backoffice only)
  createWithPassword: async (
    evOwnerData: CreateEVOwnerRequest
  ): Promise<{ message: string; evOwner: EVOwner }> => {
    const response = await apiClient.post("/api/evowners/create-with-password", evOwnerData);
    return response.data;
  },

  // Update EV owner (Backoffice only)
  update: async (
    nic: string,
    evOwnerData: UpdateEVOwnerRequest
  ): Promise<{ message: string; evOwner: EVOwner }> => {
    const response = await apiClient.put(
      `/api/evowners/${encodeURIComponent(nic)}`,
      evOwnerData
    );
    return response.data;
  },

  // Delete EV owner (Backoffice only)
  delete: async (nic: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(
      `/api/evowners/${encodeURIComponent(nic)}`
    );
    return response.data;
  },

  // Activate EV owner (Backoffice only)
  activate: async (nic: string): Promise<{ message: string }> => {
    const response = await apiClient.post(
      `/api/evowners/${encodeURIComponent(nic)}/activate`
    );
    return response.data;
  },

  // Deactivate EV owner (Backoffice only)
  deactivate: async (nic: string): Promise<{ message: string }> => {
    const response = await apiClient.post(
      `/api/evowners/${encodeURIComponent(nic)}/deactivate`
    );
    return response.data;
  },

  // Reactivate EV owner (Backoffice only)
  reactivate: async (nic: string): Promise<{ message: string }> => {
    const response = await apiClient.post(
      `/api/evowners/${encodeURIComponent(nic)}/reactivate`
    );
    return response.data;
  },
};
