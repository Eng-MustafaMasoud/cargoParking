import {
  API_CONFIG,
  ENDPOINTS,
  HTTP_STATUS,
  ERROR_MESSAGES,
} from "../config/api";

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem("token");

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Handle different error types
        if (response.status === HTTP_STATUS.UNAUTHORIZED) {
          // Clear auth data and redirect to login
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
          throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
        }

        if (response.status === HTTP_STATUS.FORBIDDEN) {
          throw new Error(ERROR_MESSAGES.FORBIDDEN);
        }

        if (response.status === HTTP_STATUS.NOT_FOUND) {
          throw new Error(ERROR_MESSAGES.NOT_FOUND);
        }

        if (response.status >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
          throw new Error(ERROR_MESSAGES.SERVER_ERROR);
        }

        // Try to parse error response according to new API format
        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorDetails = {};
        try {
          const errorData = await response.json();
          if (errorData.status === "error") {
            errorMessage = errorData.message || errorMessage;
            errorDetails = errorData.errors || {};
          } else {
            errorMessage = errorData.message || errorMessage;
          }
        } catch {
          // If JSON parsing fails, use status text
          errorMessage = response.statusText || errorMessage;
        }

        const error = new Error(errorMessage);
        error.status = response.status;
        error.statusText = response.statusText;
        error.details = errorDetails;
        throw error;
      }

      return await response.json();
    } catch (error) {
      // Handle timeout errors
      if (error.name === "AbortError") {
        throw new Error(ERROR_MESSAGES.TIMEOUT);
      }

      // Handle network errors
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        const networkError = new Error(ERROR_MESSAGES.NETWORK_ERROR);
        networkError.isNetworkError = true;
        throw networkError;
      }

      // Re-throw with additional context
      if (error.status) {
        throw error;
      }

      // Wrap other errors
      const wrappedError = new Error(
        error.message || "An unexpected error occurred"
      );
      wrappedError.originalError = error;
      throw wrappedError;
    }
  }

  // Authentication
  async login(credentials) {
    return this.request(ENDPOINTS.AUTH.LOGIN, {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  // Master data
  async getGates() {
    return this.request(ENDPOINTS.MASTER.GATES);
  }

  async getZones(gateId = null) {
    const url = gateId
      ? `${ENDPOINTS.MASTER.ZONES}?gateId=${gateId}`
      : ENDPOINTS.MASTER.ZONES;
    console.log("API: Getting zones with URL:", url);
    const result = await this.request(url);
    console.log("API: Zones result:", result);
    return result;
  }

  async getCategories() {
    return this.request(ENDPOINTS.MASTER.CATEGORIES);
  }

  // Tickets
  async checkinTicket(data) {
    return this.request(ENDPOINTS.TICKETS.CHECKIN, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async checkoutTicket(data) {
    return this.request(ENDPOINTS.TICKETS.CHECKOUT, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getTicket(ticketId) {
    return this.request(ENDPOINTS.TICKETS.GET.replace(":id", ticketId));
  }

  // Subscriptions
  async getSubscription(subscriptionId) {
    return this.request(
      ENDPOINTS.SUBSCRIPTIONS.GET.replace(":id", subscriptionId)
    );
  }

  // Admin - Reports
  async getParkingStateReport() {
    return this.request(ENDPOINTS.ADMIN.REPORTS.PARKING_STATE);
  }

  // Admin - Categories

  async createCategory(data) {
    return this.request(ENDPOINTS.ADMIN.CATEGORIES.CREATE, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id, data) {
    return this.request(ENDPOINTS.ADMIN.CATEGORIES.UPDATE.replace(":id", id), {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id) {
    return this.request(ENDPOINTS.ADMIN.CATEGORIES.DELETE.replace(":id", id), {
      method: "DELETE",
    });
  }

  // Admin - Zones

  async createZone(data) {
    return this.request(ENDPOINTS.ADMIN.ZONES.CREATE, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateZone(id, data) {
    return this.request(ENDPOINTS.ADMIN.ZONES.UPDATE.replace(":id", id), {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteZone(id) {
    return this.request(ENDPOINTS.ADMIN.ZONES.DELETE.replace(":id", id), {
      method: "DELETE",
    });
  }

  async toggleZoneOpen(id, open) {
    return this.request(ENDPOINTS.ADMIN.ZONES.TOGGLE.replace(":id", id), {
      method: "PUT",
      body: JSON.stringify({ open }),
    });
  }

  // Admin - Rush Hours
  async getRushHours() {
    return this.request(ENDPOINTS.ADMIN.RUSH_HOURS.LIST);
  }

  async createRushHour(data) {
    return this.request(ENDPOINTS.ADMIN.RUSH_HOURS.CREATE, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateRushHour(id, data) {
    return this.request(ENDPOINTS.ADMIN.RUSH_HOURS.UPDATE.replace(":id", id), {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteRushHour(id) {
    return this.request(ENDPOINTS.ADMIN.RUSH_HOURS.DELETE.replace(":id", id), {
      method: "DELETE",
    });
  }

  // Admin - Vacations
  async getVacations() {
    return this.request(ENDPOINTS.ADMIN.VACATIONS.LIST);
  }

  async createVacation(data) {
    return this.request(ENDPOINTS.ADMIN.VACATIONS.CREATE, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateVacation(id, data) {
    return this.request(ENDPOINTS.ADMIN.VACATIONS.UPDATE.replace(":id", id), {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteVacation(id) {
    return this.request(ENDPOINTS.ADMIN.VACATIONS.DELETE.replace(":id", id), {
      method: "DELETE",
    });
  }

  // Admin - Subscriptions
  async getSubscriptions() {
    return this.request(ENDPOINTS.ADMIN.SUBSCRIPTIONS.LIST);
  }

  async createSubscription(data) {
    return this.request(ENDPOINTS.ADMIN.SUBSCRIPTIONS.CREATE, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateSubscription(id, data) {
    return this.request(
      ENDPOINTS.ADMIN.SUBSCRIPTIONS.UPDATE.replace(":id", id),
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  }

  // Admin - Users
  async getUsers() {
    return this.request(ENDPOINTS.ADMIN.USERS.LIST);
  }

  async createUser(data) {
    return this.request(ENDPOINTS.ADMIN.USERS.CREATE, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Admin - Gates

  async createGate(data) {
    return this.request(ENDPOINTS.ADMIN.GATES.CREATE, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateGate(id, data) {
    return this.request(ENDPOINTS.ADMIN.GATES.UPDATE.replace(":id", id), {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteGate(id) {
    return this.request(ENDPOINTS.ADMIN.GATES.DELETE.replace(":id", id), {
      method: "DELETE",
    });
  }

  // Admin - Tickets
  async getTickets(status = null) {
    const endpoint = status
      ? `${ENDPOINTS.ADMIN.TICKETS.LIST}?status=${status}`
      : ENDPOINTS.ADMIN.TICKETS.LIST;
    return this.request(endpoint);
  }
}

export const apiService = new ApiService();
