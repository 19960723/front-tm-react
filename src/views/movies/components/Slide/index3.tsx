import { useRef, useEffect } from 'react';
import { throttle } from '@/utils/index';

// Throttle interval (milliseconds) - 200ms is a common smooth value
const THROTTLE_INTERVAL = 200;

const TouchContainer: React.FC = () => {
  const touchRef = useRef<HTMLDivElement>(null);

  const scrollTo = () => {};

  const throttledHandleWheel = (e: WheelEvent) => {
    console.log('wheel', e.deltaY);
  };
  const throttledHandleKeyDown = (e: KeyboardEvent) => {
    throttle((e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 0) {
      } else if (e.deltaY < 0) {
      }
    }, THROTTLE_INTERVAL);
  };
  const handleTouchStart = (e: TouchEvent) => {
    console.log('start', e);
  };
  const handleTouchMove = (e: TouchEvent) => {
    console.log('move', e);
  };
  const handleTouchEnd = () => {
    console.log('end');
  };
  useEffect(() => {
    window.addEventListener('wheel', throttledHandleWheel, { passive: false });
    window.addEventListener('keydown', throttledHandleKeyDown);

    const el = touchRef.current;
    if (el) {
      el.addEventListener('touchstart', handleTouchStart, { passive: false });
      el.addEventListener('touchmove', handleTouchMove, { passive: false });
      el.addEventListener('touchend', handleTouchEnd, { passive: false });
      el.addEventListener('touchcancel', handleTouchEnd, { passive: false });
    }

    return () => {
      window.removeEventListener('wheel', throttledHandleWheel);
      window.removeEventListener('keydown', throttledHandleKeyDown);
      if (el) {
        el.removeEventListener('touchstart', handleTouchStart);
        el.removeEventListener('touchmove', handleTouchMove);
        el.removeEventListener('touchend', handleTouchEnd);
        el.removeEventListener('touchcancel', handleTouchEnd);
      }
    };
  }, [throttledHandleWheel, throttledHandleKeyDown, handleTouchStart, handleTouchMove, handleTouchEnd]);
  return <div ref={touchRef} className="bg-black relative overflow-hidden w-full h-screen touch-none"></div>;
};

const DouyinStyleCarousel: React.FC = () => {
  return <TouchContainer></TouchContainer>;
};
export default DouyinStyleCarousel;
