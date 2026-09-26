import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_GEMOTC_API_BASE_URL || 'http://localhost:4000';
const API_PREFIX = '/api/v1';

// Create axios instance
export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}${API_PREFIX}`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper for edge middleware authentication cookie
const setSessionCookie = () => {
  if (typeof document !== 'undefined') {
    const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
    document.cookie = `gemotc_session=1; path=/; max-age=604800; SameSite=Lax${isSecure ? '; Secure' : ''}`;
  }
};

const clearSessionCookie = () => {
  if (typeof document !== 'undefined') {
    document.cookie = 'gemotc_session=; path=/; max-age=0; SameSite=Lax';
  }
};

// Token management
let accessToken: string | null = null;
let refreshToken: string | null = null;

export const setTokens = (access: string, refresh: string) => {
  accessToken = access;
  refreshToken = refresh;
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    setSessionCookie();
  }
};

export const getTokens = () => {
  if (typeof window !== 'undefined' && !accessToken) {
    accessToken = localStorage.getItem('accessToken');
    refreshToken = localStorage.getItem('refreshToken');
    if (accessToken) {
      setSessionCookie();
    }
  }
  return { accessToken, refreshToken };
};

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    clearSessionCookie();
  }
};

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken: token } = getTokens();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Token refresh mutex & queued requests handling
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Response interceptor - handle token refresh with mutex
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ error?: { message?: string; code?: string; data?: Record<string, any> } }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 and attempt token refresh
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const url = originalRequest.url || '';
      // Don't retry for auth endpoints
      if (url.includes('/auth/login') || url.includes('/auth/refresh-token')) {
        return Promise.reject(transformError(error));
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(transformError(err));
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      
      const { refreshToken: refresh } = getTokens();
      if (!refresh) {
        isRefreshing = false;
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        return Promise.reject(transformError(error));
      }

      try {
        const response = await axios.post(`${API_BASE_URL}${API_PREFIX}/auth/refresh-token`, {
          refreshToken: refresh,
        }, {
          withCredentials: true,
        });
        
        const { accessToken: newAccess, refreshToken: newRefresh } = response.data.data;
        setTokens(newAccess, newRefresh);
        
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        }
        processQueue(null, newAccess);
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        return Promise.reject(transformError(refreshErr as AxiosError<any>));
      } finally {
        isRefreshing = false;
      }
    }
    
    // Transform error to ApiError
    const errorData = error.response?.data?.error;
    const apiError: ApiError = {
      message: errorData?.message || error.message || 'An error occurred',
      code: errorData?.code,
      statusCode: error.response?.status,
      data: errorData?.data,
    };
    
    return Promise.reject(apiError);
  }
);

export default apiClient;
