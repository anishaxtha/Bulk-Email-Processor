import axios from "axios";

// Create an axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5001/api",
});

// Add a request interceptor to attach the token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle 401 unauthorized errors (token expired or invalid)
      if (error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
};

// Email template services
export const templateService = {
  getTemplates: () => api.get("/templates"),
};

// Email sending and log services
export const emailService = {
  sendBulkEmails: (formData) => api.post("/emails/bulk-send", formData),
  getLogs: (page = 1, status = "all") =>
    api.get(`/emails/logs?page=${page}&status=${status}`),
};

export default api;
