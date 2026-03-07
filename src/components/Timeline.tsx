"use client";

// Timeline — a visual bar that shows where you are in the video.
// Shows:
// - A playhead (current position marker) that moves as the video plays
// - The trim region highlighted in blue
// - Time markers along the bottom
// - Click anywhere to jump to that point in the video

import { useRef } from "react";

interface TimelineProps {
  // Current playback position in seconds
  currentTime: number;
  // Total video length in seconds
  duration: number;
  // Trim start/end points
  trimStart: number;
  trimEnd: number;
  // Called when user clicks the timeline to seek
  onSeek: (time: number) => void;
}

export default function Timeline({
  currentTime,
  duration,
  trimStart,
  trimEnd,
  onSeek,
}: TimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);

  // Convert a click position to a time value
  const handleClick = (e: React.MouseEvent) => {
    if (!timelineRef.current || duration === 0) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = clickX / rect.width;
    onSeek(percent * duration);
  };

  // Format seconds into M:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Generate time markers (one every few seconds depending on duration)
  const getTimeMarkers = () => {
    if (duration === 0) return [];
    // Decide spacing: short videos get markers every 1s, longer ones every 5s or 10s
    let interval = 1;
    if (duration > 30) interval = 5;
    if (duration > 120) interval = 10;
    if (duration > 300) interval = 30;

    const markers = [];
    for (let t = 0; t <= duration; t += interval) {
      markers.push(t);
    }
    return markers;
  };

  // Percentages for positioning
  const playheadPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const trimStartPercent = duration > 0 ? (trimStart / duration) * 100 : 0;
  const trimEndPercent = duration > 0 ? (trimEnd / duration) * 100 : 0;

  return (
    <div className="w-full bg-zinc-900 rounded-xl p-5 mt-4">
      <h3 className="text-white font-medium mb-3">Timeline</h3>

      {/* Timeline bar */}
      <div
        ref={timelineRef}
        className="relative w-full h-12 bg-zinc-800 rounded-lg cursor-pointer overflow-hidden"
        onClick={handleClick}
      >
        {/* Trim region — highlighted area between start and end */}
        <div
          className="absolute top-0 h-full bg-blue-500/20 border-l-2 border-r-2 border-blue-500"
          style={{
            left: `${trimStartPercent}%`,
            width: `${trimEndPercent - trimStartPercent}%`,
          }}
        />

        {/* Playhead — the moving vertical line showing current position */}
        <div
          className="absolute top-0 h-full w-0.5 bg-white z-10"
          style={{ left: `${playheadPercent}%` }}
        >
          {/* Playhead handle (the little triangle at top) */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-sm rotate-45" />
        </div>

        {/* Current time tooltip above playhead */}
        <div
          className="absolute -top-6 z-20 text-xs text-white bg-zinc-700 px-1.5 py-0.5 rounded"
          style={{
            left: `${playheadPercent}%`,
            transform: "translateX(-50%)",
          }}
        >
          {formatTime(currentTime)}
        </div>
      </div>

      {/* Time markers below the timeline */}
      <div className="relative w-full h-5 mt-1">
        {getTimeMarkers().map((t) => (
          <div
            key={t}
            className="absolute text-zinc-500 text-[10px]"
            style={{
              left: `${(t / duration) * 100}%`,
              transform: "translateX(-50%)",
            }}
          >
            {formatTime(t)}
          </div>
        ))}
      </div>
    </div>
  );
}
