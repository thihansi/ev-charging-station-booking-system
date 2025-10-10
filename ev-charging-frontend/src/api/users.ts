import apiClient from "./client";
import type { SystemUser } from "../types";

export const userApi = {
  // Get all system users
  getAll: async (): Promise<{ count: number; users: SystemUser[] }> => {
    const response = await apiClient.get("/api/users/all");
    // Backend returns Count and Users (capitalized), so we need to map them
    return {
      count: response.data.Count || response.data.count || 0,
      users: response.data.Users || response.data.users || []
    };
  },

  // Debug endpoint to get users info
  debug: async (): Promise<{
    message: string;
    totalUsers: number;
    usernames: string[];
    roles: { username: string; role: string }[];
  }> => {
    const response = await apiClient.get("/api/users/debug");
    return response.data;
  },
};