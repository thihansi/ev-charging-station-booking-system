import apiClient from "./client";
import type { Booking } from "../types";
import { BookingStatusFromEnum } from "../types";

// Transform booking response from backend
const transformBookingFromBackend = (backendBooking: any): Booking => {
  return {
    id: backendBooking.id || backendBooking._id,
    evOwnerNic: backendBooking.evOwnerNIC || backendBooking.evOwnerNic,
    chargingStationId: backendBooking.chargingStationId,
    reservationDateTime: backendBooking.reservationDateTime,
    status:
      typeof backendBooking.status === "number"
        ? BookingStatusFromEnum[backendBooking.status]
        : backendBooking.status,
    qrCodeData: backendBooking.qrCode || backendBooking.qrCodeData,
    createdAt: backendBooking.createdAt || new Date().toISOString(),
    updatedAt: backendBooking.updatedAt || new Date().toISOString(),
    evOwner: backendBooking.evOwner,
    chargingStation: backendBooking.chargingStation,
  };
};

export const bookingApi = {
  // Get all bookings (with fallback for station operators)
  getAll: async (): Promise<Booking[]> => {
    try {
      console.log("📡 Fetching all bookings from /api/Bookings...");
      const response = await apiClient.get<any[]>("/api/Bookings");
      console.log("📋 Raw bookings response:", response.data);

      let bookingsData = response.data;
      if (
        response.data &&
        typeof response.data === "object" &&
        "bookings" in response.data
      ) {
        bookingsData = (response.data as any).bookings;
      }

      if (!Array.isArray(bookingsData)) {
        console.warn("❌ Bookings data is not an array:", bookingsData);
        return [];
      }

      const transformedBookings = bookingsData.map(transformBookingFromBackend);
      console.log(
        `✅ Successfully fetched ${transformedBookings.length} bookings`
      );
      return transformedBookings;
    } catch (error: any) {
      console.error("❌ Error fetching all bookings:", error);
      
      // If 403 forbidden, try to get pending bookings instead (station operators might only have access to these)
      if (error.response?.status === 403) {
        console.log("⚠️ Access denied to all bookings, trying pending bookings only...");
        try {
          return await bookingApi.getPending();
        } catch (fallbackError) {
          console.error("❌ Also failed to fetch pending bookings:", fallbackError);
          return [];
        }
      }
      
      throw error;
    }
  },

  // Get booking by ID
  getById: async (id: string): Promise<Booking> => {
    const response = await apiClient.get<any>(`/api/Bookings/${id}`);
    return transformBookingFromBackend(response.data);
  },

  // Create new booking
  create: async (bookingData: any): Promise<{ message: string }> => {
    const response = await apiClient.post("/api/Bookings", bookingData);
    return response.data;
  },

  // Update booking
  update: async (id: string, bookingData: any): Promise<{ message: string }> => {
    const response = await apiClient.put(`/api/Bookings/${id}`, bookingData);
    return response.data;
  },

  // Cancel booking
  cancel: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/api/Bookings/${id}`);
    return response.data;
  },

  // Complete booking
  complete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.put(`/api/Bookings/${id}`, { status: "Completed" });
    return response.data;
  },

  // Approve booking
  approve: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.post(`/api/Bookings/${id}/approve`);
    return response.data;
  },

  // Reject booking
  reject: async (id: string, reason?: string): Promise<{ message: string }> => {
    const response = await apiClient.post(`/api/Bookings/${id}/reject`, {
      reason,
    });
    return response.data;
  },

  // Get pending bookings
  getPending: async (): Promise<Booking[]> => {
    const response = await apiClient.get<any[]>("/api/Bookings/pending");
    return response.data.map(transformBookingFromBackend);
  },

  // Get bookings summary for dashboard
  getSummary: async (): Promise<any> => {
    try {
      console.log("📡 Fetching bookings summary from /api/Bookings/summary...");
      const response = await apiClient.post("/api/Bookings/summary");
      console.log("📊 Summary response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching bookings summary:", error);
      // Return default values if API fails
      return {
        totalBookings: 0,
        pendingBookings: 0,
        approvedBookings: 0,
        completedBookings: 0,
        todayBookings: 0,
        totalRevenue: 0
      };
    }
  },

  // Get QR code for booking
  getQRCode: async (id: string): Promise<{ qrCodeData: string }> => {
    const response = await apiClient.get(`/api/Bookings/${id}/qrcode`);
    return response.data;
  },

  // Validate QR code
  validateQR: async (qrCodeData: string): Promise<{ valid: boolean; booking?: Booking; message: string }> => {
    const response = await apiClient.post("/api/Bookings/validate-qr", { qrCodeData });
    return response.data;
  },
};
