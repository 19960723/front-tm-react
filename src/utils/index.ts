export function formatRelativeTime(inputDate: string | number | Date): string {
  const date = new Date(inputDate);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffSeconds < 60) {
    return '刚刚';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`;
  } else if (diffHours < 24) {
    return `${diffHours}小时前`;
  } else if (diffDays <= 2) {
    return `${diffDays}天前`;
  } else {
    // 超过两天，返回 yyyy-MM-dd 格式
    return date
      .toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      .replace(/\//g, '-');
  }
}

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((this: ThisParameterType<T>, ...args: Parameters<T>) => ReturnType<T> | undefined) => {
  let inThrottle: boolean;
  let lastResult: ReturnType<T> | undefined;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastContext: ThisParameterType<T> | undefined; // Stores the correct 'this' context
  let lastArgs: Parameters<T> | undefined; // Stores the correct arguments

  return function (this: ThisParameterType<T>, ...args: Parameters<T>): ReturnType<T> | undefined {
    lastContext = this; // Capture the current 'this' context
    lastArgs = args; // Capture the current arguments

    if (!inThrottle) {
      inThrottle = true;
      lastResult = func.apply(lastContext, lastArgs); // Use the captured context and arguments
      timeoutId = setTimeout(() => {
        inThrottle = false;
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      }, limit);
      return lastResult; // Execute the first time and return the result
    }
    // During throttling, don't execute 'func'. Return undefined.
    return undefined;
  };
};

export const _duration = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export function setFullScreen(element: any) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullScreen) {
    element.webkitRequestFullScreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
}
