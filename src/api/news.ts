import { useAxios } from '../hooks/useAxios';
// import { BasicPageListParams } from './model/baseModel';

const Api = {
  queryNewsById: '/zxhome/zxhomeNewsInfo/queryById',

  getNewsLabel: '/zxhome/zxhomeNewsLabel/queryList',
  getNewsList: '/zxhome/zxhomeNewsInfo/list',
  saveNewsLinkApi: '/zxhome/zxhomeNewsLike/save',
  saveNewsCollectApi: '/zxhome/zxhomeNewsCollect/save',

  getArticleClasslist: '/WebarticleClass/getArticleClasslist',
  getAllArticle: '/WebArticle/getAllArticle',
  getCustomAsk: '/common/app/custom/ask', // 获取客户提问回复
  getArticleById: '/WebArticle/getArticleById', // 资讯详情
  getallArticleComment: '/WebArticleComment/getallArticleComment', // 资讯评论
};

const CommentApi = {
  add: '/zxhome/zxhomeNewsComment/add',
  edit: '/zxhome/zxhomeNewsComment/edit',
  delete: '/zxhome/zxhomeNewsComment/delete',
  list: '/zxhome/zxhomeNewsComment/list',
};

export const useGetNewsList = () => {
  const { response, loading, error, fetchData } = useAxios();
  const getList = (params?: any) => {
    fetchData({
      url: Api.getNewsList,
      method: 'GET',
      params,
    });
  };
  return { response, loading, error, getList };
};
export const useGetNewsDetail = () => {
  const { response, loading, error, fetchData } = useAxios();
  const getDetail = (params?: any) => {
    fetchData({
      url: Api.queryNewsById,
      method: 'GET',
      params,
    });
  };
  return { response, loading, error, getDetail };
};

// 获取评论列表 （数组）
export const useGetNewsCommentList = () => {
  const { response, loading, error, fetchData } = useAxios();
  const getList = (params?: any) => {
    fetchData({
      url: CommentApi.list,
      method: 'GET',
      params,
    });
  };
  return { response, loading, error, getList };
};
