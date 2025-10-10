import apiClient from "./client";
import type {
  EVOwner,
  CreateEVOwnerRequest,
  UpdateEVOwnerRequest,
} from "../types";

export interface EVOwnerLoginRequest {
  nic: string;
  password: string;
}

export interface EVOwnerLoginResponse {
  message: string;
  token: string;
  user: EVOwner;
}

export const evOwnerAuthApi = {
  // EV Owner registration
  register: async (
    userData: CreateEVOwnerRequest
  ): Promise<{ message: string; evOwner: EVOwner }> => {
    const response = await apiClient.post("/api/EVOwnerAuth/register", userData);
    return response.data;
  },

  // EV Owner login
  login: async (credentials: EVOwnerLoginRequest): Promise<EVOwnerLoginResponse> => {
    const response = await apiClient.post<EVOwnerLoginResponse>(
      "/api/EVOwnerAuth/login",
      credentials
    );
    return response.data;
  },

  // Get EV Owner profile (authenticated)
  getProfile: async (): Promise<EVOwner> => {
    const response = await apiClient.get<EVOwner>("/api/EVOwnerAuth/profile");
    return response.data;
  },

  // Update EV Owner profile (authenticated)
  updateProfile: async (
    profileData: UpdateEVOwnerRequest
  ): Promise<{ message: string; evOwner: EVOwner }> => {
    const response = await apiClient.put("/api/EVOwnerAuth/profile", profileData);
    return response.data;
  },

  // Deactivate EV Owner account (authenticated)
  deactivate: async (): Promise<{ message: string }> => {
    const response = await apiClient.post("/api/EVOwnerAuth/deactivate");
    return response.data;
  },

  // Reactivate EV Owner account (public - by NIC)
  reactivate: async (nic: string): Promise<{ message: string }> => {
    const response = await apiClient.post(`/api/EVOwnerAuth/reactivate/${encodeURIComponent(nic)}`);
    return response.data;
  },

  // Logout (client-side only - clear token)
  logout: () => {
    // Token will be cleared by the interceptor
    return Promise.resolve();
  },
};