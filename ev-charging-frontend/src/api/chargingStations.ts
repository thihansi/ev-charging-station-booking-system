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
    const backendData = transformUpdateChargingStationForBackend(stationData);
    const response = await apiClient.put(
      `/api/ChargingStations/${id}`,
      backendData
    );
    return response.data;
  },

  // Delete charging station
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/api/ChargingStations/${id}`);
    return response.data;
  },

  // Activate charging station
  activate: async (id: string): Promise<{ message: string }> => {
    try {
      console.log("🔄 Attempting to activate charging station:", id);

      // First get the current station data
      const currentStation = await chargingStationApi.getById(id);
      console.log("📊 Current station data:", currentStation);

      // Check if operationalHours exists, if not provide default
      const operationalHours = currentStation.operationalHours || {
        openTime: "08:00",
        closeTime: "18:00",
      };

      // Prepare the update data using proper transformation
      const updateData = {
        name: currentStation.name,
        address: currentStation.address,
        latitude: currentStation.latitude,
        longitude: currentStation.longitude,
        stationType: currentStation.stationType,
        totalSlots: currentStation.totalSlots,
        operationalHours: operationalHours,
      };

      console.log("📋 Update data prepared:", updateData);

      // Transform to backend format and add isActive
      const backendData = transformUpdateChargingStationForBackend(updateData);
      backendData.isActive = true;

      console.log("🔄 Activation request data:", backendData);

      const response = await apiClient.put(
        `/api/ChargingStations/${id}`,
        backendData
      );
      console.log("✅ Charging station activated successfully:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error activating charging station:", error);
      console.error("Response data:", error.response?.data);
      console.error("Full error object:", error);
      throw error;
    }
  },

  // Deactivate charging station
  deactivate: async (id: string): Promise<{ message: string }> => {
    try {
      console.log("🔄 Attempting to deactivate charging station:", id);

      // First get the current station data
      const currentStation = await chargingStationApi.getById(id);
      console.log("📊 Current station data:", currentStation);

      // Check if operationalHours exists, if not provide default
      const operationalHours = currentStation.operationalHours || {
        openTime: "08:00",
        closeTime: "18:00",
      };

      // Prepare the update data using proper transformation
      const updateData = {
        name: currentStation.name,
        address: currentStation.address,
        latitude: currentStation.latitude,
        longitude: currentStation.longitude,
        stationType: currentStation.stationType,
        totalSlots: currentStation.totalSlots,
        operationalHours: operationalHours,
      };

      console.log("📋 Update data prepared:", updateData);

      // Transform to backend format and add isActive
      const backendData = transformUpdateChargingStationForBackend(updateData);
      backendData.isActive = false;

      console.log("🔄 Deactivation request data:", backendData);

      const response = await apiClient.put(
        `/api/ChargingStations/${id}`,
        backendData
      );
      console.log(
        "✅ Charging station deactivated successfully:",
        response.data
      );
      return response.data;
    } catch (error: any) {
      console.error("❌ Error deactivating charging station:", error);
      console.error("Response data:", error.response?.data);
      console.error("Full error object:", error);
      throw error;
    }
  },

  // Get charging station QR code
  getQRCode: async (id: string): Promise<{ qrCodeData: string }> => {
    const response = await apiClient.get(`/api/ChargingStations/${id}/qrcode`);
    return response.data;
  },
};
