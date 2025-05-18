import React, { useEffect } from 'react';
import { Card, CardHeader, CardContent, Typography, Box, Skeleton } from '@mui/material';
import { Link } from 'react-router-dom';
import { useGetNewsList } from '@/api/news';
// 定义文章类型
interface Article {
  id: string | number;
  title: string;
}

// 组件 Props 类型
interface ArticleListProps {
  title: string;
  data: Article[];
  loading?: boolean; // 可选的 loading 状态
  skeletonCount?: number; // 显示的骨架屏数量，默认为 3
}

const ArticleList: React.FC<ArticleListProps> = ({ title, data, loading = false, skeletonCount = 3 }) => {
  const showSkeleton = loading || !data;
  return (
    <Card
      className="custom_card"
      sx={{
        mb: 2,
        '& .MuiCardContent-root, .MuiCardHeader-root': {
          padding: '10px',
        },
      }}
    >
      <CardHeader className="bdb" title={<div className="text-[16px]">{title}</div>} />
      <CardContent sx={{ '&:last-child': { paddingBottom: '10px' } }}>
        {showSkeleton ? (
          // 显示骨架屏
          Array.from({ length: skeletonCount }).map((_, index) => (
            <Box key={index} className="flex items-center mt-1">
              <Skeleton variant="circular" width={20} height={20} />
              <Skeleton variant="text" sx={{ marginLeft: 1, flex: 1 }} />
            </Box>
          ))
        ) : data && data.length > 0 ? (
          data.map((item, index) => (
            <Link key={item.id} to={`/newsDetail/${item.id}`} target="_self" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Box className="text-[14px] mt-0 flex items-center cursor-pointer hover:text-active">
                <Box className="w-[20px] text-center text-[17px] text-active " sx={{ fontFamily: 'woonumrank' }}>
                  {index + 1}
                </Box>
                <Box className="flex1 text_one" sx={{ flex: 1 }}>
                  {item.title}
                </Box>
              </Box>
            </Link>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            暂无数据
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

const ArticleSections: React.FC = () => {
  const { getList: getNewsList, response: new_data, loading: new_loading } = useGetNewsList();
  const { getList: getHotList, response: hot_data, loading: hot_loading } = useGetNewsList(); // 重复调用 hook 但作用不同
  useEffect(() => {
    getNewsList({ newsType: 1, type: 1 });
    getHotList({ newsType: 1, type: 2 });
  }, []);
  return (
    <div>
      <ArticleList title="最新文章" data={new_data && new_data.records} loading={new_loading} />
      <ArticleList title="热门推荐" data={hot_data && hot_data.records} loading={hot_loading} />
    </div>
  );
};

export default ArticleSections;
