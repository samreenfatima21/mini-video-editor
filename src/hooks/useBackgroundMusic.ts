"use client";

import { useRef, useEffect, useCallback } from "react";
import type { BackgroundMusic } from "@/types/editor";

export function useBackgroundMusic(
  music: BackgroundMusic | null,
  isPlaying: boolean,
  currentTime: number,
  videoRef: HTMLVideoElement | null
) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create/update audio element when music changes
  useEffect(() => {
    if (!music) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }

    if (!audioRef.current || audioRef.current.src !== music.url) {
      if (audioRef.current) audioRef.current.pause();
      audioRef.current = new Audio(music.url);
      audioRef.current.loop = music.loop;
    }

    audioRef.current.volume = music.volume;
    audioRef.current.loop = music.loop;
  }, [music]);

  // Sync play/pause
  useEffect(() => {
    if (!audioRef.current || !music) return;
    if (isPlaying) {
      audioRef.current.currentTime = Math.max(0, (currentTime || 0) - music.startOffset);
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, music]);

  // Sync seek
  useEffect(() => {
    if (!audioRef.current || !music || !isPlaying) return;
    const expectedTime = Math.max(0, currentTime - music.startOffset);
    if (Math.abs(audioRef.current.currentTime - expectedTime) > 0.5) {
      audioRef.current.currentTime = expectedTime;
    }
  }, [currentTime, music, isPlaying]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const seekAudio = useCallback((time: number) => {
    if (!audioRef.current || !music) return;
    audioRef.current.currentTime = Math.max(0, time - music.startOffset);
  }, [music]);

  return { seekAudio };
}
