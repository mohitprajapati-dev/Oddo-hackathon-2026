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

let isRefreshing = false;
interface FailedRequest {
  resolve: (value: string | null) => void;
  reject: (err: any) => void;
}
let failedQueue: FailedRequest[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/* interceptor for refresh token */
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return client(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const res = await axios.post(
            `${BACKEND_URL}/api/auth/refresh`,
            { refreshToken },
            { withCredentials: true }
          );

          const { token, refreshToken: newRefreshToken } = res.data.data;
          localStorage.setItem("token", token);
          localStorage.setItem("refreshToken", newRefreshToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }

          processQueue(null, token);
          return client(originalRequest);
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      }
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

