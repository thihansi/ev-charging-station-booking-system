// User related types
export interface User {
  id: string;
  username: string;
  role: UserRole;
  fullName?: string;
  email?: string;
}

export type UserRole = 'Backoffice' | 'StationOperator';

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
  fullName: string;
  phoneNumber: string;
  email: string;
  address: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEVOwnerRequest {
  nic: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  address: string;
  password: string;
}

export interface UpdateEVOwnerRequest {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
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
  operationalHours: OperationalHours;
  isActive: boolean;
  qrCodeData?: string;
  createdAt: string;
  updatedAt: string;
}

export type StationType = 'AC' | 'DC';

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

export type BookingStatus = 'Pending' | 'Approved' | 'Rejected' | 'Completed' | 'Cancelled' | 'NoShow';

export interface CreateBookingRequest {
  evOwnerNic: string;
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
  align?: 'left' | 'right' | 'center';
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