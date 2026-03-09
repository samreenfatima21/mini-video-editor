"use client";

import { useState, useEffect } from "react";
import type { TimelineClip } from "@/types/editor";

const THUMBNAILS_PER_CLIP = 5;

export function useThumbnails(videoUrl: string | null, duration: number) {
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  useEffect(() => {
    if (!videoUrl || duration <= 0) {
      setThumbnails([]);
      return;
    }

    let cancelled = false;
    const thumbs: string[] = [];

    const extractThumbnails = async () => {
      const video = document.createElement("video");
      video.crossOrigin = "anonymous";
      video.muted = true;
      video.src = videoUrl;

      await new Promise<void>((resolve) => {
        video.onloadeddata = () => resolve();
        video.onerror = () => resolve();
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = 120;
      canvas.height = 68;

      for (let i = 0; i < 10; i++) {
        if (cancelled) return;
        const time = (duration / 10) * (i + 0.5);
        video.currentTime = time;
        await new Promise<void>((resolve) => {
          video.onseeked = () => {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            thumbs.push(canvas.toDataURL("image/jpeg", 0.4));
            resolve();
          };
          setTimeout(resolve, 2000);
        });
      }

      if (!cancelled) setThumbnails([...thumbs]);
      video.src = "";
    };

    extractThumbnails();
    return () => { cancelled = true; };
  }, [videoUrl, duration]);

  return thumbnails;
}

// Multi-clip thumbnails: generates thumbnails for each clip by ID
export function useMultiThumbnails(clips: TimelineClip[]) {
  const [thumbMap, setThumbMap] = useState<Record<string, string[]>>({});

  useEffect(() => {
    let cancelled = false;

    const generate = async () => {
      const newMap: Record<string, string[]> = {};

      for (const clip of clips) {
        if (cancelled) return;
        // Skip if already generated for this clip
        if (thumbMap[clip.id] && thumbMap[clip.id].length > 0) {
          newMap[clip.id] = thumbMap[clip.id];
          continue;
        }

        const duration = clip.trim.end > 0 ? clip.trim.end - clip.trim.start : 0;
        if (!clip.video.url || duration <= 0) {
          newMap[clip.id] = [];
          continue;
        }

        const video = document.createElement("video");
        video.crossOrigin = "anonymous";
        video.muted = true;
        video.src = clip.video.url;

        await new Promise<void>((resolve) => {
          video.onloadeddata = () => resolve();
          video.onerror = () => resolve();
        });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) { newMap[clip.id] = []; continue; }

        canvas.width = 120;
        canvas.height = 68;
        const thumbs: string[] = [];

        for (let i = 0; i < THUMBNAILS_PER_CLIP; i++) {
          if (cancelled) return;
          const time = clip.trim.start + ((duration / THUMBNAILS_PER_CLIP) * (i + 0.5));
          video.currentTime = time;
          await new Promise<void>((resolve) => {
            video.onseeked = () => {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              thumbs.push(canvas.toDataURL("image/jpeg", 0.4));
              resolve();
            };
            setTimeout(resolve, 2000);
          });
        }

        newMap[clip.id] = thumbs;
        video.src = "";
      }

      if (!cancelled) setThumbMap(newMap);
    };

    if (clips.length > 0) generate();
    return () => { cancelled = true; };
  // Only re-run when clip IDs or trim values change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clips.map(c => `${c.id}:${c.trim.start}:${c.trim.end}`).join(",")]);

  return thumbMap;
}
