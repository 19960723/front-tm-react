import { useAxios } from '../hooks/useAxios';
import { BasicPageListParams } from './model/baseModel';

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
  const getList = (params?: BasicPageListParams) => {
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
  const getDetail = (params?: BasicPageListParams) => {
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
  const getList = (params?: BasicPageListParams) => {
    fetchData({
      url: CommentApi.list,
      method: 'GET',
      params,
    });
  };
  return { response, loading, error, getList };
};
// 添加评论
export const useAddNewsComment = () => {
  const { response, loading, error, fetchData } = useAxios();
  const postFn = (data?: BasicPageListParams) => {
    return fetchData({
      url: CommentApi.add,
      method: 'POST',
      data,
    });
  };
  return { response, loading, error, postFn };
};
// 修改评论
export const useEditNewsComment = () => {
  const { response, loading, error, fetchData } = useAxios();
  const putFn = (data?: BasicPageListParams) => {
    return fetchData({
      url: CommentApi.edit,
      method: 'PUT',
      data,
    });
  };
  return { response, loading, error, putFn };
};
// 删除评论
export const useDeleteNewsComment = () => {
  const { response, loading, error, fetchData } = useAxios();
  const deleteFn = (params?: BasicPageListParams) => {
    return fetchData({
      url: CommentApi.delete,
      method: 'DELETE',
      params,
    });
  };
  return { response, loading, error, deleteFn };
};

// 点赞
export const useSaveNewsLinkApi = () => {
  const { response, loading, error, fetchData } = useAxios();
  const postApifn = (data?: BasicPageListParams) => {
    return fetchData({
      url: Api.saveNewsLinkApi,
      method: 'post',
      data,
    });
  };
  return { response, loading, error, postApifn };
};
// 收藏
export const useSaveNewsCollectApi = () => {
  const { response, loading, error, fetchData } = useAxios();
  const postApifn = (data?: BasicPageListParams) => {
    return fetchData({
      url: Api.saveNewsCollectApi,
      method: 'post',
      data,
    });
  };
  return { response, loading, error, postApifn };
};
