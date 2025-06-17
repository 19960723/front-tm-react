// components/DouyinStyleCarousel.tsx
import React, { useRef, useMemo, useCallback } from 'react';

// 导入自定义 Hook
import { useVideoData } from './hooks/useVideoData';
import { useCarouselInteraction } from './hooks/useCarouselInteraction';
import { useVideoPlayback } from './hooks/useVideoPlayback';
import { useVideoControl } from './hooks/useVideoControl';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import './douyin.css';
import LoadingCom from '../Loading/index';

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
interface VideoPlayerWithControlsProps {
  video: VideoData;
  isActive: boolean; // 用于判断是否是当前活跃视频，以决定是否渲染控制UI
  onVideoRef: (id: string, el: HTMLVideoElement | null) => void; // 用于向父组件传递 video element ref
}

// 辅助函数：格式化时间，将秒转换为 MM:SS 格式
const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const VideoPlayerWithControls: React.FC<VideoPlayerWithControlsProps> = ({ video, isActive, onVideoRef }) => {
  const [videoElement, setVideoElement] = React.useState<HTMLVideoElement | null>(null);
  const controls = useVideoControl(videoElement);

  const videoRefCallback = useCallback(
    (el: HTMLVideoElement | null) => {
      setVideoElement(el); // 设置内部 state
      onVideoRef(video.id, el); // 通知父组件
    },
    [video.id, onVideoRef]
  );
  return (
    <div
      style={{
        width: '100%',
        height: '100%', // 由父级 DouyinStyleCarousel 的 div 控制高度
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#000', // 默认黑色背景
      }}
      onClick={isActive ? controls.togglePlay : undefined}
    >
      <video
        ref={videoRefCallback} // 使用组合的 ref 回调
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
      {/* <div>
      <PlayArrowRoundedIcon className="pause-icon" sx={{ transition: 'transform 0.4s ease-in', width: '100px', height: '100px' }} />
    </div> */}
      {isActive && (
        <>
          {!controls.isPlaying && (
            <PlayArrowRoundedIcon className="pause-icon" sx={{ transition: 'transform 0.4s ease-in', width: '100px', height: '100px' }} />
          )}
        </>
      )}

      {false && isActive && controls && controls.togglePlay && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            right: '20px',
            zIndex: 10,
            color: 'white',
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: '10px',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            alignItems: 'center',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 播放/暂停按钮 */}
          <button
            style={{
              background: 'none',
              border: '2px solid white',
              borderRadius: '50%',
              color: 'white',
              fontSize: '30px',
              width: '60px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {controls.isPlaying ? '❚❚' : '▶'}
          </button>

          {/* 进度条 */}
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>{formatTime(controls.currentTime)}</span>
            <input
              type="range"
              min="0"
              max={controls.duration}
              value={controls.currentTime}
              onChange={(e) => {
                controls.seek(parseFloat(e.target.value));
              }}
              onMouseUp={controls.endSeek}
              onTouchEnd={controls.endSeek}
              style={{ flexGrow: 1, height: '4px', background: '#ccc', borderRadius: '2px', cursor: 'pointer' }}
            />
            <span>{formatTime(controls.duration)}</span>
          </div>

          {/* 音量控制 */}
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={controls.toggleMute}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {controls.isMuted ? '🔇' : '🔊'}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={controls.volume}
              onChange={(e) => controls.setVolume(parseFloat(e.target.value))}
              style={{ flexGrow: 1, height: '4px', background: '#ccc', borderRadius: '2px', cursor: 'pointer' }}
            />
          </div>

          {/* 播放速度控制 */}
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>速度:</span>
            <select
              value={controls.playbackRate}
              onChange={(e) => controls.setPlaybackRate(parseFloat(e.target.value))}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid #ccc',
                padding: '5px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              <option value="0.5">0.5x</option>
              <option value="1">1x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

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

  // 视频 ref 注册回调函数，传递给子组件
  const handleVideoRef = useCallback((id: string, el: HTMLVideoElement | null) => {
    if (el) {
      videoRefsMap.current.set(id, el);
    } else {
      videoRefsMap.current.delete(id);
    }
  }, []);

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
                <VideoPlayerWithControls video={video} isActive={index === currentIndex} onVideoRef={handleVideoRef} />
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
      </div>
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
      {/* 加载中提示 */}
      {loading && <LoadingCom />}
    </div>
  );
};

export default DouyinStyleCarousel;
