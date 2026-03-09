"use client";

import { useState, useEffect, useRef } from "react";
import type { TimelineClip } from "@/types/editor";

interface WaveformData {
  peaks: number[];
  duration: number;
}

const PEAK_COUNT = 200;

async function extractPeaks(videoUrl: string): Promise<WaveformData> {
  const audioCtx = new AudioContext();
  try {
    const response = await fetch(videoUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    const channelData = audioBuffer.getChannelData(0);
    const samplesPerPeak = Math.floor(channelData.length / PEAK_COUNT);
    const peaks: number[] = [];

    for (let i = 0; i < PEAK_COUNT; i++) {
      let max = 0;
      const start = i * samplesPerPeak;
      const end = Math.min(start + samplesPerPeak, channelData.length);
      for (let j = start; j < end; j++) {
        const abs = Math.abs(channelData[j]);
        if (abs > max) max = abs;
      }
      peaks.push(max);
    }

    return { peaks, duration: audioBuffer.duration };
  } finally {
    await audioCtx.close();
  }
}

export function useAudioWaveform(clips: TimelineClip[]): Record<string, WaveformData> {
  const [waveforms, setWaveforms] = useState<Record<string, WaveformData>>({});
  const processedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    const processClips = async () => {
      for (const clip of clips) {
        if (cancelled) break;
        if (processedRef.current.has(clip.id)) continue;

        processedRef.current.add(clip.id);
        try {
          const data = await extractPeaks(clip.video.url);
          if (!cancelled) {
            setWaveforms((prev) => ({ ...prev, [clip.id]: data }));
          }
        } catch {
          // Audio extraction may fail for some formats — skip silently
        }
      }
    };

    processClips();
    return () => { cancelled = true; };
  }, [clips]);

  // Clean up removed clip IDs
  useEffect(() => {
    const currentIds = new Set(clips.map((c) => c.id));
    const toRemove = [...processedRef.current].filter((id) => !currentIds.has(id));
    if (toRemove.length > 0) {
      toRemove.forEach((id) => processedRef.current.delete(id));
      setWaveforms((prev) => {
        const next = { ...prev };
        toRemove.forEach((id) => delete next[id]);
        return next;
      });
    }
  }, [clips]);

  return waveforms;
}
