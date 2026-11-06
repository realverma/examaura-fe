import axios, {
  type InternalAxiosRequestConfig,
} from 'axios';

// Prefer environment configuration instead of hardcoding localhost.
const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8081/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add retry tracking to Axios request configuration.
declare module 'axios' {
  interface InternalAxiosRequestConfig<D = any> {
    _retry?: boolean;
  }
}

// Shared refresh operation.
// Multiple failed requests will use the same refresh promise.
let refreshPromise: Promise<string> | null = null;

function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        throw new Error('Refresh token not found');
      }

      // Use standard Axios to avoid triggering our own interceptors.
      const response = await axios.post(
        `${API_URL}/auth/refresh`,
        { refreshToken }
      );

      const accessToken = response.data.accessToken;
      const newRefreshToken = response.data.refreshToken;

      if (!accessToken) {
        throw new Error('Access token missing from refresh response');
      }

      localStorage.setItem('token', accessToken);

      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }

      return accessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    const isAuthEndpoint =
      config.url?.includes('/auth/login') ||
      config.url?.includes('/auth/refresh');

    if (token && !isAuthEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config as
      | InternalAxiosRequestConfig
      | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isAuthEndpoint =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/refresh');

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      isAuthEndpoint
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newAccessToken = await refreshAccessToken();

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      const status = axios.isAxiosError(refreshError)
        ? refreshError.response?.status
        : undefined;

      // Clear the session only when the server confirms
      // that the refresh credentials are no longer valid.
      if ([400, 401, 403].includes(status ?? 0)) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        window.dispatchEvent(
          new Event('auth:session-expired')
        );
      }

      return Promise.reject(refreshError);
    }
  }
);

export default api;