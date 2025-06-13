// hooks/useVideoPlayback.ts
import { useEffect, useRef } from 'react';

const INTERSECTION_THRESHOLD = 0.8; // 视频可见性达到80%时触发播放/暂停

/**
 * 管理视频播放和暂停，基于其与视口的交叉情况。
 * 自动播放视频当它们充分可见时，并在不可见时暂停。
 * 通过先静音再播放的方式，处理浏览器自动播放策略。
 *
 * @param videoRefsMap 一个 Map，存储视频ID和对应的HTMLVideoElement引用。
 */
export const useVideoPlayback = (videoRefsMap: React.MutableRefObject<Map<string, HTMLVideoElement>>) => {
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // 如果存在旧的观察器，先断开连接
    if (intersectionObserverRef.current) {
      intersectionObserverRef.current.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoElement = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            // 视频进入视口
            if (videoElement.paused) {
              videoElement.muted = true; // 在尝试播放前确保静音，这提高了自动播放的成功率
              videoElement
                .play()
                .then(() => {
                  // 播放成功后取消静音
                  videoElement.muted = false;
                })
                .catch((err) => {
                  console.warn('[useVideoPlayback] Video playback was blocked:', err);
                  if (err.name === 'NotAllowedError') {
                    // 如果浏览器阻止了音频播放（例如，没有用户交互），则强制静音播放
                    videoElement.muted = true;
                    videoElement.play().catch((e) => console.warn('[useVideoPlayback] Fallback muted play failed:', e));
                  }
                  // AbortError 通常意味着 play() 请求立即被 pause() 中断，快速滚动时常见，无需特殊处理。
                });
            }
          } else {
            // 视频移出视口
            if (!videoElement.paused) {
              videoElement.pause();
              videoElement.currentTime = 0; // 重置到视频开头
            }
            videoElement.muted = true; // 视频移出视口时静音
          }
        });
      },
      { threshold: INTERSECTION_THRESHOLD }
    );

    // 观察所有当前可用的视频元素
    videoRefsMap.current.forEach((videoElement) => {
      observer.observe(videoElement);
    });

    intersectionObserverRef.current = observer;

    return () => {
      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.disconnect();
      }
    };
  }, [videoRefsMap.current]); // 当视频引用Map发生变化时（例如添加新视频），重新运行效果
};
