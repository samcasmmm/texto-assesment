import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { storageService } from './storage';

const api = axios.create({
  baseURL: 'http://192.168.0.126:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storageService.get('token');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(`[REQUEST] - ${config.url} - ${config.method?.toUpperCase()}`);

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(
      `[RESPONSE] - ${response.config.url} - ${JSON.stringify(response.data)}`,
    );

    return response;
  },
  (error: AxiosError<any>) => {
    const status = error.response?.status || 'NETWORK_ERROR';
    const url = error.config?.url || 'UNKNOWN_URL';

    console.log(`[ERROR] - ${url} - ${status}`);
    console.log('[MESSAGE]', error.response?.data || error.message);

    const message =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error.message ||
      'API request failed';

    return Promise.reject(new Error(message));
  },
);

export default api;
