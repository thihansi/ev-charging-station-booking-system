import apiClient from "./client";

// EV Owner types
export interface EVOwnerLoginRequest {
  nic: string;
  password: string;
}

export interface EVOwnerRegistrationRequest {
  nic: string;
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface EVOwnerProfile {
  nic: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
}

export interface EVOwnerLoginResponse {
  token: string;
  evOwner: EVOwnerProfile;
}

export interface EVOwnerRegistrationResponse {
  message: string;
  evOwner: EVOwnerProfile;
}

export const evOwnerAuthApi = {
  // EV Owner Registration
  register: async (
    registrationData: EVOwnerRegistrationRequest
  ): Promise<EVOwnerRegistrationResponse> => {
    const response = await apiClient.post<EVOwnerRegistrationResponse>(
      "/api/evownerauth/register",
      registrationData
    );
    return response.data;
  },

  // EV Owner Login
  login: async (credentials: EVOwnerLoginRequest): Promise<EVOwnerLoginResponse> => {
    const response = await apiClient.post<EVOwnerLoginResponse>(
      "/api/evownerauth/login",
      credentials
    );
    return response.data;
  },

  // Get EV Owner Profile
  getProfile: async (): Promise<EVOwnerProfile> => {
    const response = await apiClient.get<EVOwnerProfile>("/api/evownerauth/profile");
    return response.data;
  },

  // Update EV Owner Profile
  updateProfile: async (
    profileData: EVOwnerProfile
  ): Promise<{ message: string; evOwner: EVOwnerProfile }> => {
    const response = await apiClient.put("/api/evownerauth/profile", profileData);
    return response.data;
  },

  // Self-Deactivate Account
  deactivateAccount: async (): Promise<{ message: string }> => {
    const response = await apiClient.post("/api/evownerauth/deactivate");
    return response.data;
  },

  // Reactivate EV Owner Account (Backoffice only)
  reactivateAccount: async (nic: string): Promise<{ message: string }> => {
    const response = await apiClient.post(`/api/evownerauth/reactivate/${encodeURIComponent(nic)}`);
    return response.data;
  },
};