// hooks/useVideoData.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { useVideoList } from '@/api/movies'; // 您的实际 API Hook

interface VideoData {
  id: string;
  filePath?: { path: string };
  url?: string;
  thumbnailPath?: string;
  path_cover?: string;
}

interface UseVideoDataOptions {
  pageSize?: number;
}

/**
 * 负责视频数据的加载、分页、去重和状态管理。
 *
 * @param options 配置项，例如每页大小。
 * @returns 包含视频列表、加载状态、是否还有更多数据、当前页码、以及触发加载下一页的函数。
 */
export const useVideoData = ({ pageSize = 5 }: UseVideoDataOptions = {}) => {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const isFetchingRef = useRef(false); // 用于跟踪是否正在进行数据加载

  const { response, loading, error, getList } = useVideoList(); // 您的实际 API Hook

  // 触发数据加载的效果
  useEffect(() => {
    if (hasMore && !isFetchingRef.current) {
      isFetchingRef.current = true; // 设置加载中标志
      console.log(`[useVideoData] Initiating request: Fetching page ${currentPage} data...`);
      getList({ pageNo: currentPage, pageSize });
    }
  }, [currentPage]); // 依赖 currentPage 变化触发加载
  // , hasMore, getList, pageSize

  // 处理 API 响应 Effects
  useEffect(() => {
    if (response) {
      if (response.records && response.records.length > 0) {
        const newVideoData: VideoData[] = response.records
          .map((v: any) => {
            try {
              const filePath = typeof v.filePath === 'string' ? JSON.parse(v.filePath) : v.filePath;
              return {
                ...v,
                filePath: filePath,
                url: filePath?.path,
                path_cover: filePath?.path_cover,
              };
            } catch (e) {
              console.error('[useVideoData] Error parsing filePath field:', e, 'Raw data:', v.filePath);
              return { ...v, filePath: null, url: '', path_cover: '' };
            }
          })
          .filter((v: any) => v.url); // 过滤掉无效 URL 的视频

        setVideos((prev) => {
          const existingIds = new Set(prev.map((video) => video.id));
          const uniqueNewVideos = newVideoData.filter((video) => !existingIds.has(video.id));
          return [...prev, ...uniqueNewVideos]; // 合并新数据并去重
        });

        // 判断是否还有更多数据
        if (response.records.length < pageSize) {
          setHasMore(false);
        }
      } else {
        setHasMore(false); // 没有返回记录，则认为没有更多数据
      }
      isFetchingRef.current = false; // 重置加载中标志
      console.log(`[useVideoData] Page ${currentPage} data loaded. Has more: ${hasMore}`);
    }
  }, [response, currentPage, hasMore, pageSize]);

  // 暴露给外部调用，用于请求下一页数据
  const loadNextPage = useCallback(() => {
    if (hasMore && !isFetchingRef.current) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasMore]);

  return {
    videos,
    loading,
    error,
    hasMore,
    loadNextPage,
    isFetching: isFetchingRef.current, // 暴露当前的加载状态
  };
};
