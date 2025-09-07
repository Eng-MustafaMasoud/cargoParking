const API_BASE_URL = 'http://localhost:3000/api/v1'

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const token = localStorage.getItem('authToken')
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  // Authentication
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  // Master Data
  async getGates() {
    return this.request('/master/gates')
  }

  async getZones(gateId) {
    return this.request(`/master/zones?gateId=${gateId}`)
  }

  async getCategories() {
    return this.request('/master/categories')
  }

  // Tickets
  async checkinTicket(data) {
    return this.request('/tickets/checkin', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async checkoutTicket(data) {
    return this.request('/tickets/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getTicket(ticketId) {
    return this.request(`/tickets/${ticketId}`)
  }

  // Subscriptions
  async getSubscription(subscriptionId) {
    return this.request(`/subscriptions/${subscriptionId}`)
  }

  // Admin
  async getParkingStateReport() {
    return this.request('/admin/reports/parking-state')
  }

  async getUsers() {
    return this.request('/admin/users')
  }

  async createUser(userData) {
    return this.request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async updateZoneStatus(zoneId, isOpen) {
    return this.request(`/admin/zones/${zoneId}/open`, {
      method: 'PUT',
      body: JSON.stringify({ open: isOpen }),
    })
  }

  async updateCategoryRates(categoryId, rates) {
    return this.request(`/admin/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(rates),
    })
  }
}

export const apiClient = new ApiClient()
