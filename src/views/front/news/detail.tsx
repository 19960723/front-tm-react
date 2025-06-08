import { useParams, Link } from 'react-router-dom';
import { useGetNewsDetail, useSaveNewsLinkApi, useSaveNewsCollectApi } from '@/api/news';
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Avatar, Divider, Button } from '@mui/material';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import CommentCom from './components/CommentCom';
import useUserStore from '@/store/userStore';

interface DetailInfoProps {
  id?: number;
  title?: string;
  readCounts?: number;
  likeCounts?: number;
  collectCounts?: number;
  commentCounts?: number;
  content?: string;
  isLike?: number;
  isCollect?: number;
  createBy_dictText?: string;
  addTime?: string;
  profile?: string;
}
const NewsContent: React.FC<DetailInfoProps> = React.memo(
  ({ title, content, readCounts = 0, likeCounts = 0, collectCounts = 0, commentCounts = 0 }) => {
    return (
      <>
        <div className="flex flex-col items-center w-full">
          <div className="text-2xl font-semibold pb-[20px]">{title}</div>
          <div className="text-primary_text text-sm">
            <span className="mx-4">{readCounts} 阅读</span>
            <span className="mx-4">{likeCounts} 点赞</span>
            <span className="mx-4">{collectCounts} 收藏</span>
            <span className="mx-4">{commentCounts} 评论</span>
          </div>
        </div>
        <Divider sx={{ margin: '24px 0' }} />
        <div dangerouslySetInnerHTML={{ __html: content || '' }} />
        <Divider sx={{ margin: '24px 0' }} />
      </>
    );
  }
);

const NewsDetail = () => {
  const [detailInfo, setDetailInfo] = useState<DetailInfoProps>({});
  const { id } = useParams();
  const { username } = useUserStore();
  const { getDetail: queryNewsById, response } = useGetNewsDetail();

  const classNav = [
    { label: '首页', value: '1', path: '/' },
    { label: '详情', value: '2', path: '' },
  ];

  useEffect(() => {
    if (id) {
      queryNewsById({ id });
    }
  }, [id]);

  useEffect(() => {
    if (response) {
      setDetailInfo({ ...response });
    }
  }, [response]);

  const { postApifn: saveNewsLinkApi } = useSaveNewsLinkApi();
  const linkHandler = () => {
    const isLike = detailInfo.isLike === 0 ? 1 : 0;
    const params = {
      username,
      infoId: detailInfo.id,
      isLike,
    };
    try {
      saveNewsLinkApi(params); // 调用点赞 API
      setDetailInfo((prev) => ({ ...prev, isLike }));
    } catch (err) {
      console.error('点赞失败', err);
    }
  };

  const { postApifn: saveNewsCollectApi } = useSaveNewsCollectApi();
  const collectHandler = () => {
    const isCollect = detailInfo.isCollect === 0 ? 1 : 0;
    const params = {
      username,
      infoId: detailInfo.id,
      isCollect,
    };
    try {
      saveNewsCollectApi(params); // 调用点收藏 API
      setDetailInfo((prev) => ({ ...prev, isCollect }));
    } catch (err) {
      console.error('收藏失败', err);
    }
  };

  const {
    title,
    content,
    readCounts = 0,
    likeCounts = 0,
    collectCounts = 0,
    commentCounts = 0,
    isLike = 0,
    isCollect = 0,
    profile,
    createBy_dictText,
    addTime,
  } = detailInfo;

  return (
    <div className="mx-auto md:w-[1200px] 2xl:w-[1400px]">
      <div className="flex items-center leading-[3rem]">
        {classNav.map((v, i) => (
          <Link to={v.path} key={i} className="text-primary cursor-pointer hover:text-active">
            <span>{v.label}</span>
            {i < classNav.length - 1 && <span className="mx-3">{'>'}</span>}
          </Link>
        ))}
      </div>

      {detailInfo && (
        <div className="flex">
          <div className="flex-1 overflow-hidden">
            <div className="bg-white p-[40px]">
              <NewsContent
                title={title}
                content={content}
                readCounts={readCounts}
                likeCounts={likeCounts}
                collectCounts={collectCounts}
                commentCounts={commentCounts}
              />
              <div className="flex items-center justify-center">
                <Button
                  size="large"
                  variant={isLike === 0 ? 'outlined' : 'contained'}
                  startIcon={isLike === 0 ? <ThumbUpOffAltIcon /> : <ThumbUpAltIcon />}
                  onClick={linkHandler}
                >
                  点赞
                </Button>
                <Button
                  size="large"
                  variant={isCollect === 0 ? 'outlined' : 'contained'}
                  startIcon={isCollect === 0 ? <StarBorderRoundedIcon /> : <StarRoundedIcon />}
                  sx={{ marginLeft: '12px' }}
                  onClick={collectHandler}
                >
                  收藏
                </Button>
              </div>
            </div>
            <CommentCom id={id} />
          </div>
          <div className="w-[320px] ml-6 text-sm overflow-auto sticky h-[calc(100vh-112px)] top-[112px]">
            <div className="flex flex-wrap mb-2">
              <span className="text-primary_text w-[80px]">来源: </span>
              <Avatar className="mr-2" sx={{ width: 18, height: 18 }} src={profile} />
              <div>{createBy_dictText || '未知'}</div>
            </div>
            <div className="flex flex-wrap mb-2">
              <span className="text-primary_text w-[80px]">发布日期: </span>
              <div>{addTime ? dayjs(addTime).format('YYYY-MM-DD') : '暂无'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsDetail;
