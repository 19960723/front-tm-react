import { useAxios } from '../hooks/useAxios';

const Api = {
  loginApi: '/sys/login',
  userInfoApi: '/sys/user/getUserInfo',
};

// 登录
export const useLoginHandler = () => {
  const { response, loading, error, fetchData } = useAxios();
  const login = (data?: any) => {
    fetchData({
      url: Api.loginApi,
      method: 'post',
      data,
    });
  };
  return { response, loading, error, login };
};
