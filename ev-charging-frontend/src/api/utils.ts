import { AxiosError } from "axios";

/**
 * Enhanced API error handling utilities
 */

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

/**
 * Data transformation utilities for API compatibility
 */

import type { CreateChargingStationRequest, UpdateChargingStationRequest, CreateBookingRequest, CreateEVOwnerBookingRequest, ChargingStation } from "../types";

// Transform backend charging station response to frontend format
export const transformChargingStationFromBackend = (backendData: any): ChargingStation => {
  // Parse schedule string (e.g., "08:00-18:00") into operational hours
  let operationalHours = undefined;
  if (backendData.schedule && typeof backendData.schedule === 'string') {
    const scheduleMatch = backendData.schedule.match(/^(\d{2}:\d{2})-(\d{2}:\d{2})$/);
    if (scheduleMatch) {
      operationalHours = {
        openTime: scheduleMatch[1],
        closeTime: scheduleMatch[2]
      };
    }
  }

  return {
    id: backendData.id,
    name: backendData.name,
    address: backendData.address,
    latitude: backendData.latitude,
    longitude: backendData.longitude,
    stationType: backendData.type === 1 ? "DC" : "AC", // Convert number to string
    totalSlots: backendData.totalSlots || backendData.availableSlots, // Use totalSlots if available, otherwise availableSlots
    availableSlots: backendData.availableSlots,
    operationalHours,
    isActive: backendData.isActive,
    qrCodeData: backendData.qrCodeData,
    createdAt: backendData.createdAt || new Date().toISOString(),
    updatedAt: backendData.updatedAt || new Date().toISOString()
  };
};

// Transform frontend charging station data to backend format
export const transformChargingStationForBackend = (frontendData: CreateChargingStationRequest) => {
  return {
    name: frontendData.name,
    address: frontendData.address,
    latitude: frontendData.latitude,
    longitude: frontendData.longitude,
    type: frontendData.stationType === "DC" ? 1 : 0, // Convert string to number
    availableSlots: frontendData.totalSlots,
    schedule: `${frontendData.operationalHours.openTime}-${frontendData.operationalHours.closeTime}`,
    isActive: true
  };
};

// Transform frontend update data to backend format
export const transformUpdateChargingStationForBackend = (frontendData: UpdateChargingStationRequest) => {
  const backendData: any = {};
  
  if (frontendData.name !== undefined) backendData.name = frontendData.name;
  if (frontendData.address !== undefined) backendData.address = frontendData.address;
  if (frontendData.latitude !== undefined) backendData.latitude = frontendData.latitude;
  if (frontendData.longitude !== undefined) backendData.longitude = frontendData.longitude;
  if (frontendData.stationType !== undefined) {
    backendData.type = frontendData.stationType === "DC" ? 1 : 0;
  }
  if (frontendData.totalSlots !== undefined) {
    backendData.availableSlots = frontendData.totalSlots;
  }
  if (frontendData.operationalHours !== undefined) {
    backendData.schedule = `${frontendData.operationalHours.openTime}-${frontendData.operationalHours.closeTime}`;
  }
  
  return backendData;
};

/**
 * Extract meaningful error message from API response
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    // Check for specific error messages from the backend
    const backendMessage = error.response?.data?.message || error.response?.data?.Message;
    if (backendMessage) {
      return backendMessage;
    }

    // Handle specific HTTP status codes
    switch (error.response?.status) {
      case 400:
        return "Invalid request data. Please check all required fields and try again.";
      case 401:
        return "You need to log in to access this resource.";
      case 403:
        return "You don't have permission to perform this action.";
      case 404:
        return "The requested resource was not found.";
      case 409:
        return "This action conflicts with existing data.";
      case 422:
        return "The submitted data is invalid or incomplete.";
      case 500:
        return "Server error. Please try again later.";
      case 503:
        return "Service is temporarily unavailable. Please try again later.";
      default:
        if (error.response?.status) {
          return `Request failed with status ${error.response.status}`;
        }
    }

    // Network errors
    if (error.code === "NETWORK_ERROR" || !error.response) {
      return "Network error. Please check your internet connection.";
    }

    // Timeout errors
    if (error.code === "ECONNABORTED") {
      return "Request timeout. Please try again.";
    }

    return error.message || "An unexpected error occurred.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
};

/**
 * Create a standardized API error object
 */
export const createApiError = (error: unknown): ApiError => {
  const message = getErrorMessage(error);
  let status: number | undefined;
  let code: string | undefined;
  let details: any;

  if (error instanceof AxiosError) {
    status = error.response?.status;
    code = error.code;
    details = error.response?.data;
  }

  return {
    message,
    status,
    code,
    details,
  };
};

/**
 * API wrapper with enhanced error handling
 */
export const apiWrapper = async <T>(
  apiCall: () => Promise<T>,
  errorContext?: string
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error) {
    const apiError = createApiError(error);
    
    // Log error in development
    if (import.meta.env.DEV) {
      console.error(`[API Error${errorContext ? ` - ${errorContext}` : ""}]`, apiError);
    }

    // Re-throw with enhanced error information
    const enhancedError = new Error(apiError.message);
    (enhancedError as any).apiError = apiError;
    throw enhancedError;
  }
};

/**
 * Utility to check if the API is healthy
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    // You can implement a health check endpoint or use any lightweight endpoint
    // For now, we'll use a simple request to the auth endpoint
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.warn("[API Health Check] Failed:", error);
    return false;
  }
};

/**
 * Utility to validate API base URL configuration
 */
export const validateApiConfig = (): boolean => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  
  if (!baseUrl) {
    console.error("[API Config] VITE_API_BASE_URL is not configured");
    return false;
  }

  try {
    new URL(baseUrl);
    console.log("[API Config] Valid base URL:", baseUrl);
    return true;
  } catch (error) {
    console.error("[API Config] Invalid base URL:", baseUrl);
    return false;
  }
};

/**
 * Request retry utility for failed requests
 */
export const retryRequest = async <T>(
  request: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await request();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        break;
      }

      // Don't retry on 4xx errors (client errors)
      if (error instanceof AxiosError && error.response?.status && error.response.status < 500) {
        break;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError;
};

// Transform frontend booking data to backend format (Admin/Backoffice)
export const transformBookingForBackend = (frontendData: CreateBookingRequest) => {
  return {
    evOwnerNIC: frontendData.evOwnerNic, // Convert camelCase to backend format
    chargingStationId: frontendData.chargingStationId,
    reservationDateTime: frontendData.reservationDateTime
  };
};

// Transform frontend EV Owner booking data to backend format
export const transformEVOwnerBookingForBackend = (frontendData: CreateEVOwnerBookingRequest) => {
  return {
    chargingStationId: frontendData.chargingStationId,
    reservationDateTime: frontendData.reservationDateTime
  };
};