import apiClient from "./client";
import {
  transformBookingForBackend,
  transformEVOwnerBookingForBackend,
} from "./utils";
import type {
  Booking,
  CreateBookingRequest,
  CreateEVOwnerBookingRequest,
  BookingSummaryRequest,
  UpdateBookingRequest,
} from "../types";
import { BookingStatusFromEnum } from "../types";

// Transform booking response from backend (handles numeric status to string and field mapping)
const transformBookingFromBackend = (backendBooking: any): Booking => {
  return {
    // Map _id to id if needed
    id: backendBooking.id || backendBooking._id,
    evOwnerNic: backendBooking.evOwnerNIC || backendBooking.evOwnerNic,
    chargingStationId: backendBooking.chargingStationId,
    bookingDate: backendBooking.bookingDate,
    reservationDateTime: backendBooking.reservationDateTime,
    // Transform numeric status to string
    status: typeof backendBooking.status === "number" 
      ? BookingStatusFromEnum[backendBooking.status] 
      : backendBooking.status,
    isActive: backendBooking.isActive,
    qrCode: backendBooking.qrCode,
    approvedBy: backendBooking.approvedBy,
    approvedAt: backendBooking.approvedAt,
    rejectionReason: backendBooking.rejectionReason,
    // Include any other fields from the backend
    ...backendBooking
  };
};

