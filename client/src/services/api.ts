import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const client = axios.create({
  baseURL: `${BACKEND_URL}/`,
  withCredentials: true
});

/* interceptor to attach bearer token */
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* interceptor for refresh token */
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      await axios.post(
        `${BACKEND_URL}/api/auth/refresh`,
        {},
        { withCredentials: true }
      );

      return client(originalRequest);
    }

    return Promise.reject(error);
  }
);

const api = async <T = any>(method: string, url: string, data: any = null): Promise<{ data: T }> => {
  try {
    const res = await client({
      method,
      url,
      data
    });
    return res;
  } catch (error: any) {
    console.error(`error in ${url}:`, error?.response?.data || error.message);
    throw error;
  }
};

export default api;

