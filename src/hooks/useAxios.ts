import { useState, useCallback } from 'react';
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { useSnackbar } from '../contexts/SnackbarContext';
import useUserStore from '@/store/userStore';
// const sleep = async (waitTime: number = 0) => {
//   return new Promise((resolve) => {
//     setTimeout(resolve, waitTime);
//   });
// };

const baseURL = import.meta.env.VITE_API_URL;
const axiosInstance = axios.create({
  baseURL, // 设置你的 baseURL
  timeout: 100000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const { token, tenant_id } = useUserStore.getState();
    config.headers.lang = localStorage.getItem('language') || 'en';
    config.headers['X-Access-Token'] = token || '';
    config.headers['tenant_id'] = tenant_id || 0;
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  async (response: AxiosResponse) => {
    // const { data } = response;
    // if (data.code && data.code !== 200) {
    //   return Promise.reject(new Error(data.message || '请求失败'));
    // }
    return Promise.resolve(response);
  },
  (error: AxiosError) => {
    return errFn(error);
    // return Promise.reject(error);
  }
);

interface ApiResponse<Data> {
  result: Data;
}

export const useAxios = <T = any>(showSuccessSnackbar: boolean = false) => {
  const { showSnackbar } = useSnackbar();
  const [response, setResponse] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (config: AxiosRequestConfig) => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.request<ApiResponse<T>>(config);
        setResponse(res.data.result);

        if (showSuccessSnackbar) {
          showSnackbar('请求成功', 'success', 3000);
        }
        return res.data.result;
      } catch (err) {
        console.log(err);
        const errorMessage = (err as AxiosError).message || '请求失败';
        setError(errorMessage);
        showSnackbar(errorMessage, 'error', 3000);
      } finally {
        setLoading(false);
      }
    },
    [showSuccessSnackbar, showSnackbar]
  );
  return { response, loading, error, fetchData };
};

const errFn = (error: AxiosError) => {
  const { logout, token } = useUserStore.getState();
  if (error.response) {
    const err_message = (error.response?.data as any)?.message;
    switch (error.response.status) {
      case 401:
        const message = err_message || '登录已过期，请重新登录';
        if (token) {
          logout?.(); // 清除 token 等状态
        }
        return Promise.reject(new Error(message));
      case 404:
        break;
      case 500:
        if (token && err_message.indexOf('Token失效') != -1) {
          logout?.(); // 清除 token 等状态
          return Promise.reject('很抱歉，登录已过期，请重新登录');
        }
        return Promise.reject(new Error(err_message));
        break;
      default:
        return Promise.reject(error);
        break;
    }
  }
};
