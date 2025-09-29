// API configuration
const API_BASE_URL = "http://localhost:8000/api"

// Get JWT token from localStorage
function getToken() {
  return localStorage.getItem("jwt_token")
}

// Set JWT token in localStorage
function setToken(token) {
  localStorage.setItem("jwt_token", token)
}

// Remove JWT token from localStorage
function removeToken() {
  localStorage.removeItem("jwt_token")
}

// Generic API request function
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const token = getToken()

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  }

  // Add Authorization header if token exists
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`)
    }

    return data
  } catch (error) {
    console.error("API request failed:", error)
    throw error
  }
}

// Authentication API calls
const authAPI = {
  async signup(userData) {
    return apiRequest("/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  },

  async login(credentials) {
    return apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  },
}

// Events API calls
const eventsAPI = {
  async getAll() {
    return apiRequest("/events")
  },

  async create(eventData) {
    return apiRequest("/events", {
      method: "POST",
      body: JSON.stringify(eventData),
    })
  },

  async register(eventId) {
    return apiRequest(`/events/${eventId}/register`, {
      method: "POST",
    })
  },

  async unregister(eventId) {
    return apiRequest(`/events/${eventId}/register`, {
      method: "DELETE",
    })
  },
}

// Users API calls
const usersAPI = {
  async getMyEvents(userId) {
    return apiRequest(`/users/${userId}/events`)
  },
}
