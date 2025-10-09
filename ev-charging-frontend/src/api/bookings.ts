import apiClient from "./client";
import { transformBookingForBackend, transformEVOwnerBookingForBackend } from "./utils";
import type {
  Booking,
  CreateBookingRequest,
  CreateEVOwnerBookingRequest,
  BookingSummaryRequest,
  UpdateBookingRequest,
  BookingStatus,
} from "../types";
import { BookingStatusFromEnum } from "../types";

// Transform booking response from backend (handles numeric status to string)
const transformBookingFromBackend = (backendBooking: any): Booking => {
  return {
    ...backendBooking,
    status: typeof backendBooking.status === 'number' 
      ? BookingStatusFromEnum[backendBooking.status] 
      : backendBooking.status
  };
};

export const bookingApi = {
  // Get all bookings
  getAll: async (): Promise<Booking[]> => {
    const response = await apiClient.get<any[]>("/api/bookings");
    return response.data.map(transformBookingFromBackend);
  },

  // Get booking by ID
  getById: async (id: string): Promise<Booking> => {
    const response = await apiClient.get<any>(`/api/bookings/${id}`);
    return transformBookingFromBackend(response.data);
  },

  // Create new booking (Admin/Backoffice)
  create: async (
    bookingData: CreateBookingRequest
  ): Promise<{ message: string; id: string }> => {
    console.log("[Booking API] Creating booking with data:", bookingData);
    const transformedData = transformBookingForBackend(bookingData);
    console.log("[Booking API] Transformed data for backend:", transformedData);
    const response = await apiClient.post("/api/bookings", transformedData);
    console.log("[Booking API] Response:", response.data);
    return response.data;
  },

  // Update booking
  update: async (
    id: string,
    bookingData: UpdateBookingRequest
  ): Promise<{ message: string }> => {
    const response = await apiClient.put(`/api/bookings/${id}`, bookingData);
    return response.data;
  },

  // Cancel booking
  cancel: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/api/bookings/${id}`);
    return response.data;
  },

  // Approve booking (Station Operator)
  approve: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.post(`/api/bookings/${id}/approve`);
    return response.data;
  },

  // Reject booking (Station Operator)
  reject: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.post(`/api/bookings/${id}/reject`);
    return response.data;
  },

  // Complete booking
  complete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.post(`/api/bookings/${id}/complete`);
    return response.data;
  },

  // Get bookings by EV Owner NIC
  getByEvOwner: async (nic: string): Promise<Booking[]> => {
    const response = await apiClient.get<any[]>(
      `/api/bookings/evowner/${encodeURIComponent(nic)}`
    );
    return response.data.map(transformBookingFromBackend);
  },

  // Get bookings by charging station
  getByStation: async (stationId: string): Promise<Booking[]> => {
    const response = await apiClient.get<any[]>(
      `/api/bookings/station/${stationId}`
    );
    return response.data.map(transformBookingFromBackend);
  },

  // Get pending bookings
  getPending: async (): Promise<Booking[]> => {
    const response = await apiClient.get<any[]>("/api/bookings/pending");
    return response.data.map(transformBookingFromBackend);
  },

  // Validate QR code
  validateQR: async (
    qrCode: string
  ): Promise<{ isValid: boolean; booking?: Booking }> => {
    const response = await apiClient.post("/api/bookings/validate-qr", {
      qrCode,
    });
    return {
      ...response.data,
      booking: response.data.booking ? transformBookingFromBackend(response.data.booking) : undefined
    };
  },

  // EV Owner specific endpoints

  // Preview booking summary before creation (EV Owner)
  previewBooking: async (
    summaryData: BookingSummaryRequest
  ): Promise<{
    bookingId: string;
    evOwnerName: string;
    evOwnerNIC: string;
    chargingStationName: string;
    chargingStationAddress: string;
    reservationDateTime: string;
    estimatedDuration: string;
    estimatedCost: number;
  }> => {
    const response = await apiClient.post("/api/bookings/summary", summaryData);
    return response.data;
  },

  // Create booking as EV Owner (no evOwnerNic needed)
  createAsEVOwner: async (
    bookingData: CreateEVOwnerBookingRequest
  ): Promise<{ message: string; booking: Booking }> => {
    const transformedData = transformEVOwnerBookingForBackend(bookingData);
    const response = await apiClient.post("/api/bookings", transformedData);
    return {
      ...response.data,
      booking: transformBookingFromBackend(response.data.booking)
    };
  },

  // Get my upcoming bookings (EV Owner)
  getMyUpcomingBookings: async (): Promise<Booking[]> => {
    const response = await apiClient.get<any[]>(
      "/api/bookings/my-bookings/upcoming"
    );
    return response.data.map(transformBookingFromBackend);
  },

  // Get my booking history (EV Owner)
  getMyBookingHistory: async (): Promise<Booking[]> => {
    const response = await apiClient.get<any[]>(
      "/api/bookings/my-bookings/history"
    );
    return response.data.map(transformBookingFromBackend);
  },

  // Get booking summary (EV Owner)
  getBookingSummary: async (
    id: string
  ): Promise<{
    booking: Booking;
    qrCode: string;
    instructions: string;
  }> => {
    const response = await apiClient.get(
      `/api/bookings/my-bookings/summary/${id}`
    );
    return {
      ...response.data,
      booking: transformBookingFromBackend(response.data.booking)
    };
  },

  // Generate QR code for booking
  generateQRCode: async (
    bookingId: string
  ): Promise<{ qrCode: string; qrCodeImage: string }> => {
    const response = await apiClient.get(`/api/bookings/${bookingId}/qr-code`);
    return response.data;
  },

  // Additional approval/rejection endpoints

  // Approve booking (with optional reason)
  approveBooking: async (
    id: string,
    reason?: string
  ): Promise<{ message: string }> => {
    const response = await apiClient.post(`/api/bookings/approve/${id}`, {
      reason,
    });
    return response.data;
  },

  // Reject booking (with required reason)
  rejectBooking: async (
    id: string,
    reason: string
  ): Promise<{ message: string }> => {
    const response = await apiClient.post(`/api/bookings/reject/${id}`, {
      reason,
    });
    return response.data;
  },
};
