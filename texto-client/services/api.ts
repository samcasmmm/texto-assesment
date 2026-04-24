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

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<any>) => {
    console.log('error', error);
    const message =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error.message ||
      'API request failed';

    return Promise.reject(new Error(message));
  },
);

export default api;
