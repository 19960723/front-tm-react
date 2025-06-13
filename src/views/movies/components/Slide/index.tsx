// components/DouyinStyleCarousel.tsx
import React, { useRef } from 'react';

// 导入自定义 Hook
import { useVideoData } from './hooks/useVideoData';
import { useCarouselInteraction } from './hooks/useCarouselInteraction';
import { useVideoPlayback } from './hooks/useVideoPlayback';

// --- 常量配置 ---
const PAGE_HEIGHT_CSS = '100vh';
const PAGE_HEIGHT_JS = window.innerHeight; // 动态获取实际像素高度
const PRELOAD_BUFFER_COUNT = 2; // 当前视频前后预加载的视频数量

interface VideoData {
  id: string;
  filePath?: { path: string };
  url?: string;
  thumbnailPath?: string;
}

const DouyinStyleCarousel: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefsMap = useRef<Map<string, HTMLVideoElement>>(new Map()); // 用于存储视频元素引用

  // 1. 数据加载逻辑
  const { videos, loading, error, hasMore, loadNextPage, isFetching } = useVideoData({ pageSize: 5 });

  // 2. 触摸 & 无限滚动逻辑
  const { currentIndex } = useCarouselInteraction({
    totalItems: videos.length,
    onLoadNextPage: loadNextPage, // 将数据加载的函数传递给交互 Hook
    hasMore: hasMore,
    isFetchingData: isFetching,
    pageHeight: PAGE_HEIGHT_JS,
    containerRef: containerRef,
  });

  // 3. 视频播放控制
  useVideoPlayback(videoRefsMap); // 将视频引用Map传递给 Hook

  return (
    <div
      id="douyin-carousel-container"
      style={{
        height: PAGE_HEIGHT_CSS,
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
        backgroundColor: '#000',
        touchAction: 'none', // 阻止默认的触摸行为，如iOS下拉刷新
      }}
    >
      <div
        ref={containerRef}
        style={{
          height: videos.length * PAGE_HEIGHT_JS, // 根据视频数量设置总高度
          width: '100%',
        }}
      >
        {videos.map((video, index) => {
          // 根据当前索引和预加载缓冲区决定是否渲染 <video> 标签
          const shouldRenderVideoTag = index >= currentIndex - PRELOAD_BUFFER_COUNT && index <= currentIndex + PRELOAD_BUFFER_COUNT;

          return (
            <div
              key={video.id}
              style={{
                height: PAGE_HEIGHT_JS,
                width: '100%',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {video.url && shouldRenderVideoTag ? (
                <video
                  ref={(el) => {
                    // 将视频元素添加到 Map 中以便 IntersectionObserver 观察
                    if (el) {
                      videoRefsMap.current.set(video.id, el);
                    } else {
                      videoRefsMap.current.delete(video.id); // 元素卸载时从 Map 中移除
                    }
                  }}
                  poster={video.thumbnailPath}
                  muted={true} // 初始静音
                  loop
                  x5-video-player-type="h5-page"
                  playsInline
                  preload="auto"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                >
                  <source src={video.url} type="video/mp4" />
                </video>
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '1.2em',
                  }}
                >
                  {shouldRenderVideoTag && !video.url ? '视频加载失败或路径无效' : '视频占位符'}
                </div>
              )}
            </div>
          );
        })}
        {/* 加载中提示 */}
        {loading && (
          <div
            style={{
              height: PAGE_HEIGHT_JS,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              backgroundColor: '#333',
            }}
          >
            加载中...
          </div>
        )}
        {/* 到底提示 */}
        {!hasMore && videos.length > 0 && (
          <div
            style={{
              height: PAGE_HEIGHT_JS / 2, // “到底”消息占据半个屏幕
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              backgroundColor: '#333',
            }}
          >
            您已到达底部！
          </div>
        )}
      </div>
    </div>
  );
};

export default DouyinStyleCarousel;
