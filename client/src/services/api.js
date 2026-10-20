import axios from 'axios';

/**
 * Pre-configured Axios instance
 * Automatically forwards HTTP-Only JWT cookies with `withCredentials: true`
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Response Interceptor: unwrap standard response data or normalize errors
api.interceptors.response.use(
  (response) => {
    // If the backend envelope is { success: true, data: ..., message: ... }, extract payload
    return response.data;
  },
  (error) => {
    const customMessage =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.message ||
      error.message ||
      'An unexpected network error occurred';

    return Promise.reject({
      message: customMessage,
      status: error.response?.status,
      errors: error.response?.data?.errors,
    });
  }
);

export default api;
