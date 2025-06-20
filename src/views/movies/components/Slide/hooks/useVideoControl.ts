// src/hooks/useVideoControl.ts
import { useState, useEffect, useRef, useCallback } from 'react';

// --- 导出 Hook 返回值的类型 ---
export interface UseVideoControlReturn {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  play: () => Promise<void> | undefined;
  pause: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  endSeek: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
  setPlaybackRate: (rate: number) => void;
}
// --- 导出 Hook 返回值的类型 ---

export const useVideoControl = (
  videoElement: HTMLVideoElement | null // videoElement can be null initially
): UseVideoControlReturn => {
  // 1. All useState, useRef, useCallback, useEffect calls MUST be at the top level and unconditional.
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(true); // 默认静音
  const [playbackRate, setPlaybackRateState] = useState(1);

  const isSeeking = useRef(false);
  const userVolume = useRef(1);

  // Define noop functions once, unconditionally.
  const noop = useCallback(() => {}, []);
  const noopAsync = useCallback(async () => {}, []);
  const noopSet = useCallback((val: any) => {}, []);

  // 2. Define all callback functions unconditionally. Their logic can be conditional.
  const togglePlay = useCallback(() => {
    if (!videoElement) return; // Add null check inside the function's logic
    if (isPlaying) {
      videoElement.pause();
    } else {
      videoElement.play().catch((error) => {
        console.error('Video play failed:', error);
        if (error.name === 'NotAllowedError' && !videoElement.muted) {
          videoElement.muted = true;
          videoElement
            .play()
            .then(() => {
              console.log('Auto-played muted due to browser policy.');
            })
            .catch((subError) => {
              console.error('Muted play also failed:', subError);
            });
        }
      });
    }
  }, [isPlaying, videoElement]);

  const play = useCallback(async () => {
    // Keep async
    if (!videoElement) return; // Add null check inside the function's logic
    if (videoElement.paused) {
      await videoElement.play().catch((error) => {
        console.error('Video play failed (explicit call):', error);
        if (error.name === 'NotAllowedError' && !videoElement.muted) {
          videoElement.muted = true;
          videoElement.play();
        }
      });
    }
  }, [videoElement]);

  const pause = useCallback(() => {
    if (!videoElement) return; // Add null check inside the function's logic
    if (!videoElement.paused) {
      videoElement.pause();
    }
  }, [videoElement]);

  const seek = useCallback((time: number) => {
    // No videoElement check needed here, as setCurrentTime is always safe.
    setCurrentTime(time);
    isSeeking.current = true;
  }, []);

  const endSeek = useCallback(() => {
    if (videoElement) {
      // Add null check here before accessing videoElement
      videoElement.currentTime = currentTime;
    }
    isSeeking.current = false;
  }, [videoElement, currentTime]);

  const setVolume = useCallback(
    (vol: number) => {
      if (!videoElement) return; // Add null check
      videoElement.volume = vol;
      setVolumeState(vol);
      if (vol > 0 && isMuted) {
        setIsMuted(false);
      }
      if (vol === 0 && !isMuted) {
        setIsMuted(true);
      }
      userVolume.current = vol;
    },
    [videoElement, isMuted]
  );

  const toggleMute = useCallback(() => {
    if (!videoElement) return; // Add null check
    const newMutedState = !isMuted;
    videoElement.muted = newMutedState;
    setIsMuted(newMutedState);
    if (!newMutedState) {
      videoElement.volume = userVolume.current > 0 ? userVolume.current : 1;
      setVolumeState(videoElement.volume);
    } else {
      setVolumeState(0);
    }
  }, [isMuted, videoElement]);

  const setMuted = useCallback(
    (muted: boolean) => {
      if (!videoElement) return; // Add null check
      videoElement.muted = muted;
      setIsMuted(muted);
      if (!muted) {
        videoElement.volume = userVolume.current > 0 ? userVolume.current : 1;
        setVolumeState(videoElement.volume);
      } else {
        setVolumeState(0);
      }
    },
    [videoElement]
  );

  const setPlaybackRate = useCallback(
    (rate: number) => {
      if (!videoElement) return; // Add null check
      videoElement.playbackRate = rate;
      setPlaybackRateState(rate);
    },
    [videoElement]
  );

  // 3. useEffect must also be called unconditionally.
  useEffect(() => {
    // Perform checks for videoElement inside the effect's callback.
    if (!videoElement) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    const handleTimeUpdate = () => {
      if (!isSeeking.current) {
        setCurrentTime(videoElement.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
      setVolumeState(videoElement.volume);
      setIsMuted(videoElement.muted);
      setPlaybackRateState(videoElement.playbackRate);
    };
    const handleVolumeChange = () => {
      setVolumeState(videoElement.volume);
      setIsMuted(videoElement.muted);
      if (!videoElement.muted) {
        userVolume.current = videoElement.volume;
      }
    };
    const handleRateChange = () => setPlaybackRateState(videoElement.playbackRate);

    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('volumechange', handleVolumeChange);
    videoElement.addEventListener('ratechange', handleRateChange);

    // Initialize state, but only if videoElement is available.
    setIsPlaying(!videoElement.paused);
    setCurrentTime(videoElement.currentTime);
    setDuration(videoElement.duration);
    setVolumeState(videoElement.volume);
    setIsMuted(videoElement.muted);
    setPlaybackRateState(videoElement.playbackRate);

    return () => {
      // Cleanup only if videoElement was available for adding listeners.
      if (videoElement) {
        videoElement.removeEventListener('play', handlePlay);
        videoElement.removeEventListener('pause', handlePause);
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
        videoElement.removeEventListener('volumechange', handleVolumeChange);
        videoElement.removeEventListener('ratechange', handleRateChange);
      }
    };
  }, [videoElement, isSeeking]); // Dependencies are fine as they are.

  // 4. The final return value. If videoElement is null, these functions will still be called,
  //    but their internal logic will bail out early due to the null checks.
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
    setMuted,
    setPlaybackRate,
  };
};
