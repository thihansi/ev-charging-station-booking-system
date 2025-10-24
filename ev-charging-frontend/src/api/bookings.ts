import apiClient from "./client";
import type { Booking } from "../types";
import { BookingStatusFromEnum } from "../types";

// Transform booking response from backend
const transformBookingFromBackend = (backendBooking: any): Booking => {
  const id = backendBooking.id || backendBooking._id || backendBooking.bookingId || 'unknown';
  
  if (!backendBooking.id && !backendBooking._id && !backendBooking.bookingId) {
    console.warn("⚠️ Booking without ID:", backendBooking);
  }
  
  return {
    id: id,
    evOwnerNic: backendBooking.evOwnerNIC || backendBooking.evOwnerNic,
    chargingStationId: backendBooking.chargingStationId || backendBooking.stationId,
    reservationDateTime: backendBooking.reservationDateTime || backendBooking.dateTime,
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
  // Get all bookings (admin) or operator's station bookings
  getAll: async (): Promise<Booking[]> => {
    try {
      console.log("📡 Fetching all bookings from /api/Bookings...");
      const response = await apiClient.get<any>("/api/Bookings");
      console.log("📋 Raw bookings response:", response.data);

      // Handle both array response and object with bookings property
      let bookingsData = response.data;
      if (
        response.data &&
        typeof response.data === "object" &&
        "bookings" in response.data
      ) {
        bookingsData = (response.data as any).bookings;
        console.log(`📋 Extracted ${bookingsData.length} bookings from response object`);
      }

      if (!Array.isArray(bookingsData)) {
        console.warn("❌ Bookings data is not an array:", bookingsData);
        return [];
      }

      const transformedBookings = bookingsData.map(transformBookingFromBackend);
      console.log(
        `✅ Successfully fetched ${transformedBookings.length} bookings from /api/Bookings`
      );
      return transformedBookings;
    } catch (error: any) {
      console.error("❌ Error fetching all bookings:", error);
      
      // Fallback to status endpoints if main endpoint fails
      console.log("⚠️ Main endpoint failed, trying status endpoints as fallback...");
      try {
        return await bookingApi.getAllByStatus();
      } catch (statusError) {
        console.error("❌ Status endpoints also failed:", statusError);
        return [];
      }
    }
  },

  // Get all bookings for station operator's stations
  getOperatorStationBookings: async (): Promise<Booking[]> => {
    try {
      console.log("📡 Fetching operator station bookings - trying base endpoint first...");
      
      // First try the base operator endpoint which should return ALL bookings
      try {
        console.log("📡 Trying /api/Bookings/operator/my-station-bookings...");
        const response = await apiClient.get<any[]>("/api/Bookings/operator/my-station-bookings");
        console.log("✅ Base operator endpoint response:", response.data);
        
        let bookingsData = response.data;
        if (
          response.data &&
          typeof response.data === "object" &&
          "bookings" in response.data
        ) {
          bookingsData = (response.data as any).bookings;
        }

        if (Array.isArray(bookingsData) && bookingsData.length > 0) {
          const transformedBookings = bookingsData.map(transformBookingFromBackend);
          console.log(`✅ Successfully fetched ${transformedBookings.length} bookings from base operator endpoint`);
          return transformedBookings;
        }
      } catch (baseError: any) {
        console.warn("⚠️ Base operator endpoint failed:", baseError.message);
        console.warn("⚠️ Status:", baseError.response?.status);
        console.warn("⚠️ Response:", baseError.response?.data);
      }
      
      // Fallback: Try to get bookings from different status endpoints and combine them
      console.log("📡 Falling back to status-specific endpoints...");
      const bookingPromises = [
        // Get pending bookings
        apiClient.get<any[]>("/api/Bookings/operator/my-station-bookings/pending")
          .then(res => {
            console.log("✅ Pending bookings:", res.data);
            return res.data;
          })
          .catch(err => {
            console.warn("⚠️ Failed to fetch pending bookings:", err.message);
            return [];
          }),
        
        // Get active bookings
        apiClient.get<any[]>("/api/Bookings/operator/my-station-bookings/active")
          .then(res => {
            console.log("✅ Active bookings:", res.data);
            return res.data;
          })
          .catch(err => {
            console.warn("⚠️ Failed to fetch active bookings:", err.message);
            return [];
          }),
      ];

      const results = await Promise.all(bookingPromises);
      
      // Combine all bookings and remove duplicates
      const allBookingsData = results.flat();
      const uniqueBookings = Array.from(
        new Map(allBookingsData.map(booking => [booking.id || booking._id, booking])).values()
      );

      console.log(`📋 Combined ${uniqueBookings.length} unique bookings from status endpoints`);

      if (!Array.isArray(uniqueBookings)) {
        console.warn("❌ Operator bookings data is not an array:", uniqueBookings);
        return [];
      }

      const transformedBookings = uniqueBookings.map(transformBookingFromBackend);
      console.log(
        `✅ Successfully fetched ${transformedBookings.length} operator station bookings`
      );
      return transformedBookings;
    } catch (error) {
      console.error("❌ Error fetching operator station bookings:", error);
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

  // Cancel/Delete booking (using status update since DELETE is forbidden)
  cancel: async (id: string): Promise<{ message: string }> => {
    try {
      console.log("🗑️ Cancelling booking via status update - ID:", id);
      console.log("🗑️ PUT request to:", `/api/Bookings/${id}`);
      
      // Use status update instead of DELETE to avoid 403 Forbidden
      const response = await apiClient.put(`/api/Bookings/${id}`, { 
        status: 4 // Cancelled status (from enum: Cancelled = 4)
      });
      
      console.log("✅ Cancel response:", response.data);
      console.log("✅ Status code:", response.status);
      return response.data;
    } catch (error: any) {
      console.error("❌ Cancel booking failed:", {
        bookingId: id,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
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

  // Get active bookings
  getActive: async (): Promise<Booking[]> => {
    const response = await apiClient.get<any[]>("/api/Bookings/active");
    return response.data.map(transformBookingFromBackend);
  },

  // Get all bookings by combining multiple endpoints (fallback method)
  getAllByStatus: async (): Promise<Booking[]> => {
    try {
      console.log("📡 Fetching all bookings by combining status endpoints...");
      
      const bookingPromises = [
        // Get pending bookings (Status: 0)
        apiClient.get<any>("/api/Bookings/pending")
          .then(res => {
            const bookings = res.data?.bookings || res.data || [];
            console.log(`✅ Fetched ${bookings.length} pending bookings`);
            return bookings;
          })
          .catch((err) => {
            console.log(`⚠️ Could not fetch pending bookings:`, err.response?.status);
            return [];
          }),
        
        // Get approved bookings (Status: 1)
        apiClient.get<any>("/api/Bookings/approved")
          .then(res => {
            const bookings = res.data?.bookings || res.data || [];
            console.log(`✅ Fetched ${bookings.length} approved bookings`);
            return bookings;
          })
          .catch((err) => {
            console.log(`⚠️ Could not fetch approved bookings:`, err.response?.status);
            return [];
          }),
        
        // Get rejected bookings (Status: 2)
        apiClient.get<any>("/api/Bookings/rejected")
          .then(res => {
            const bookings = res.data?.bookings || res.data || [];
            console.log(`✅ Fetched ${bookings.length} rejected bookings`);
            return bookings;
          })
          .catch((err) => {
            console.log(`⚠️ Could not fetch rejected bookings:`, err.response?.status);
            return [];
          }),
        
        // Get completed bookings (Status: 3) - if endpoint exists
        apiClient.get<any>("/api/Bookings/completed")
          .then(res => {
            const bookings = res.data?.bookings || res.data || [];
            console.log(`✅ Fetched ${bookings.length} completed bookings`);
            return bookings;
          })
          .catch((err) => {
            console.log(`⚠️ Could not fetch completed bookings:`, err.response?.status);
            return [];
          }),
        
        // Get cancelled bookings (Status: 4) - if endpoint exists
        apiClient.get<any>("/api/Bookings/cancelled")
          .then(res => {
            const bookings = res.data?.bookings || res.data || [];
            console.log(`✅ Fetched ${bookings.length} cancelled bookings`);
            return bookings;
          })
          .catch((err) => {
            console.log(`⚠️ Could not fetch cancelled bookings:`, err.response?.status);
            return [];
          }),
      ];

      const results = await Promise.all(bookingPromises);
      const allBookingsData = results.flat();
      
      // Remove duplicates based on booking ID
      const uniqueBookings = Array.from(
        new Map(allBookingsData.map(booking => [booking.id || booking._id, booking])).values()
      );

      console.log(`📋 Combined ${uniqueBookings.length} unique bookings from status endpoints`);
      return uniqueBookings.map(transformBookingFromBackend);
    } catch (error) {
      console.error("❌ Error fetching bookings by status:", error);
      return [];
    }
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
