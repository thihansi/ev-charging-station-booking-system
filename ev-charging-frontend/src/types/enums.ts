// Booking Status Type
export type BookingStatus =
  | "Pending" // 0
  | "Approved" // 1
  | "Rejected" // 2
  | "Completed" // 3
  | "Cancelled"; // 4

export const BOOKING_STATUS = {
  PENDING: "Pending" as const,
  APPROVED: "Approved" as const,
  REJECTED: "Rejected" as const,
  COMPLETED: "Completed" as const,
  CANCELLED: "Cancelled" as const,
} as const;

// Station Type
export type StationType = "Fast" | "Rapid" | "Standard";

export const STATION_TYPE = {
  FAST: "Fast" as const,
  RAPID: "Rapid" as const,
  STANDARD: "Standard" as const,
} as const;

// Connector Type
export type ConnectorType = "Type1" | "Type2" | "CHAdeMO" | "CCS";

export const CONNECTOR_TYPE = {
  TYPE1: "Type1" as const,
  TYPE2: "Type2" as const,
  CHAdeMO: "CHAdeMO" as const,
  CCS: "CCS" as const,
} as const;

// User Role Type
export type UserRole = "Backoffice" | "StationOperator";

export const USER_ROLE = {
  BACKOFFICE: "Backoffice" as const,
  STATION_OPERATOR: "StationOperator" as const,
} as const;

// Payment Status Type
export type PaymentStatus = "Pending" | "Completed" | "Failed" | "Refunded";

export const PAYMENT_STATUS = {
  PENDING: "Pending" as const,
  COMPLETED: "Completed" as const,
  FAILED: "Failed" as const,
  REFUNDED: "Refunded" as const,
} as const;

// Charge Session Status Type
export type ChargeSessionStatus = "Active" | "Completed" | "Interrupted";

export const CHARGE_SESSION_STATUS = {
  ACTIVE: "Active" as const,
  COMPLETED: "Completed" as const,
  INTERRUPTED: "Interrupted" as const,
} as const;
