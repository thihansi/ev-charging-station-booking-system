import apiClient from "./client";
import {
  transformChargingStationForBackend,
  transformUpdateChargingStationForBackend,
  transformChargingStationFromBackend,
} from "./utils";
import type {
  ChargingStation,
  CreateChargingStationRequest,
  UpdateChargingStationRequest,
} from "../types";

export const chargingStationApi = {
  // Get all charging stations
  getAll: async (): Promise<ChargingStation[]> => {
    const response = await apiClient.get<any[]>("/api/ChargingStations");
    return response.data.map(transformChargingStationFromBackend);
  },

  // Get active charging stations
  getActive: async (): Promise<ChargingStation[]> => {
    const response = await apiClient.get<any[]>("/api/ChargingStations/active");
    return response.data.map(transformChargingStationFromBackend);
  },

  // Get charging station by ID
  getById: async (id: string): Promise<ChargingStation> => {
    const response = await apiClient.get<any>(`/api/ChargingStations/${id}`);
    return transformChargingStationFromBackend(response.data);
  },

  // Create new charging station
  create: async (
    stationData: CreateChargingStationRequest
  ): Promise<{ message: string; id: string }> => {
    const backendData = transformChargingStationForBackend(stationData);
    const response = await apiClient.post("/api/ChargingStations", backendData);
    return response.data;
  },

  // Update charging station
  update: async (
    id: string,
    stationData: UpdateChargingStationRequest
  ): Promise<{ message: string }> => {
    try {
      const backendData = transformUpdateChargingStationForBackend(stationData);

      console.log("📝 Updating charging station:", {
        id,
        frontendData: stationData,
        backendData,
        url: `/api/ChargingStations/${id}`,
      });

      console.log(
        "📤 Sending PUT request with body:",
        JSON.stringify(backendData, null, 2)
      );

      const response = await apiClient.put(
        `/api/ChargingStations/${id}`,
        backendData
      );

      console.log(
        "✅ Update successful - Response:",
        JSON.stringify(response.data, null, 2)
      );
      console.log("✅ Status Code:", response.status);

      // Verify the update by fetching the station again
      try {
        const verifyResponse = await apiClient.get(
          `/api/ChargingStations/${id}`
        );
        console.log("🔍 Verification - Station after update:", {
          isActive: verifyResponse.data.isActive,
          fullData: verifyResponse.data,
        });
      } catch (verifyError) {
        console.warn("⚠️ Could not verify update:", verifyError);
      }

      return response.data;
    } catch (error: any) {
      console.error("❌ Update failed:", {
        status: error.response?.status,
        data: JSON.stringify(error.response?.data, null, 2),
        error,
      });
      throw error;
    }
  },

  // Delete charging station
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/api/ChargingStations/${id}`);
    return response.data;
  },

  // Activate charging station
  activate: async (id: string): Promise<{ message: string }> => {
    try {
      console.log("🟢 Activating charging station - ID:", id);
      console.log("🟢 URL:", `/api/ChargingStations/${id}/activate`);

      const response = await apiClient.post(
        `/api/ChargingStations/${id}/activate`
      );

      console.log("✅ Activation successful:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Activation failed:", {
        status: error.response?.status,
        data: JSON.stringify(error.response?.data, null, 2),
        error,
      });
      throw error;
    }
  },

  // Deactivate charging station
  deactivate: async (id: string): Promise<{ message: string }> => {
    try {
      console.log("🔴 Deactivating charging station - ID:", id);
      console.log("🔴 URL:", `/api/ChargingStations/${id}/deactivate`);

      const response = await apiClient.post(
        `/api/ChargingStations/${id}/deactivate`
      );

      console.log("✅ Deactivation successful:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Deactivation failed:", {
        status: error.response?.status,
        data: JSON.stringify(error.response?.data, null, 2),
        error,
      });
      throw error;
    }
  },

  // Get charging station QR code
  getQRCode: async (id: string): Promise<{ qrCodeData: string }> => {
    const response = await apiClient.get(`/api/ChargingStations/${id}/qrcode`);
    return response.data;
  },
};
