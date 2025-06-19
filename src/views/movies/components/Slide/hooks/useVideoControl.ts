// src/hooks/useVideoControl.ts
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * 为单个 HTMLVideoElement 提供播放、暂停、进度、音量、播放速度等控制和状态。
 * @param videoElement HTMLVideoElement 引用。
 */
export interface VideoControlsProps {
  // 稳定函数 props
  play?: () => Promise<void> | undefined;
  pause?: () => void;
  togglePlay?: () => void;
  seek?: (time: number) => void;
  endSeek?: () => void;
  setVolume?: (vol: number) => void;
  toggleMute?: () => void;
  setMuted?: (muted: boolean) => void;
  setPlaybackRate?: (rate: number) => void;
  // 频繁变化的状态 props
  isPlaying?: boolean;
  currentTime?: number;
  duration?: number;
  volume?: number;
  isMuted?: boolean;
  playbackRate?: number;
}

export const useVideoControl = (videoElement: HTMLVideoElement | null) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1); // 0 to 1
  const [isMuted, setIsMuted] = useState(true); // 默认静音
  const [playbackRate, setPlaybackRateState] = useState(1); // 新增状态：播放速度

  const isSeeking = useRef(false); // 避免在拖动进度条时频繁更新

  useEffect(() => {
    if (!videoElement) return;

    const updateState = () => {
      setIsPlaying(!videoElement.paused);
      setCurrentTime(videoElement.currentTime);
      setDuration(videoElement.duration || 0);
      setVolumeState(videoElement.volume);
      setIsMuted(videoElement.muted);
      setPlaybackRateState(videoElement.playbackRate); // 初始化播放速度状态
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      if (!isSeeking.current) {
        setCurrentTime(videoElement.currentTime);
      }
    };
    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
      updateState(); // 确保加载元数据后更新所有状态
    };
    const handleVolumeChange = () => {
      setVolumeState(videoElement.volume);
      setIsMuted(videoElement.muted);
    };
    const handleRateChange = () => {
      // 新增事件处理：播放速度变化
      setPlaybackRateState(videoElement.playbackRate);
    };
    const handleEnded = () => {
      // 新增事件处理：视频播放结束
      setIsPlaying(false);
    };

    // 添加事件监听器
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('volumechange', handleVolumeChange);
    videoElement.addEventListener('ratechange', handleRateChange);
    videoElement.addEventListener('ended', handleEnded);

    // 初始化状态
    updateState();

    return () => {
      // 清理事件监听器
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('volumechange', handleVolumeChange);
      videoElement.removeEventListener('ratechange', handleRateChange);
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, [videoElement]);

  const play = useCallback(() => {
    if (videoElement) {
      // 尝试播放时，先尝试解除静音。如果浏览器策略不允许，会保持静音或暂停
      if (isMuted) {
        // 只有在当前静音状态下才尝试取消静音
        videoElement.muted = false;
      }
      videoElement.play().catch((err) => {
        console.warn('播放失败:', err);
        // 如果解除静音后播放失败（通常是浏览器策略），保持静音并尝试播放
        if (err.name === 'NotAllowedError') {
          videoElement.muted = true;
          videoElement.play().catch((e) => console.warn('静音播放也失败:', e));
        }
      });
    }
  }, [videoElement, isMuted]);

  const pause = useCallback(() => {
    if (videoElement) {
      videoElement.pause();
    }
  }, [videoElement]);

  const togglePlay = useCallback(() => {
    if (videoElement) {
      if (videoElement.paused) {
        play();
      } else {
        pause();
      }
    }
  }, [videoElement, play, pause]);

  const seek = useCallback(
    (time: number) => {
      if (videoElement) {
        isSeeking.current = true; // 开始拖动
        videoElement.currentTime = time;
      }
    },
    [videoElement]
  );

  // 拖动结束时调用，允许 timeupdate 再次更新 currentTime
  const endSeek = useCallback(() => {
    isSeeking.current = false;
  }, []);

  const setVolume = useCallback(
    (value: number) => {
      if (videoElement) {
        videoElement.volume = Math.max(0, Math.min(1, value));
        if (videoElement.volume > 0) {
          videoElement.muted = false; // 设置音量大于0时取消静音
        } else {
          videoElement.muted = true; // 音量为0时静音
        }
      }
    },
    [videoElement]
  );

  const toggleMute = useCallback(() => {
    if (videoElement) {
      videoElement.muted = !videoElement.muted;
      setIsMuted(videoElement.muted); // 立即更新状态
    }
  }, [videoElement]);
  const setPlaybackRate = useCallback(
    (rate: number) => {
      if (videoElement) {
        videoElement.playbackRate = rate;
        setPlaybackRateState(rate); // 立即更新状态
      }
    },
    [videoElement]
  );

  return {
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    play,
    pause,
    togglePlay,
    seek,
    endSeek,
    setVolume,
    toggleMute,
    setPlaybackRate,
  };
};
