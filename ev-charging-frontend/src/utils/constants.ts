// API Configuration
export const API_BASE_URL =
  "https://it223-hvhwgha5b2h5gbcg.southindia-01.azurewebsites.net";

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "ev_charging_auth_token",
  USER_PROFILE: "ev_charging_user_profile",
  THEME_MODE: "ev_charging_theme_mode",
  SIDEBAR_COLLAPSED: "ev_charging_sidebar_collapsed",
} as const;

// Routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",

  // Backoffice routes
  BACKOFFICE: {
    DASHBOARD: "/backoffice",
    EV_OWNERS: "/backoffice/ev-owners",
    EV_OWNERS_CREATE: "/backoffice/ev-owners/create",
    EV_OWNERS_EDIT: "/backoffice/ev-owners/:nic/edit",
    CHARGING_STATIONS: "/backoffice/charging-stations",
    CHARGING_STATIONS_CREATE: "/backoffice/charging-stations/create",
    CHARGING_STATIONS_VIEW: "/backoffice/charging-stations/:id",
    CHARGING_STATIONS_EDIT: "/backoffice/charging-stations/:id/edit",
    BOOKINGS: "/backoffice/bookings",
    USERS: "/backoffice/users",
    USERS_CREATE: "/backoffice/users/create",
  },

  // Station Operator routes
  OPERATOR: {
    DASHBOARD: "/operator",
    BOOKINGS: "/operator/bookings",
    STATIONS: "/operator/stations",
    QR_SCANNER: "/operator/qr-scanner",
  },

  // Common routes
  PROFILE: "/profile",
  SETTINGS: "/settings",
  UNAUTHORIZED: "/unauthorized",
  NOT_FOUND: "/404",
} as const;

// User Roles
export const USER_ROLES = {
  BACKOFFICE: "Backoffice",
  STATION_OPERATOR: "StationOperator",
} as const;

// Booking Status
export const BOOKING_STATUS = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "NoShow",
} as const;

// Station Types
export const STATION_TYPES = {
  AC: "AC",
  DC: "DC",
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],
} as const;

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif"],
} as const;

// Time Constants
export const TIME_CONSTANTS = {
  BOOKING_ADVANCE_DAYS: 7, // 7-day rule
  CANCELLATION_HOURS: 12, // 12-hour rule
  SESSION_TIMEOUT: 60 * 60 * 1000, // 1 hour in milliseconds
  REFRESH_INTERVAL: 30 * 1000, // 30 seconds
} as const;

// Status Colors
export const STATUS_COLORS = {
  [BOOKING_STATUS.PENDING]: "#f59e0b",
  [BOOKING_STATUS.APPROVED]: "#10b981",
  [BOOKING_STATUS.REJECTED]: "#ef4444",
  [BOOKING_STATUS.COMPLETED]: "#6366f1",
  [BOOKING_STATUS.CANCELLED]: "#6b7280",
  [BOOKING_STATUS.NO_SHOW]: "#dc2626",
} as const;

// Navigation Menu Items
export const MENU_ITEMS = {
  BACKOFFICE: [
    {
      title: "Dashboard",
      path: ROUTES.BACKOFFICE.DASHBOARD,
      icon: "dashboard",
    },
    {
      title: "EV Owners",
      path: ROUTES.BACKOFFICE.EV_OWNERS,
      icon: "people",
    },
    {
      title: "Charging Stations",
      path: ROUTES.BACKOFFICE.CHARGING_STATIONS,
      icon: "ev_station",
    },
    {
      title: "Bookings",
      path: ROUTES.BACKOFFICE.BOOKINGS,
      icon: "book_online",
    },
    {
      title: "System Users",
      path: ROUTES.BACKOFFICE.USERS,
      icon: "admin_panel_settings",
    },
  ],
  OPERATOR: [
    {
      title: "Dashboard",
      path: ROUTES.OPERATOR.DASHBOARD,
      icon: "dashboard",
    },
    {
      title: "Bookings",
      path: ROUTES.OPERATOR.BOOKINGS,
      icon: "book_online",
    },
    {
      title: "My Stations",
      path: ROUTES.OPERATOR.STATIONS,
      icon: "ev_station",
    },
    {
      title: "QR Scanner",
      path: ROUTES.OPERATOR.QR_SCANNER,
      icon: "qr_code_scanner",
    },
  ],
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Default Form Values
export const DEFAULT_FORM_VALUES = {
  EV_OWNER: {
    nic: "",
    fullName: "",
    phoneNumber: "",
    email: "",
    address: "",
    password: "",
  },
  CHARGING_STATION: {
    name: "",
    address: "",
    latitude: 0,
    longitude: 0,
    stationType: STATION_TYPES.AC,
    totalSlots: 1,
    operationalHours: {
      openTime: "06:00",
      closeTime: "22:00",
    },
  },
  USER: {
    username: "",
    password: "",
    fullName: "",
    email: "",
    assignedStationId: "",
  },
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: "MMM dd, yyyy",
  DISPLAY_WITH_TIME: "MMM dd, yyyy HH:mm",
  INPUT: "yyyy-MM-dd",
  INPUT_WITH_TIME: "yyyy-MM-ddTHH:mm",
  TIME_ONLY: "HH:mm",
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  UNAUTHORIZED: "You are not authorized to access this resource.",
  FORBIDDEN: "Access denied. Insufficient permissions.",
  NOT_FOUND: "The requested resource was not found.",
  SERVER_ERROR: "Server error. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again.",
  UNKNOWN_ERROR: "An unexpected error occurred.",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: "Login successful",
  LOGOUT: "Logout successful",
  CREATE: "Created successfully",
  UPDATE: "Updated successfully",
  DELETE: "Deleted successfully",
  ACTIVATE: "Activated successfully",
  DEACTIVATE: "Deactivated successfully",
  APPROVE: "Approved successfully",
  REJECT: "Rejected successfully",
} as const;
