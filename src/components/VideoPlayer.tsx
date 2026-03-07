"use client";

// VideoPlayer — shows the uploaded video with play/pause controls.
// This is the main preview area where users see their video.

import { useRef, useState, useEffect } from "react";
import type { FilterSettings, TextOverlay } from "@/types/editor";

interface VideoPlayerProps {
  videoUrl: string;
  videoName: string;
  filters: FilterSettings;
  textOverlays: TextOverlay[];
  onRemoveVideo: () => void;
  // We pass the video element ref up so other components (like trim) can control it
  onVideoRef?: (ref: HTMLVideoElement | null) => void;
  onTimeUpdate?: (currentTime: number) => void;
  onLoadedMetadata?: (duration: number) => void;
}

export default function VideoPlayer({
  videoUrl,
  videoName,
  filters,
  textOverlays,
  onRemoveVideo,
  onVideoRef,
  onTimeUpdate,
  onLoadedMetadata,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Pass the video element reference to the parent when it's ready
  useEffect(() => {
    onVideoRef?.(videoRef.current);
  }, [onVideoRef]);

  // Build the CSS filter string from our filter settings
  // This applies visual filters WITHOUT modifying the actual video file
  const filterStyle = {
    filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) grayscale(${filters.grayscale}%)`,
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Format seconds into MM:SS display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full">
      {/* Video filename + remove button */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-zinc-300 text-sm font-medium truncate">
          {videoName}
        </h2>
        <button
          onClick={onRemoveVideo}
          className="text-zinc-500 hover:text-red-400 text-sm transition-colors"
        >
          Remove
        </button>
      </div>

      {/* The actual video element */}
      <div className="relative rounded-xl overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={videoUrl}
          style={filterStyle}
          className="w-full max-h-[500px] object-contain"
          onTimeUpdate={() => {
            if (videoRef.current) {
              const time = videoRef.current.currentTime;
              setCurrentTime(time);
              onTimeUpdate?.(time);
            }
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              const dur = videoRef.current.duration;
              setDuration(dur);
              onLoadedMetadata?.(dur);
            }
          }}
          onEnded={() => setIsPlaying(false)}
          onClick={togglePlay}
        />

        {/* Text overlays rendered on top of the video */}
        {textOverlays.map((overlay) => (
          <div
            key={overlay.id}
            className="absolute pointer-events-none select-none font-bold"
            style={{
              left: `${overlay.x}%`,
              top: `${overlay.y}%`,
              transform: "translate(-50%, -50%)",
              fontSize: `${overlay.fontSize}px`,
              color: overlay.color,
              textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
            }}
          >
            {overlay.text}
          </div>
        ))}
      </div>

      {/* Playback controls */}
      <div className="flex items-center gap-4 mt-3">
        {/* Play/Pause button */}
        <button
          onClick={togglePlay}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors"
        >
          {isPlaying ? (
            // Pause icon
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            // Play icon
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Time display */}
        <span className="text-zinc-400 text-sm font-mono min-w-[100px]">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        {/* Progress bar — click to seek */}
        <div
          className="flex-1 h-2 bg-zinc-800 rounded-full cursor-pointer relative"
          onClick={(e) => {
            if (!videoRef.current) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percent = clickX / rect.width;
            videoRef.current.currentTime = percent * duration;
          }}
        >
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{
              width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%",
            }}
          />
        </div>
      </div>
    </div>
  );
}
