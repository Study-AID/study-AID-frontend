import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
client.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

client.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const req = error.config as CustomInternalAxiosRequestConfig;

    if (error.response?.status === 401 && !req?._retry) {
      req._retry = true;
      try {
        const refreshRes = await client.post('/api/v1/auth/refresh');
        const newToken = refreshRes.data.access_token;

        if (newToken) {
          sessionStorage.setItem('access_token', newToken);

          req.headers.Authorization = `Bearer ${newToken}`;

          return client(req);
        } else {
          window.location.href = '/login';
          return Promise.reject(error);
        }
      } catch (refreshError) {
        sessionStorage.removeItem('access_token');

        window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    console.error('API Error:', error);
    return Promise.reject(error);
  },
);