export const bookingApi = {
  // Get all bookings - Try multiple approaches to get all 9 bookings
  getAll: async (): Promise<Booking[]> => {
    const allBookings: Booking[] = [];
    const seenIds = new Set<string>();

    try {
      console.log('📡 Attempting to fetch ALL bookings...');

      // Method 1: Try direct GET to /api/Bookings (might work with auth)
      try {
        console.log('🔄 Trying GET /api/Bookings...');
        const response = await apiClient.get<any[]>("/api/Bookings");
        const bookings = response.data.map(transformBookingFromBackend);
        console.log(`✅ GET /api/Bookings returned ${bookings.length} bookings`);
        
        bookings.forEach(booking => {
          if (!seenIds.has(booking.id)) {
            allBookings.push(booking);
            seenIds.add(booking.id);
          }
        });
        
        // If this works and we get all bookings, return early
        if (bookings.length >= 9) {
          console.log('🎯 Found all bookings via GET /api/Bookings!');
          return allBookings;
        }
      } catch (error: any) {
        console.log('❌ GET /api/Bookings failed:', error.response?.status);
      }

      // Method 2: Get pending bookings
      try {
        console.log('🔄 Trying /api/Bookings/pending...');
        const response = await apiClient.get<any[]>("/api/Bookings/pending");
        const bookings = response.data.map(transformBookingFromBackend);
        console.log(`✅ Pending endpoint returned ${bookings.length} bookings`);
        
        bookings.forEach(booking => {
          if (!seenIds.has(booking.id)) {
            allBookings.push(booking);
            seenIds.add(booking.id);
          }
        });
      } catch (error: any) {
        console.log('❌ Pending bookings failed:', error.response?.status);
      }

      // Method 3: Try my-bookings endpoints (might return user's bookings)
      try {
        console.log('🔄 Trying /api/Bookings/my-bookings...');
        const response = await apiClient.get<any[]>("/api/Bookings/my-bookings");
        const bookings = response.data.map(transformBookingFromBackend);
        console.log(`✅ My-bookings returned ${bookings.length} bookings`);
        
        bookings.forEach(booking => {
          if (!seenIds.has(booking.id)) {
            allBookings.push(booking);
            seenIds.add(booking.id);
          }
        });
      } catch (error: any) {
        console.log('❌ My-bookings failed:', error.response?.status);
      }

      // Method 4: Try upcoming bookings
      try {
        console.log('🔄 Trying /api/Bookings/my-bookings/upcoming...');
        const response = await apiClient.get<any[]>("/api/Bookings/my-bookings/upcoming");
        const bookings = response.data.map(transformBookingFromBackend);
        console.log(`✅ Upcoming bookings returned ${bookings.length} bookings`);
        
        bookings.forEach(booking => {
          if (!seenIds.has(booking.id)) {
            allBookings.push(booking);
            seenIds.add(booking.id);
          }
        });
      } catch (error: any) {
        console.log('❌ Upcoming bookings failed:', error.response?.status);
      }

      // Method 5: Try booking history
      try {
        console.log('🔄 Trying /api/Bookings/my-bookings/history...');
        const response = await apiClient.get<any[]>("/api/Bookings/my-bookings/history");
        const bookings = response.data.map(transformBookingFromBackend);
        console.log(`✅ History returned ${bookings.length} bookings`);
        
        bookings.forEach(booking => {
          if (!seenIds.has(booking.id)) {
            allBookings.push(booking);
            seenIds.add(booking.id);
          }
        });
      } catch (error: any) {
        console.log('❌ History failed:', error.response?.status);
      }

      console.log(`� Total unique bookings collected: ${allBookings.length}/9 expected`);
      console.log('🔍 Final booking data:', allBookings);

      if (allBookings.length === 0) {
        throw new Error('No bookings could be retrieved from any endpoint');
      }

      return allBookings;

    } catch (error: any) {
      console.error('❌ Error fetching bookings:', error);
      
      if (error.response?.status === 401) {
        console.error('🔒 Authentication required. Please log in.');
      } else if (error.response?.status === 403) {
        console.error('🚫 Access denied. Check user permissions.');
      }
      
      throw error;
    }
  },

  // Get booking by ID
  getById: async (id: string): Promise<Booking> => {
    const response = await apiClient.get<any>(`/api/Bookings/${id}`);
    return transformBookingFromBackend(response.data);
  },

  // Create new booking (Admin/Backoffice)
  create: async (
    bookingData: CreateBookingRequest
  ): Promise<{ message: string; id: string }> => {
    console.log("[Booking API] Creating booking with data:", bookingData);
    const transformedData = transformBookingForBackend(bookingData);
    console.log("[Booking API] Transformed data for backend:", transformedData);
    const response = await apiClient.post("/api/Bookings", transformedData);
    console.log("[Booking API] Response:", response.data);
    return response.data;
  },

  // Update booking
  update: async (
    id: string,
    bookingData: UpdateBookingRequest
  ): Promise<{ message: string }> => {
    const response = await apiClient.put(`/api/Bookings/${id}`, bookingData);
    return response.data;
  },

  // Cancel booking
  cancel: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/api/Bookings/${id}`);
    return response.data;
  },

  // Approve booking (Station Operator)
  approve: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.post(`/api/Bookings/${id}/approve`);
    return response.data;
  },

  // Reject booking (Station Operator)
  reject: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.post(`/api/Bookings/${id}/reject`);
    return response.data;
  },

  // Get pending bookings
  getPending: async (): Promise<Booking[]> => {
    const response = await apiClient.get<any[]>("/api/Bookings/pending");
    return response.data.map(transformBookingFromBackend);
  },

  // Validate QR code
  validateQR: async (
    qrCode: string
  ): Promise<{ isValid: boolean; booking?: Booking }> => {
    const response = await apiClient.post("/api/Bookings/validate-qr", {
      qrCode,
    });
    return {
      ...response.data,
      booking: response.data.booking
        ? transformBookingFromBackend(response.data.booking)
        : undefined,
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
    const response = await apiClient.post("/api/Bookings/summary", summaryData);
    return response.data;
  },

  // Create booking as EV Owner (no evOwnerNic needed)
  createAsEVOwner: async (
    bookingData: CreateEVOwnerBookingRequest
  ): Promise<{ message: string; booking: Booking }> => {
    const transformedData = transformEVOwnerBookingForBackend(bookingData);
    const response = await apiClient.post("/api/Bookings", transformedData);
    return {
      ...response.data,
      booking: transformBookingFromBackend(response.data.booking),
    };
  },

  // Get my upcoming bookings (EV Owner)
  getMyUpcomingBookings: async (): Promise<Booking[]> => {
    const response = await apiClient.get<any[]>(
      "/api/Bookings/my-bookings/upcoming"
    );
    return response.data.map(transformBookingFromBackend);
  },

  // Get my booking history (EV Owner)
  getMyBookingHistory: async (): Promise<Booking[]> => {
    const response = await apiClient.get<any[]>(
      "/api/Bookings/my-bookings/history"
    );
    return response.data.map(transformBookingFromBackend);
  },

  // Generate QR code for booking
  generateQRCode: async (
    bookingId: string
  ): Promise<{ qrCode: string; qrCodeImage: string }> => {
    const response = await apiClient.get(`/api/Bookings/${bookingId}/qrcode`);
    return response.data;
  },
};
