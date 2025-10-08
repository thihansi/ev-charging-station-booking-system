import apiClient from "./client";
import type {
  ChargingStation,
  CreateChargingStationRequest,
  UpdateChargingStationRequest,
} from "../types";

export const chargingStationApi = {
  // Get all charging stations
  getAll: async (): Promise<ChargingStation[]> => {
    const response = await apiClient.get<ChargingStation[]>(
      "/api/chargingstations"
    );
    return response.data;
  },

  // Get active charging stations
  getActive: async (): Promise<ChargingStation[]> => {
    const response = await apiClient.get<ChargingStation[]>(
      "/api/chargingstations/active"
    );
    return response.data;
  },

  // Get charging station by ID
  getById: async (id: string): Promise<ChargingStation> => {
    const response = await apiClient.get<ChargingStation>(
      `/api/chargingstations/${id}`
    );
    return response.data;
  },

  // Create new charging station
  create: async (
    stationData: CreateChargingStationRequest
  ): Promise<{ message: string; id: string }> => {
    const response = await apiClient.post("/api/chargingstations", stationData);
    return response.data;
  },

  // Update charging station
  update: async (
    id: string,
    stationData: UpdateChargingStationRequest
  ): Promise<{ message: string }> => {
    const response = await apiClient.put(
      `/api/chargingstations/${id}`,
      stationData
    );
    return response.data;
  },

  // Delete/Deactivate charging station
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/api/chargingstations/${id}`);
    return response.data;
  },

  // Get charging station QR code
  getQRCode: async (id: string): Promise<{ qrCodeData: string }> => {
    const response = await apiClient.get(`/api/chargingstations/${id}/qrcode`);
    return response.data;
  },

  // Get stations by type
  getByType: async (stationType: "AC" | "DC"): Promise<ChargingStation[]> => {
    const response = await apiClient.get<ChargingStation[]>(
      `/api/chargingstations/type/${stationType}`
    );
    return response.data;
  },
};
