import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useVideoList } from '@/api/movies';

// --- Constants ---
// Use a function to get PAGE_HEIGHT in case of window resize if dynamic height is needed.
// For a fixed height carousel, window.innerHeight at mount is often acceptable.
// For true responsiveness, consider CSS `100vh` or a resize observer.
const PAGE_HEIGHT = window.innerHeight;
const PRELOAD_BUFFER_COUNT = 2; // Number of videos to preload around the current index
const FETCH_THRESHOLD_FROM_END = 3; // How many videos from the end to trigger next page fetch
const SCROLL_TRANSITION_DURATION = '0.4s ease-out';
const INTERSECTION_THRESHOLD = 0.8; // Percentage of target element visibility to trigger callback

// Gesture constants
const SWIPE_THRESHOLD = 50; // Minimum swipe distance for a navigation
const VELOCITY_THRESHOLD = 0.3; // Minimum swipe velocity for a navigation

interface VideoData {
  id: string;
  filePath?: { path: string };
  url?: string;
}

const DouyinStyleCarousel: React.FC = () => {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Use useRef to store isFetching status to avoid it as a useEffect dependency
  const isFetchingRef = useRef(false);

  // Gesture related state
  const touchStartY = useRef(0);
  const touchMoveY = useRef(0);
  const touchStartTime = useRef(0);
  const isSwiping = useRef(false); // Indicates if a swipe gesture is active

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefsMap = useRef<Map<string, HTMLVideoElement>>(new Map());
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);

  const { response, loading, error, getList } = useVideoList();

  // --- Data Loading Logic ---
  // Effect to trigger API call when currentPage changes or initially
  useEffect(() => {
    // Only fetch if there's more data and not currently fetching
    if (hasMore && !isFetchingRef.current) {
      isFetchingRef.current = true; // Mark fetching started
      console.log(`Initiating request: fetching page ${currentPage} data...`);
      getList({ pageNo: currentPage, pageSize: 10 });
    }
  }, [currentPage]); // Dependencies: currentPage, hasMore, and getList (from useCallback in useVideoList)
  // currentPage, hasMore, getList
  // Effect to process API response and update video list
  useEffect(() => {
    if (response) {
      if (response.records && response.records.length > 0) {
        const newVideoData: VideoData[] = response.records
          .map((v: any) => {
            try {
              // Safely parse filePath if it's a string, otherwise use directly
              const filePath = typeof v.filePath === 'string' ? JSON.parse(v.filePath) : v.filePath;
              return {
                ...v,
                filePath: filePath,
                url: filePath?.path, // Assuming 'path' holds the video URL
              };
            } catch (e) {
              console.error('Error parsing filePath field:', e, 'Original data:', v.filePath);
              return { ...v, filePath: null, url: '' }; // Return a fallback if parsing fails
            }
          })
          .filter((v) => v.url); // Only keep videos with a valid URL

        setVideos((prev) => {
          const existingIds = new Set(prev.map((video) => video.id));
          const uniqueNewVideos = newVideoData.filter((video) => !existingIds.has(video.id));
          return [...prev, ...uniqueNewVideos];
        });

        // Determine if there's more data based on the number of records returned
        if (response.records.length < 5) {
          // Assuming pageSize is 5
          setHasMore(false);
        }
      } else {
        setHasMore(false); // No records returned, so no more data
      }
      isFetchingRef.current = false; // Mark fetching complete
      console.log(`Page ${currentPage} data loaded.`);
    }
  }, [response, currentPage]); // Depend on response to trigger update and currentPage for logging

  // --- Video Playback/Pause Logic (Intersection Observer) ---
  useEffect(() => {
    // Disconnect previous observer if it exists
    if (intersectionObserverRef.current) {
      intersectionObserverRef.current.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoElement = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            // Only play if not currently playing to avoid unnecessary calls
            if (videoElement.paused) {
              videoElement.play().catch((err) => {
                console.warn('Video play prevented:', err);
                // Handle autoplay policy issues or other play errors
              });
              videoElement.muted = false; // Unmute the currently playing video
            }
          } else {
            // Pause and reset if not intersecting
            if (!videoElement.paused) {
              videoElement.pause();
              videoElement.currentTime = 0;
            }
            videoElement.muted = true; // Mute videos that are out of view
          }
        });
      },
      { threshold: INTERSECTION_THRESHOLD }
    );

    // Observe all video elements currently in the map
    videoRefsMap.current.forEach((videoElement) => {
      observer.observe(videoElement);
    });

    intersectionObserverRef.current = observer;

    // Cleanup: Disconnect observer when component unmounts or dependencies change
    return () => {
      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.disconnect();
      }
    };
  }, [videos]); // Re-create observer when video list changes

  // --- Scroll Animation ---
  useEffect(() => {
    if (containerRef.current) {
      if (!isSwiping.current) {
        // Apply transition only if not actively swiping
        containerRef.current.style.transition = `transform ${SCROLL_TRANSITION_DURATION}`;
        containerRef.current.style.transform = `translateY(${-currentIndex * PAGE_HEIGHT}px)`;
      }
    }
    // Removed video play/pause logic from here; it's handled by IntersectionObserver
  }, [currentIndex]); // Only depend on currentIndex for scroll animation

  // --- Navigation Logic ---
  const scrollTo = useCallback(
    (targetIndex: number) => {
      const newIndex = Math.max(0, Math.min(videos.length - 1, targetIndex));

      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
        // When nearing the end of the list, trigger next page load if more data exists
        if (hasMore && !isFetchingRef.current && videos.length - newIndex <= FETCH_THRESHOLD_FROM_END) {
          setCurrentPage((prev) => prev + 1); // Increment currentPage to trigger data request
        }
      }
    },
    [currentIndex, videos.length, hasMore]
  ); // isFetchingRef.current should not be a dependency here because it's a ref

  // --- Mouse Wheel and Keyboard Navigation ---
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault(); // Prevent default scroll behavior
      if (e.deltaY > 0) {
        scrollTo(currentIndex + 1);
      } else if (e.deltaY < 0) {
        scrollTo(currentIndex - 1);
      }
    },
    [currentIndex, scrollTo]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        scrollTo(currentIndex + 1);
      } else if (e.key === 'ArrowUp') {
        scrollTo(currentIndex - 1);
      }
    },
    [currentIndex, scrollTo]
  );

  // --- Gesture Handling Logic ---
  const handleTouchStart = useCallback((e: TouchEvent) => {
    isSwiping.current = true;
    touchStartY.current = e.touches[0].clientY;
    touchMoveY.current = e.touches[0].clientY; // Initialize touchMoveY
    touchStartTime.current = Date.now();

    if (containerRef.current) {
      containerRef.current.style.transition = 'none'; // Remove transition during touch for smooth dragging
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isSwiping.current) return;

      touchMoveY.current = e.touches[0].clientY;
      const deltaY = touchMoveY.current - touchStartY.current;

      if (containerRef.current) {
        const currentTranslateY = -currentIndex * PAGE_HEIGHT;
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

    // Determine target index based on swipe distance or velocity
    if (deltaY < -SWIPE_THRESHOLD || (deltaY < 0 && velocity > VELOCITY_THRESHOLD)) {
      targetIndex = currentIndex + 1; // Swipe up, go to next video
    } else if (deltaY > SWIPE_THRESHOLD || (deltaY > 0 && velocity > VELOCITY_THRESHOLD)) {
      targetIndex = currentIndex - 1; // Swipe down, go to previous video
    }

    scrollTo(targetIndex);

    if (containerRef.current) {
      // Re-apply transition after swipe ends
      containerRef.current.style.transition = `transform ${SCROLL_TRANSITION_DURATION}`;
    }
  }, [currentIndex, scrollTo]);

  // --- Event Listener Mounting and Cleanup ---
  useEffect(() => {
    // Add passive: false to allow e.preventDefault() for wheel and touch events
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    const carouselElement = document.getElementById('douyin-carousel-container');
    if (carouselElement) {
      carouselElement.addEventListener('touchstart', handleTouchStart, { passive: false });
      carouselElement.addEventListener('touchmove', handleTouchMove, { passive: false });
      carouselElement.addEventListener('touchend', handleTouchEnd, { passive: false });
      carouselElement.addEventListener('touchcancel', handleTouchEnd, { passive: false }); // Handle touch cancellation
    }

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);

      if (carouselElement) {
        carouselElement.removeEventListener('touchstart', handleTouchStart);
        carouselElement.removeEventListener('touchmove', handleTouchMove);
        carouselElement.removeEventListener('touchend', handleTouchEnd);
        carouselElement.removeEventListener('touchcancel', handleTouchEnd);
      }
    };
  }, [handleWheel, handleKeyDown, handleTouchStart, handleTouchMove, handleTouchEnd]); // Dependencies are the memoized handlers

  // --- Render Component ---
  return (
    <div
      id="douyin-carousel-container"
      style={{
        height: '100vh', // Use 100vh for full viewport height
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
        backgroundColor: '#000',
        touchAction: 'none', // Prevent default browser touch actions
      }}
    >
      <div
        ref={containerRef}
        style={{
          height: videos.length * PAGE_HEIGHT, // Total height of the scrollable content
          width: '100%',
          // transform is handled by useEffect for smooth scrolling
        }}
      >
        {videos.map((video, index) => {
          // Conditionally render <video> tag for performance
          const shouldRenderVideoTag = index >= currentIndex - PRELOAD_BUFFER_COUNT && index <= currentIndex + PRELOAD_BUFFER_COUNT;

          return (
            <div
              key={video.id}
              style={{
                height: PAGE_HEIGHT,
                width: '100%',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {video.url && shouldRenderVideoTag ? (
                <video
                  ref={(el) => {
                    // Store video element in map, or delete if unmounted
                    if (el) {
                      videoRefsMap.current.set(video.id, el);
                    } else {
                      videoRefsMap.current.delete(video.id);
                    }
                  }}
                  src={video.url}
                  muted={true} // Start muted, IntersectionObserver will unmute current
                  loop
                  playsInline // Important for mobile autoplay
                  preload="auto" // Preload metadata and some data
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                // Placeholder for videos not currently rendered or invalid URLs
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
        {/* Loading indicator */}
        {loading && (
          <div
            style={{
              height: PAGE_HEIGHT / 2,
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
        {/* End of list indicator */}
        {!hasMore && videos.length > 0 && (
          <div
            style={{
              height: PAGE_HEIGHT / 2,
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
