import apiClient from "./client";
import type {
  EVOwner,
  CreateEVOwnerRequest,
  UpdateEVOwnerRequest,
} from "../types";

export const evOwnerApi = {
  // Get all EV owners (Backoffice only) - GET /api/EVOwners
  getAll: async (): Promise<EVOwner[]> => {
    const response = await apiClient.get<
      | {
          message?: string;
          count?: number;
          evOwners?: EVOwner[];
        }
      | EVOwner[]
    >("/api/EVOwners");

    // Handle both direct array and wrapped response formats
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (
      response.data &&
      "evOwners" in response.data &&
      Array.isArray(response.data.evOwners)
    ) {
      return response.data.evOwners;
    } else {
      console.warn("Unexpected API response format:", response.data);
      return [];
    }
  },

  // Get EV owner by NIC (Backoffice only)
  getByNic: async (nic: string): Promise<EVOwner> => {
    const response = await apiClient.get<EVOwner>(
      `/api/EVOwners/${encodeURIComponent(nic)}`
    );
    return response.data;
  },

  // Create EV owner profile only (Backoffice only)
  create: async (
    evOwnerData: CreateEVOwnerRequest
  ): Promise<{ message: string; evOwner: EVOwner }> => {
    const response = await apiClient.post("/api/EVOwners", evOwnerData);
    return response.data;
  },

  // Create EV owner with login credentials (Backoffice only)
  createWithPassword: async (
    evOwnerData: CreateEVOwnerRequest
  ): Promise<{ message: string; evOwner: EVOwner }> => {
    const response = await apiClient.post(
      "/api/EVOwners/create-with-password",
      evOwnerData
    );
    return response.data;
  },

  // Update EV owner (Backoffice only)
  update: async (
    nic: string,
    evOwnerData: UpdateEVOwnerRequest
  ): Promise<{ message: string; evOwner: EVOwner }> => {
    try {
      console.log("📝 Updating EV Owner - NIC:", nic);
      console.log("📝 Update Data:", JSON.stringify(evOwnerData, null, 2));
      console.log("📝 Full URL:", `/api/EVOwners/${encodeURIComponent(nic)}`);

      const response = await apiClient.put(
        `/api/EVOwners/${encodeURIComponent(nic)}`,
        evOwnerData
      );

      console.log("✅ Update successful:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Update failed - Status:", error.response?.status);
      console.error(
        "❌ Update failed - Status Text:",
        error.response?.statusText
      );
      console.error(
        "❌ Update failed - Error Data:",
        JSON.stringify(error.response?.data, null, 2)
      );
      console.error("❌ Update failed - Full Error:", error);
      throw error;
    }
  },

  // Delete EV owner (Backoffice only)
  delete: async (nic: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(
      `/api/EVOwners/${encodeURIComponent(nic)}`
    );
    return response.data;
  },

  // Activate EV owner (Backoffice only)
  activate: async (nic: string): Promise<{ message: string }> => {
    const response = await apiClient.post(
      `/api/EVOwners/${encodeURIComponent(nic)}/activate`
    );
    return response.data;
  },

  // Deactivate EV owner (Backoffice only)
  deactivate: async (nic: string): Promise<{ message: string }> => {
    const response = await apiClient.post(
      `/api/EVOwners/${encodeURIComponent(nic)}/deactivate`
    );
    return response.data;
  },

  // Reactivate EV owner (Backoffice only)
  reactivate: async (nic: string): Promise<{ message: string }> => {
    const response = await apiClient.post(
      `/api/EVOwners/${encodeURIComponent(nic)}/reactivate`
    );
    return response.data;
  },
};
