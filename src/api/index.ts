import { useAxios } from '../hooks/useAxios';
import { BasicPageListParams } from './model/baseModel';

const Api = {
  getNewsLabel: '/zxhome/zxhomeNewsLabel/queryList',
};

export const useNewsLabelList = () => {
  const { response, loading, error, fetchData } = useAxios();
  const getNewsLabel = (params: BasicPageListParams) => {
    fetchData({
      url: Api.getNewsLabel,
      method: 'GET',
      params,
    });
  };
  return { response, loading, error, getNewsLabel };
};

/**
 * 获取文件服务访问路径
 */
export function getFileAccessHttpUrl(avatar: string, subStr?: string) {
  if (!subStr) subStr = 'http';
  try {
    if (avatar && avatar.startsWith(subStr)) {
      return avatar;
    } else {
      if (avatar && avatar.length > 0 && avatar.indexOf('[') == -1) {
        const base_url = import.meta.env.VITE_API_URL as string;
        return base_url + '/sys/common/static' + '/' + avatar;
      }
    }
  } catch (err) {
    console.log(err);
    return '';
  }
}

export const useGetRandomImage = () => {
  const { response, loading, error, fetchData } = useAxios();
  const getRandomImage = (url: string, params: BasicPageListParams) => {
    fetchData({
      url,
      method: 'GET',
      params,
    });
  };
  return { response, loading, error, getRandomImage };
};
