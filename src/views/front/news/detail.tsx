import { useParams, Link } from 'react-router-dom';
import { useGetNewsDetail } from '@/api/news';
import { useEffect } from 'react';
import dayjs from 'dayjs';
import { Avatar, Divider, Button } from '@mui/material';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import CommentCom from './components/CommentCom';

const NewsDetail = () => {
  const class_nav = [
    { label: '首页', value: '1', path: '/' },
    { label: '详情', value: '2', path: '' },
  ];
  const { id } = useParams();
  const { getDetail: queryNewsById, response } = useGetNewsDetail();
  console.log(response, '~~');
  useEffect(() => {
    queryNewsById({ id });
  }, [id]);
  return (
    <div className="mx-auto md:w-[1200px] 2xl:w-[1400px]">
      <div className="flex items-center leading-[3rem]">
        {class_nav.map((v, i) => (
          <Link to={v.path} key={i} className="text-primary cursor-pointer hover:text-active">
            <span className="cursor-pointer hover:text-active">{v.label}</span>
            {class_nav.length - 1 != i && <span className="mx-3">{'>'}</span>}
          </Link>
        ))}
      </div>
      {response && (
        <div className="flex">
          <div className="flex-1 overflow-hidden">
            <div className="bg-white p-[40px]">
              <div className="flex flex-col items-center w-full">
                <div className="text-2xl font-semibold pb-[20px]">{response.title}</div>
                <div className="text-primary_text text-sm">
                  <span className="mx-4">{response.readCounts || 0}阅读</span>
                  <span className="mx-4">{response.likeCounts || 0}点赞</span>
                  <span className="mx-4">{response.collectCounts || 0}收藏</span>
                  <span className="mx-4">{response.commentCounts || 0}评论</span>
                </div>
              </div>
              <Divider sx={{ margin: '24px 0' }} />
              <div dangerouslySetInnerHTML={{ __html: response?.content || '' }} />
              <Divider sx={{ margin: '24px 0' }} />
              <div className="flex items-center justify-center">
                <Button
                  variant={response.isLike == 0 ? 'outlined' : 'contained'}
                  size="large"
                  startIcon={response.isLike == 0 ? <ThumbUpOffAltIcon /> : <ThumbUpAltIcon />}
                >
                  点赞
                </Button>
                <Button
                  variant={response.isCollect == 0 ? 'outlined' : 'contained'}
                  size="large"
                  startIcon={response.isLike == 0 ? <StarBorderRoundedIcon /> : <StarRoundedIcon />}
                  sx={{ marginLeft: '12px' }}
                >
                  收藏
                </Button>
              </div>
            </div>
            {/* 评论 */}
            <CommentCom id={id} />
          </div>
          <div className="w-[320px] ml-6 text-sm overflow-auto sticky h-[calc(100vh-112px)] top-[112px]">
            <div className="flex flex-wrap mb-2">
              <span className="text-primary_text w-[80px]">来源: </span>
              <Avatar className="mr-2" sx={{ width: '18px', height: '18px' }} src={response.profile} />
              <div>{response.createBy_dictText}</div>
            </div>
            <div className="flex flex-wrap mb-2">
              <span className="text-primary_text w-[80px]">发布日期: </span>
              <div>{dayjs(response.addTime).format('YYYY-MM-DD')}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default NewsDetail;
