import apiClient from "./client";
import type {
  User,
  LoginRequest,
  LoginResponse,
  CreateUserRequest,
} from "../types";

export const authApi = {
  // System user login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      "/api/auth/login",
      credentials
    );
    return response.data;
  },

  // Get system user profile
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>("/api/auth/profile");
    console.log("📋 Raw profile response:", response.data);
    return response.data;
  },

  // Create backoffice user
  createBackofficeUser: async (
    userData: CreateUserRequest
  ): Promise<{ message: string; id: string }> => {
    const response = await apiClient.post(
      "/api/auth/create-backoffice-user",
      userData
    );
    return response.data;
  },

  // Create station operator
  createStationOperator: async (
    userData: CreateUserRequest
  ): Promise<{ message: string; id: string }> => {
    const response = await apiClient.post(
      "/api/auth/create-station-operator",
      userData
    );
    return response.data;
  },

  // Legacy user registration (using query params)
  registerUser: async (
    username: string,
    password: string,
    role: number
  ): Promise<{ message: string; id: string }> => {
    const response = await apiClient.post(
      `/api/auth/register?username=${encodeURIComponent(
        username
      )}&password=${encodeURIComponent(password)}&role=${role}`
    );
    return response.data;
  },

  // Logout (client-side only - clear token)
  logout: () => {
    // Token will be cleared by the interceptor
    return Promise.resolve();
  },

  // Update user profile - NOT IMPLEMENTED IN BACKEND
  // Backend User entity only has username, passwordHash, and role
  // No fullName, email, or other profile fields are supported
  updateProfile: async (_profileData: {
    username: string;
    fullName: string;
    email: string;
  }): Promise<{ message: string; user: User }> => {
    throw new Error("Profile updates are not supported for system users. Backend User entity only contains username and role.");
  },

  // Change password - NOT IMPLEMENTED IN BACKEND
  // Backend does not have a change password endpoint for system users
  changePassword: async (_passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    throw new Error("Password changes are not supported for system users. Please contact your administrator.");
  },
};
