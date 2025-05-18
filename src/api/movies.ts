import { useAxios } from '../hooks/useAxios';
import { BasicPageListParams } from './model/baseModel';

const Api = {
  list: '/video/dyVideo/list',
};

export const useVideoList = () => {
  const { response, loading, error, fetchData } = useAxios();

  const getList = (params: BasicPageListParams) => {
    fetchData({
      url: Api.list,
      method: 'GET',
      params,
    });
  };
  return { response, loading, error, getList };
};
