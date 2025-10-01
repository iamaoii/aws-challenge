const API_BASE_URL = "http://localhost:8000/api"; // Update if backend is on another IP

function getToken() {
  return localStorage.getItem("auth_token");
}

function setToken(token) {
  localStorage.setItem("auth_token", token);
}

function removeToken() {
  localStorage.removeItem("auth_token");
}

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log("Requesting:", url);
  const token = getToken();

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}

const authAPI = {
  async signup(userData) {
    return apiRequest("/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  async login(credentials) {
    return apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  async getUser() {
    return apiRequest("/auth/me");
  },
};

const eventsAPI = {
  async getAll() {
    return apiRequest("/events");
  },

  async create(eventData) {
    return apiRequest("/events", {
      method: "POST",
      body: JSON.stringify(eventData),
    });
  },

  async register(eventId) {
    return apiRequest(`/events/${eventId}/register`, {
      method: "POST",
    });
  },

  async unregister(eventId) {
    return apiRequest(`/events/${eventId}/register`, {
      method: "DELETE",
    });
  },
};

const usersAPI = {
  async getMyEvents(userId) {
    return apiRequest(`/events/users/${userId}/events`);
  },
};