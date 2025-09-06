// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1",
  WS_URL: import.meta.env.VITE_WS_URL || "ws://localhost:3000/api/v1/ws",
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

// API Endpoints
export const ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/auth/login",
  },

  // Master Data (Public)
  MASTER: {
    GATES: "/master/gates",
    ZONES: "/master/zones",
    CATEGORIES: "/master/categories",
  },

  // Subscriptions
  SUBSCRIPTIONS: {
    GET: "/subscriptions/:id",
    VERIFY: "/subscriptions/:id",
  },

  // Tickets
  TICKETS: {
    CHECKIN: "/tickets/checkin",
    CHECKOUT: "/tickets/checkout",
    GET: "/tickets/:id",
  },

  // Admin Endpoints
  ADMIN: {
    // Reports
    REPORTS: {
      PARKING_STATE: "/admin/reports/parking-state",
    },

    // Categories
    CATEGORIES: {
      LIST: "/admin/categories",
      CREATE: "/admin/categories",
      UPDATE: "/admin/categories/:id",
      DELETE: "/admin/categories/:id",
    },

    // Zones
    ZONES: {
      LIST: "/admin/zones",
      CREATE: "/admin/zones",
      UPDATE: "/admin/zones/:id",
      DELETE: "/admin/zones/:id",
      TOGGLE: "/admin/zones/:id/open",
    },

    // Gates
    GATES: {
      LIST: "/admin/gates",
      CREATE: "/admin/gates",
      UPDATE: "/admin/gates/:id",
      DELETE: "/admin/gates/:id",
    },

    // Rush Hours
    RUSH_HOURS: {
      LIST: "/admin/rush-hours",
      CREATE: "/admin/rush-hours",
      UPDATE: "/admin/rush-hours/:id",
      DELETE: "/admin/rush-hours/:id",
    },

    // Vacations
    VACATIONS: {
      LIST: "/admin/vacations",
      CREATE: "/admin/vacations",
      UPDATE: "/admin/vacations/:id",
      DELETE: "/admin/vacations/:id",
    },

    // Users
    USERS: {
      LIST: "/admin/users",
      CREATE: "/admin/users",
    },

    // Subscriptions
    SUBSCRIPTIONS: {
      LIST: "/admin/subscriptions",
      CREATE: "/admin/subscriptions",
      UPDATE: "/admin/subscriptions/:id",
    },

    // Tickets
    TICKETS: {
      LIST: "/admin/tickets",
    },
  },

  // WebSocket
  WS: {
    CONNECT: API_CONFIG.WS_URL,
  },
};

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
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  FORBIDDEN: "Access denied. Insufficient permissions.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION_ERROR: "Please check your input and try again.",
  SERVER_ERROR: "Server error. Please try again later.",
  TIMEOUT: "Request timed out. Please try again.",
};
