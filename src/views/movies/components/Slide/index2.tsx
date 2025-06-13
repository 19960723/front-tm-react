import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useVideoList } from '@/api/movies'; // Your actual API hook
import { throttle } from '@/utils/index';

// --- Constant Configurations ---
const PAGE_HEIGHT_CSS = '100vh';
const PAGE_HEIGHT_JS = window.innerHeight; // Dynamically get actual pixel height

const PRELOAD_BUFFER_COUNT = 2; // Number of videos to preload before/after the current one
const FETCH_THRESHOLD_FROM_END = 3; // How many videos from the end to trigger next page load
const SCROLL_TRANSITION_DURATION = '0.4s ease-out';
const INTERSECTION_THRESHOLD = 0.8; // Percentage of video visibility to trigger play/pause

// Gesture-related constants
const SWIPE_THRESHOLD = 50; // Minimum swipe distance to trigger navigation
const VELOCITY_THRESHOLD = 0.3; // Minimum swipe velocity to trigger navigation

// Throttle interval (milliseconds) - 200ms is a common smooth value
const THROTTLE_INTERVAL = 200;

interface VideoData {
  id: string;
  filePath?: { path: string };
  url?: string;
  thumbnailPath?: string;
}

const DouyinStyleCarousel: React.FC = () => {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const isFetchingRef = useRef(false);

  const touchStartY = useRef(0);
  const touchMoveY = useRef(0);
  const touchStartTime = useRef(0);
  const isSwiping = useRef(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefsMap = useRef<Map<string, HTMLVideoElement>>(new Map());
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);

  const { response, loading, error, getList } = useVideoList(); // Your actual hook

  // --- Data Loading Logic ---
  // Fix 1: Added `hasMore` and `getList` to the dependency array
  useEffect(() => {
    if (hasMore && !isFetchingRef.current) {
      isFetchingRef.current = true;
      console.log(`Initiating request: Fetching page ${currentPage} data...`);
      getList({ pageNum: currentPage, pageSize: 5 });
    }
  }, [currentPage]); // Corrected dependencies
  // hasMore, getList
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
              };
            } catch (e) {
              console.error('Error parsing filePath field:', e, 'Raw data:', v.filePath);
              return { ...v, filePath: null, url: '' };
            }
          })
          .filter((v) => v.url);

        setVideos((prev) => {
          const existingIds = new Set(prev.map((video) => video.id));
          const uniqueNewVideos = newVideoData.filter((video) => !existingIds.has(video.id));
          return [...prev, ...uniqueNewVideos];
        });

        if (response.records.length < 5) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
      isFetchingRef.current = false;
      console.log(`Page ${currentPage} data loaded.`);
    }
  }, [response, currentPage]);

  // --- Video Playback/Pause Logic (Intersection Observer) ---
  // Fix 2: Optimized video playback logic to handle AbortError
  useEffect(() => {
    if (intersectionObserverRef.current) {
      intersectionObserverRef.current.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoElement = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            // Video enters viewport
            if (videoElement.paused) {
              // Ensure video is muted BEFORE attempting to play
              // This significantly improves autoplay success rate due to browser policies.
              videoElement.muted = true;
              videoElement
                .play()
                .then(() => {
                  // Once playback successfully starts, then unmute
                  videoElement.muted = false;
                })
                .catch((err) => {
                  console.warn('Video playback was blocked:', err);
                  if (err.name === 'NotAllowedError') {
                    // If browser prevents audio playback (e.g., no user interaction), force muted playback
                    videoElement.muted = true;
                    videoElement.play().catch((e) => console.warn('Fallback muted play failed:', e));
                  } else if (err.name === 'AbortError') {
                    // AbortError usually means a play() request was immediately interrupted by a pause().
                    // The "mute before play" logic greatly reduces this.
                    // Remaining cases are likely due to extremely fast scrolling (video quickly entering/exiting threshold).
                    // No further special handling is usually needed here.
                  }
                });
            }
          } else {
            // Video moves out of viewport
            if (!videoElement.paused) {
              videoElement.pause();
              videoElement.currentTime = 0; // Reset to start
            }
            videoElement.muted = true; // Mute video when out of view
          }
        });
      },
      { threshold: INTERSECTION_THRESHOLD }
    );

    videoRefsMap.current.forEach((videoElement) => {
      observer.observe(videoElement);
    });

    intersectionObserverRef.current = observer;

    return () => {
      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.disconnect();
      }
    };
  }, [videos]);

  useEffect(() => {
    if (containerRef.current) {
      if (!isSwiping.current) {
        containerRef.current.style.transition = `transform ${SCROLL_TRANSITION_DURATION}`;
        containerRef.current.style.transform = `translateY(${-currentIndex * PAGE_HEIGHT_JS}px)`;
      }
    }
  }, [currentIndex]);

  const scrollTo = useCallback(
    (targetIndex: number) => {
      const newIndex = Math.max(0, Math.min(videos.length - 1, targetIndex));

      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);

        if (hasMore && !isFetchingRef.current && videos.length - newIndex <= FETCH_THRESHOLD_FROM_END) {
          setCurrentPage((prev) => prev + 1);
        }
      }
    },
    [currentIndex, videos.length, hasMore]
  );

  // Throttled wheel event handler
  const throttledHandleWheel = useCallback(
    throttle((e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 0) {
        scrollTo(currentIndex + 1);
      } else if (e.deltaY < 0) {
        scrollTo(currentIndex - 1);
      }
    }, THROTTLE_INTERVAL),
    [currentIndex, scrollTo]
  );

  // Throttled keydown event handler
  const throttledHandleKeyDown = useCallback(
    throttle((e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        scrollTo(currentIndex + 1);
      } else if (e.key === 'ArrowUp') {
        scrollTo(currentIndex - 1);
      }
    }, THROTTLE_INTERVAL),
    [currentIndex, scrollTo]
  );

  const handleTouchStart = useCallback((e: TouchEvent) => {
    isSwiping.current = true;
    touchStartY.current = e.touches[0].clientY;
    touchMoveY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();

    if (containerRef.current) {
      containerRef.current.style.transition = 'none';
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isSwiping.current) return;

      touchMoveY.current = e.touches[0].clientY;
      const deltaY = touchMoveY.current - touchStartY.current;

      if (containerRef.current) {
        const currentTranslateY = -currentIndex * PAGE_HEIGHT_JS;
        containerRef.current.style.transform = `translateY(${currentTranslateY + deltaY}px)`;
      }
    },
    [currentIndex]
  );

  const handleTouchEnd = useCallback(() => {
    isSwiping.current = false;

    const deltaY = touchMoveY.current - touchStartY.current;
    const deltaTime = Date.now() - touchStartTime.current;
    const velocity = Math.abs(deltaY / deltaTime);

    let targetIndex = currentIndex;

    if (deltaY < -SWIPE_THRESHOLD || (deltaY < 0 && velocity > VELOCITY_THRESHOLD)) {
      targetIndex = currentIndex + 1;
    } else if (deltaY > SWIPE_THRESHOLD || (deltaY > 0 && velocity > VELOCITY_THRESHOLD)) {
      targetIndex = currentIndex - 1;
    }

    scrollTo(targetIndex);

    if (containerRef.current) {
      containerRef.current.style.transition = `transform ${SCROLL_TRANSITION_DURATION}`;
    }
  }, [currentIndex, scrollTo]);

  useEffect(() => {
    // Bind throttled event handlers
    window.addEventListener('wheel', throttledHandleWheel, { passive: false });
    window.addEventListener('keydown', throttledHandleKeyDown);

    const carouselElement = document.getElementById('douyin-carousel-container');
    if (carouselElement) {
      carouselElement.addEventListener('touchstart', handleTouchStart, { passive: false });
      carouselElement.addEventListener('touchmove', handleTouchMove, { passive: false });
      carouselElement.addEventListener('touchend', handleTouchEnd, { passive: false });
      carouselElement.addEventListener('touchcancel', handleTouchEnd, { passive: false });
    }

    return () => {
      // Remove throttled event handlers
      window.removeEventListener('wheel', throttledHandleWheel);
      window.removeEventListener('keydown', throttledHandleKeyDown);

      if (carouselElement) {
        carouselElement.removeEventListener('touchstart', handleTouchStart);
        carouselElement.removeEventListener('touchmove', handleTouchMove);
        carouselElement.removeEventListener('touchend', handleTouchEnd);
        carouselElement.removeEventListener('touchcancel', handleTouchEnd);
      }
    };
  }, [throttledHandleWheel, throttledHandleKeyDown, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div
      id="douyin-carousel-container"
      style={{
        height: PAGE_HEIGHT_CSS,
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
        backgroundColor: '#000',
        touchAction: 'none',
      }}
    >
      <div
        ref={containerRef}
        style={{
          height: videos.length * PAGE_HEIGHT_JS,
          width: '100%',
        }}
      >
        {videos.map((video, index) => {
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
                    if (el) {
                      videoRefsMap.current.set(video.id, el);
                    } else {
                      videoRefsMap.current.delete(video.id);
                    }
                  }}
                  poster={video.thumbnailPath}
                  muted={true} // Initial muted state
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
                  {shouldRenderVideoTag && !video.url ? 'Video failed to load or invalid path' : 'Video Placeholder'}
                </div>
              )}
            </div>
          );
        })}
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
            Loading...
          </div>
        )}
        {!hasMore && videos.length > 0 && (
          <div
            style={{
              height: PAGE_HEIGHT_JS / 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              backgroundColor: '#333',
            }}
          >
            You've reached the end!
          </div>
        )}
      </div>
    </div>
  );
};

export default DouyinStyleCarousel;
