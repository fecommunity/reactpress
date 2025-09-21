import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

// 创建自定义 axios 实例
export const createHttpClient = (baseURL?: string) => {
  const instance = axios.create({
    baseURL: baseURL || process.env.API_BASE_URL || 'http://localhost:3002',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 请求拦截器
  instance.interceptors.request.use(
    (config: AxiosRequestConfig) => {
      // 添加认证令牌
      const token = localStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // 响应拦截器
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response.data;
    },
    (error) => {
      // 统一错误处理
      if (error.response?.status === 401) {
        // 未授权处理
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
      return Promise.reject(error.response?.data || error);
    }
  );

  return instance;
};

// 默认 HTTP 客户端实例
export const httpClient = createHttpClient();

export default httpClient;
