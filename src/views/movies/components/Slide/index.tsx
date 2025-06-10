import React, { useEffect, useRef, useState, RefCallback, useCallback } from 'react';
interface VideoData {
  id: string;
  url: string;
}
const mockFetchVideos = async (page: number): Promise<VideoData[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const videos: VideoData[] = Array.from({ length: 5 }, (_, i) => ({
        id: `video-${page}-${i}`,
        url: 'https://www.w3schools.com/html/mov_bbb.mp4', // 替换为真实视频链接
      }));
      resolve(videos);
    }, 1000);
  });
};

const DouyinScroll: React.FC = () => {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [page, setPage] = useState(1);

  const containerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const setVideoRef = useCallback((idx: number): RefCallback<HTMLDivElement> => {
    return (el: HTMLDivElement | null) => {
      containerRefs.current[idx] = el;
      if (el && observerRef.current) {
        observerRef.current.observe(el);
      }
    };
  }, []);

  const loadMore = useCallback(async () => {
    const newVideos = await mockFetchVideos(page);
    setVideos((prev) => [...prev, ...newVideos]);
    setPage((prev) => prev + 1);
  }, [page]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target.querySelector('video') as HTMLVideoElement | null;
          if (entry.isIntersecting) {
            video?.play().catch(() => {});
          } else {
            video?.pause();
          }
        });
      },
      {
        threshold: 0.8,
      }
    );
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    loadMore();
  }, []);

  useEffect(() => {
    const loadObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (bottomRef.current) {
      loadObserver.observe(bottomRef.current);
    }

    return () => loadObserver.disconnect();
  }, [loadMore]);

  return (
    <div className="video-wrapper">
      {videos.map((video, idx) => (
        <div key={video.id} className="video-item" ref={setVideoRef(idx)} data-index={idx}>
          <video src={video.url} className="video-player" muted loop playsInline preload="metadata" />
        </div>
      ))}
      <div ref={bottomRef} className="loading-indicator">
        加载中...
      </div>
    </div>
  );
};

export default DouyinScroll;
