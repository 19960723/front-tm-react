import { useState, useCallback } from 'react';
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { useSnackbar } from '../contexts/SnackbarContext';

const sleep = async (waitTime: number = 0) => {
  return new Promise((resolve) => {
    setTimeout(resolve, waitTime);
  });
};

const baseURL = import.meta.env.VITE_API_URL;
const axiosInstance = axios.create({
  baseURL, // 设置你的 baseURL
  headers: {
    // device_name: 'huaweiP60',
  },
  timeout: 100000,
});
axiosInstance.interceptors.request.use(
  (config) => {
    config.headers.lang = localStorage.getItem('language') || 'en';
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  async (response: AxiosResponse) => {
    const { data } = response;
    if (data.code && data.code !== 200) {
      // data.code !== 200
      return Promise.reject(new Error(data.message || '请求失败'));
    }
    // await sleep(2000000000);
    return response;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
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
