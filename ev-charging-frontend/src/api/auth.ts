import apiClient from "./client";
import type {
  User,
  ApiUser,
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
    const response = await apiClient.get<ApiUser>("/api/auth/profile");
    console.log("📋 Raw profile response:", response.data);
    console.log("📋 Raw role value:", response.data.role, "Type:", typeof response.data.role);
    
    // Map ApiUser to User with proper role conversion
    const mappedRole = response.data.role === 0 ? "Backoffice" : "StationOperator";
    console.log("📋 Role mapping:", {
      rawRole: response.data.role,
      mappedRole,
      isBackoffice: response.data.role === 0,
      isStationOperator: response.data.role !== 0
    });
    
    const mappedUser: User = {
      id: response.data.id,
      username: response.data.username,
      role: mappedRole,
      fullName: response.data.fullName || undefined,
      email: response.data.email || undefined,
    };
    
    console.log("📋 Mapped user profile:", mappedUser);
    console.log("📋 Final role string:", `"${mappedUser.role}"`);
    return mappedUser;
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

  // Get all users (requires backoffice authentication)
  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<{
      message: string;
      count: number;
      users: ApiUser[];
    }>("/api/auth/users");
    
    // Map API users to frontend User type with proper role conversion
    const mappedUsers: User[] = response.data.users.map(apiUser => ({
      id: apiUser.id,
      username: apiUser.username,
      role: apiUser.role === 0 ? "Backoffice" : "StationOperator",
      fullName: apiUser.fullName || undefined, // Don't set fallback here, let UI handle it
      email: apiUser.email || undefined, // Don't set fallback here, let UI handle it
    }));
    
    return mappedUsers;
  },

  // Update user (requires backoffice authentication)
  updateUser: async (
    userId: string,
    userData: {
      username: string;
      password?: string;
      role: number;
    }
  ): Promise<{ message: string; user: User }> => {
    const response = await apiClient.put(
      `/api/auth/users/${userId}`,
      userData
    );
    return response.data;
  },

  // Delete user (requires backoffice authentication)
  deleteUser: async (userId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/api/auth/users/${userId}`);
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
