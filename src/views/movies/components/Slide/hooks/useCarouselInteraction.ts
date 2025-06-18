// hooks/useCarouselInteraction.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { throttle } from '@/utils/index'; // 您的节流工具函数
import { useEvent } from './useEvent'; // 通用的事件监听 Hook

const SWIPE_THRESHOLD = 50; // 最小滑动距离，用于触发导航
const VELOCITY_THRESHOLD = 0.3; // 最小滑动速度，用于触发导航 (像素/毫秒)
const SCROLL_TRANSITION_DURATION = '0.4s ease-out';
const THROTTLE_INTERVAL = 200; // 节流间隔

interface UseCarouselInteractionProps {
  totalItems: number; // 视频总数
  onLoadNextPage: () => void; // 触发加载下一页的回调
  hasMore: boolean; // 是否还有更多数据
  isFetchingData: boolean; // 数据是否正在加载中
  fetchThresholdFromEnd?: number; // 距离末尾多少个项目时触发加载
  pageHeight: number; // 单个项目的高度（像素）
  containerRef: React.RefObject<HTMLDivElement | null>; // 轮播容器的引用
}

/**
 * 管理轮播图的导航（currentIndex）、手势识别（触摸滑动），以及无限滚动加载。
 *
 * @param totalItems 轮播中的总项目数（视频数量）。
 * @param onLoadNextPage 当需要加载下一页时调用的回调函数。
 * @param hasMore 指示是否还有更多数据可加载。
 * @param isFetchingData 指示数据是否正在加载中。
 * @param fetchThresholdFromEnd 距离末尾多少个项目时触发加载下一页。
 * @param pageHeight 单个项目的高度（像素）。
 * @param containerRef 轮播容器的引用，用于应用样式和附加触摸事件。
 * @returns 包含当前索引 `currentIndex`。
 */
export const useCarouselInteraction = ({
  totalItems,
  onLoadNextPage,
  hasMore,
  isFetchingData,
  fetchThresholdFromEnd = 3,
  pageHeight,
  containerRef,
}: UseCarouselInteractionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const touchStartY = useRef(0);
  const touchMoveY = useRef(0);
  const touchStartTime = useRef(0);
  const isSwiping = useRef(false); // 用于区分用户滑动和程序滚动

  // 核心滚动逻辑：更新 currentIndex 并触发加载
  const scrollTo = useCallback(
    (targetIndex: number) => {
      // 确保索引不越界
      const newIndex = Math.max(0, Math.min(totalItems - 1, targetIndex));

      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);

        // 如果接近末尾且有更多数据未加载，则触发加载下一页
        if (hasMore && !isFetchingData && totalItems - newIndex <= fetchThresholdFromEnd) {
          console.log('[useCarouselInteraction] Triggering next page load...');
          onLoadNextPage();
        }
      }
    },
    [currentIndex, totalItems, hasMore, isFetchingData, fetchThresholdFromEnd, onLoadNextPage]
  );

  // --- 视觉过渡效果 ---
  useEffect(() => {
    if (containerRef.current && !isSwiping.current) {
      // 只有在非滑动状态下才应用过渡
      containerRef.current.style.transition = `transform ${SCROLL_TRANSITION_DURATION}`;
      containerRef.current.style.transform = `translateY(${-currentIndex * pageHeight}px)`;
    }
  }, [currentIndex, pageHeight, containerRef]);

  // --- 触摸手势处理 ---
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      isSwiping.current = true;
      touchStartY.current = e.touches[0].clientY;
      touchMoveY.current = e.touches[0].clientY;
      touchStartTime.current = Date.now();

      if (containerRef.current) {
        containerRef.current.style.transition = 'none'; // 滑动期间禁用过渡效果
      }
    },
    [containerRef]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isSwiping.current) return;

      touchMoveY.current = e.touches[0].clientY;
      const deltaY = touchMoveY.current - touchStartY.current;

      if (containerRef.current) {
        const currentTranslateY = -currentIndex * pageHeight;
        containerRef.current.style.transform = `translateY(${currentTranslateY + deltaY}px)`;
      }
    },
    [currentIndex, pageHeight, containerRef]
  );

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping.current) return;
    isSwiping.current = false; // 触摸结束，解除滑动状态

    const deltaY = touchMoveY.current - touchStartY.current;
    const deltaTime = Date.now() - touchStartTime.current;
    const velocity = Math.abs(deltaY / deltaTime);

    if (containerRef.current) {
      containerRef.current.style.transition = `transform ${SCROLL_TRANSITION_DURATION}`; // 重新启用过渡效果
    }
    let targetIndex = currentIndex;

    // 根据滑动距离或速度判断导航方向
    if (deltaY < -SWIPE_THRESHOLD || (deltaY < 0 && velocity > VELOCITY_THRESHOLD)) {
      targetIndex = currentIndex + 1; // 向上滑动（显示下一个视频）
      if (totalItems == targetIndex && containerRef.current) {
        containerRef.current.style.transform = `translateY(${-currentIndex * pageHeight}px)`;
      }
    } else if (deltaY > SWIPE_THRESHOLD || (deltaY > 0 && velocity > VELOCITY_THRESHOLD)) {
      targetIndex = currentIndex - 1; // 向下滑动（显示上一个视频）
      if (currentIndex === 0 && containerRef.current) {
        containerRef.current.style.transition = `transform ${SCROLL_TRANSITION_DURATION}`;
        containerRef.current.style.transform = `translateY(0px)`;
      }
    } else {
      if (containerRef.current) containerRef.current.style.transform = `translateY(${-targetIndex * pageHeight}px)`;
    }
    scrollTo(targetIndex);
  }, [currentIndex, scrollTo, containerRef]);

  // --- 事件监听器绑定 ---
  const throttledHandleWheel = useCallback(
    throttle((e: WheelEvent) => {
      e.preventDefault(); // 阻止默认的滚轮行为
      if (e.deltaY > 0) {
        scrollTo(currentIndex + 1);
      } else if (e.deltaY < 0) {
        scrollTo(currentIndex - 1);
      }
    }, THROTTLE_INTERVAL),
    [currentIndex, scrollTo]
  );

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
  const goToNext = useCallback(() => {
    scrollTo(currentIndex + 1);
  }, [currentIndex, scrollTo]);

  const goToPrev = useCallback(() => {
    scrollTo(currentIndex - 1);
  }, [currentIndex, scrollTo]);

  // 绑定全局和容器事件
  useEvent(window, 'wheel', throttledHandleWheel, { passive: false });
  useEvent(window, 'keydown', throttledHandleKeyDown);
  useEvent(containerRef, 'touchstart', handleTouchStart, { passive: false });
  useEvent(containerRef, 'touchmove', handleTouchMove, { passive: false });
  useEvent(containerRef, 'touchend', handleTouchEnd, { passive: false });
  useEvent(containerRef, 'touchcancel', handleTouchEnd, { passive: false });

  return { currentIndex, goToNext, goToPrev };
};
