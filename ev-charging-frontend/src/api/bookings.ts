import apiClient from "./client";
import type {
  Booking,
  CreateBookingRequest,
  UpdateBookingRequest,
} from "../types";

export const bookingApi = {
  // Get all bookings
  getAll: async (): Promise<Booking[]> => {
    const response = await apiClient.get<Booking[]>("/api/bookings");
    return response.data;
  },

  // Get booking by ID
  getById: async (id: string): Promise<Booking> => {
    const response = await apiClient.get<Booking>(`/api/bookings/${id}`);
    return response.data;
  },

  // Create new booking
  create: async (
    bookingData: CreateBookingRequest
  ): Promise<{ message: string; id: string }> => {
    const response = await apiClient.post("/api/bookings", bookingData);
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

  // Mark as no-show
  markNoShow: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.post(`/api/bookings/${id}/no-show`);
    return response.data;
  },

  // Get bookings by EV Owner NIC
  getByEvOwner: async (nic: string): Promise<Booking[]> => {
    const response = await apiClient.get<Booking[]>(
      `/api/bookings/evowner/${encodeURIComponent(nic)}`
    );
    return response.data;
  },

  // Get bookings by charging station
  getByStation: async (stationId: string): Promise<Booking[]> => {
    const response = await apiClient.get<Booking[]>(
      `/api/bookings/station/${stationId}`
    );
    return response.data;
  },

  // Get pending bookings
  getPending: async (): Promise<Booking[]> => {
    const response = await apiClient.get<Booking[]>("/api/bookings/pending");
    return response.data;
  },

  // Validate QR code
  validateQR: async (
    qrCode: string
  ): Promise<{ isValid: boolean; booking?: Booking }> => {
    const response = await apiClient.post("/api/bookings/validate-qr", {
      qrCode,
    });
    return response.data;
  },

  // EV Owner specific endpoints

  // Get my upcoming bookings (EV Owner)
  getMyUpcomingBookings: async (): Promise<Booking[]> => {
    const response = await apiClient.get<Booking[]>("/api/bookings/my-bookings/upcoming");
    return response.data;
  },

  // Get my booking history (EV Owner)
  getMyBookingHistory: async (): Promise<Booking[]> => {
    const response = await apiClient.get<Booking[]>("/api/bookings/my-bookings/history");
    return response.data;
  },

  // Get booking summary (EV Owner)
  getBookingSummary: async (id: string): Promise<{
    booking: Booking;
    qrCode: string;
    instructions: string;
  }> => {
    const response = await apiClient.get(`/api/bookings/my-bookings/summary/${id}`);
    return response.data;
  },

  // Generate QR code for booking
  generateQRCode: async (bookingId: string): Promise<{ qrCode: string; qrCodeImage: string }> => {
    const response = await apiClient.get(`/api/bookings/${bookingId}/qr-code`);
    return response.data;
  },

  // Additional approval/rejection endpoints

  // Approve booking (with optional reason)
  approveBooking: async (id: string, reason?: string): Promise<{ message: string }> => {
    const response = await apiClient.post(`/api/bookings/approve/${id}`, { reason });
    return response.data;
  },

  // Reject booking (with required reason)
  rejectBooking: async (id: string, reason: string): Promise<{ message: string }> => {
    const response = await apiClient.post(`/api/bookings/reject/${id}`, { reason });
    return response.data;
  },
};
