import { Box, Typography, Skeleton } from '@mui/material';
import { useEffect, useState, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { useGetNewsList } from '@/api/news';
import ArticleItem from './ArticleItem';

interface NewsItem {
  id: string;
  title: string;
  addTime: string;
  hits?: number;
  intro?: string;
  content?: string;
  coverPhoto?: string;
}

interface NewsListResponse {
  records?: NewsItem[];
  total?: number;
}

function ArticleSkeleton() {
  return (
    <Box className="flex overflow-hidden p-5 bdb">
      <Box className="flex-1 flex flex-col justify-between overflow-hidden">
        <Skeleton height={24} width="80%" />
        <Skeleton height={20} width="60%" sx={{ mt: 1 }} />
        <Skeleton height={60} sx={{ mt: 2 }} />
      </Box>
      <Skeleton variant="rectangular" width={120} height={80} className="ml-8" />
    </Box>
  );
}

function ArticleList({ labelId = 0 }) {
  const { getList: getNewsList, response, loading } = useGetNewsList();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<NewsItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const { ref: loadMoreRef, inView } = useInView();

  useEffect(() => {
    // 重新请求时重置数据
    setItems([]);
    setPage(1);
    setHasMore(true);

    getNewsList({
      newsType: 1,
      title: '',
      pageNo: page,
      pageSize: 10,
      column: 'createTime',
      order: 'desc',
      labelId: labelId ? `${labelId}` : '',
    });
  }, [labelId]);

  useEffect(() => {
    if (!response?.records) return;
    const newItems = response.records;
    setItems(response.pageNo === 1 ? newItems : (prev) => [...prev, ...newItems]);
    if (newItems.length < 10) setHasMore(false);
  }, [response]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      setPage((prev) => {
        const nextPage = prev + 1;
        getNewsList({
          newsType: 1,
          title: '',
          pageNo: nextPage,
          pageSize: 10,
          column: 'createTime',
          order: 'desc',
          labelId: labelId ? `${labelId}` : '',
        });
        return nextPage;
      });
    }
  }, [inView, hasMore, loading]);

  if (loading && page === 1) {
    return (
      <>
        {Array.from({ length: 3 }).map((_, i) => (
          <ArticleSkeleton key={i} />
        ))}
      </>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        暂无数据
      </Typography>
    );
  }

  return (
    <>
      {items.map((item: any) => (
        <ArticleItem key={item.id} item={item} />
      ))}
      {loading && page > 1 && <ArticleSkeleton />}
      {hasMore && <div ref={loadMoreRef} />}
      {/* {!hasMore && (
        <Typography variant="caption" color="text.secondary" align="center" sx={{ py: 2, width: '100%' }}>
          没有更多数据了
        </Typography>
      )} */}
    </>
  );
}

export default ArticleList;
