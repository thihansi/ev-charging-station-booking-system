import apiClient from "./client";
import { transformChargingStationForBackend, transformUpdateChargingStationForBackend, transformChargingStationFromBackend } from "./utils";
import type {
  ChargingStation,
  CreateChargingStationRequest,
  UpdateChargingStationRequest,
} from "../types";

export const chargingStationApi = {
  // Get all charging stations
  getAll: async (): Promise<ChargingStation[]> => {
    const response = await apiClient.get<any[]>(
      "/api/ChargingStations"
    );
    return response.data.map(transformChargingStationFromBackend);
  },

  // Get active charging stations
  getActive: async (): Promise<ChargingStation[]> => {
    const response = await apiClient.get<any[]>(
      "/api/ChargingStations/active"
    );
    return response.data.map(transformChargingStationFromBackend);
  },

  // Get charging station by ID
  getById: async (id: string): Promise<ChargingStation> => {
    const response = await apiClient.get<any>(
      `/api/ChargingStations/${id}`
    );
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
    const response = await apiClient.post(`/api/ChargingStations/${id}/activate`);
    return response.data;
  },

  // Deactivate charging station
  deactivate: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.post(`/api/ChargingStations/${id}/deactivate`);
    return response.data;
  },

  // Get charging station QR code
  getQRCode: async (id: string): Promise<{ qrCodeData: string }> => {
    const response = await apiClient.get(`/api/ChargingStations/${id}/qrcode`);
    return response.data;
  },
};
