// User related types
export interface User {
  id: string;
  username: string;
  role: UserRole; // Always string role after mapping
  fullName?: string;
  email?: string;
}

export type UserRole = "Backoffice" | "StationOperator";

// API Response User (what backend actually returns)
export interface ApiUser {
  id: string;
  username: string;
  role: number; // 0 = Backoffice, 1 = StationOperator
  fullName?: string;
  email?: string;
}

export interface SystemUser {
  id: string;
  username: string;
  role: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  fullName: string;
  email: string;
  assignedStationId?: string; // For Station Operators
}

// EV Owner related types
export interface EVOwner {
  nic: string;
  name: string; // API uses 'name', not 'fullName'
  email: string;
  phone: string; // API uses 'phone', not 'phoneNumber'
  isActive: boolean;
}

export interface CreateEVOwnerRequest {
  nic: string;
  name: string; // API uses 'name'
  email: string;
  phone: string; // API uses 'phone'
  isActive?: boolean; // Optional, defaults to true
  password?: string; // Optional for profile-only creation
}

export interface UpdateEVOwnerRequest {
  nic?: string;
  name?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
}

// Charging Station related types
export interface ChargingStation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  stationType: StationType;
  availableSlots: number;
  totalSlots: number;
  operationalHours?: OperationalHours; // Made optional to handle API inconsistencies
  isActive: boolean;
  qrCodeData?: string;
  createdAt: string;
  updatedAt: string;
}

export type StationType = "AC" | "DC";

export interface OperationalHours {
  openTime: string; // Format: "HH:mm"
  closeTime: string; // Format: "HH:mm"
}

export interface CreateChargingStationRequest {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  stationType: StationType;
  totalSlots: number;
  operationalHours: OperationalHours;
}

export interface UpdateChargingStationRequest {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  stationType?: StationType;
  totalSlots?: number;
  operationalHours?: OperationalHours;
}

// Booking related types
export interface Booking {
  id: string;
  evOwnerNic: string;
  chargingStationId: string;
  reservationDateTime: string;
  status: BookingStatus;
  qrCodeData?: string;
  createdAt: string;
  updatedAt: string;
  evOwner?: EVOwner;
  chargingStation?: ChargingStation;
}

export type BookingStatus =
  | "Pending"    // 0
  | "Approved"   // 1
  | "Rejected"   // 2
  | "Completed"  // 3
  | "Cancelled"; // 4

// Enum mapping for backend compatibility
export const BookingStatusEnum = {
  Pending: 0,
  Approved: 1,
  Rejected: 2,
  Completed: 3,
  Cancelled: 4
} as const;

// Reverse mapping from numeric values to string
export const BookingStatusFromEnum: Record<number, BookingStatus> = {
  0: "Pending",
  1: "Approved", 
  2: "Rejected",
  3: "Completed",
  4: "Cancelled"
};

// User-friendly status display names
export const BookingStatusDisplay: Record<BookingStatus, string> = {
  Pending: "Pending",
  Approved: "Approved", 
  Rejected: "Rejected",
  Completed: "Completed",
  Cancelled: "Cancelled"
};

// Function to get display name for status
export const getBookingStatusDisplay = (status: BookingStatus | number): string => {
  if (typeof status === 'number') {
    const statusString = BookingStatusFromEnum[status];
    return statusString ? BookingStatusDisplay[statusString] : 'Unknown';
  }
  return BookingStatusDisplay[status] || 'Unknown';
};

// Function to get status color for UI components
export const getBookingStatusColor = (status: BookingStatus): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
  switch (status) {
    case 'Pending':
      return 'warning';
    case 'Approved':
      return 'success';
    case 'Rejected':
      return 'error';
    case 'Completed':
      return 'primary';
    case 'Cancelled':
      return 'error';
    default:
      return 'default';
  }
};

export interface CreateBookingRequest {
  evOwnerNic: string;
  chargingStationId: string;
  reservationDateTime: string;
}

// EV Owner booking request (no evOwnerNic needed - from JWT)
export interface CreateEVOwnerBookingRequest {
  chargingStationId: string;
  reservationDateTime: string;
}

// Booking summary request for preview
export interface BookingSummaryRequest {
  chargingStationId: string;
  reservationDateTime: string;
}

export interface UpdateBookingRequest {
  reservationDateTime?: string;
  status?: BookingStatus;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// Common types
export interface SelectOption {
  value: string;
  label: string;
}

export interface TableColumn {
  id: string;
  label: string;
  minWidth?: number;
  align?: "left" | "right" | "center";
  format?: (value: any) => string;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

// Filter types
export interface ChargingStationFilters {
  stationType?: StationType;
  isActive?: boolean;
  search?: string;
}

export interface BookingFilters {
  status?: BookingStatus;
  dateFrom?: string;
  dateTo?: string;
  evOwnerNic?: string;
  chargingStationId?: string;
}

export interface EVOwnerFilters {
  isActive?: boolean;
  isVerified?: boolean;
  search?: string;
}
