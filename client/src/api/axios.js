import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // send HttpOnly cookies
});

// Response interceptor to handle 401 → refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    // Don’t retry the refresh endpoint itself
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.endsWith('/auth/refresh')
    ) {
      originalRequest._retry = true;
      try {
        await api.post('/auth/refresh');    // attempt refresh once
        return api(originalRequest);        // retry original
      } catch {
        // if refresh fails, fall through
      }
    }
    return Promise.reject(error);
  }
);


export default api;
