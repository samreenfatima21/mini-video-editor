"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import type { FilterSettings, TextOverlay, PlaybackSpeed, AudioSettings, CropSettings, WatermarkSettings } from "@/types/editor";

interface VideoPlayerProps {
  videoUrl: string;
  videoName: string;
  filters: FilterSettings;
  textOverlays: TextOverlay[];
  playbackSpeed: PlaybackSpeed;
  audio: AudioSettings;
  crop: CropSettings;
  watermark: WatermarkSettings;
  showOriginal?: boolean;
  onRemoveVideo: () => void;
  onVideoRef?: (ref: HTMLVideoElement | null) => void;
  onTimeUpdate?: (currentTime: number) => void;
  onLoadedMetadata?: (duration: number) => void;
  onPlaybackSpeedChange: (speed: PlaybackSpeed) => void;
  onAudioChange: (audio: AudioSettings) => void;
  onTextOverlayMove?: (id: string, x: number, y: number) => void;
}

const SPEED_OPTIONS: PlaybackSpeed[] = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const defaultFilters: FilterSettings = { brightness: 100, contrast: 100, grayscale: 0 };

// Aspect ratio CSS values
const aspectRatioCSS: Record<string, string | undefined> = {
  "16:9": "16/9",
  "9:16": "9/16",
  "1:1": "1/1",
  "4:5": "4/5",
  "4:3": "4/3",
  original: undefined,
};

export default function VideoPlayer({
  videoUrl,
  videoName,
  filters,
  textOverlays,
  playbackSpeed,
  audio,
  crop,
  watermark,
  showOriginal = false,
  onRemoveVideo,
  onVideoRef,
  onTimeUpdate,
  onLoadedMetadata,
  onPlaybackSpeedChange,
  onAudioChange,
  onTextOverlayMove,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoAreaRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [draggingOverlay, setDraggingOverlay] = useState<string | null>(null);

  useEffect(() => {
    onVideoRef?.(videoRef.current);
  }, [onVideoRef]);

  // Sync playback speed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Sync audio
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = audio.muted;
      videoRef.current.volume = audio.volume;
    }
  }, [audio.muted, audio.volume]);

  const activeFilters = showOriginal ? defaultFilters : filters;

  const filterStyle = {
    filter: `brightness(${activeFilters.brightness}%) contrast(${activeFilters.contrast}%) grayscale(${activeFilters.grayscale}%)`,
  };

  const cropStyle: React.CSSProperties = {};
  const arCSS = aspectRatioCSS[crop.preset];
  if (arCSS) {
    cropStyle.aspectRatio = arCSS;
    cropStyle.objectFit = "cover";
  }

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (videoRef.current) videoRef.current.currentTime -= 5;
          break;
        case "ArrowRight":
          e.preventDefault();
          if (videoRef.current) videoRef.current.currentTime += 5;
          break;
        case "ArrowUp":
          e.preventDefault();
          if (videoRef.current) {
            const newVol = Math.min(1, audio.volume + 0.1);
            onAudioChange({ ...audio, volume: newVol });
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (videoRef.current) {
            const newVol = Math.max(0, audio.volume - 0.1);
            onAudioChange({ ...audio, volume: newVol });
          }
          break;
        case "KeyF":
          if (containerRef.current) {
            if (document.fullscreenElement) {
              document.exitFullscreen();
            } else {
              containerRef.current.requestFullscreen();
            }
          }
          break;
        case "KeyM":
          onAudioChange({ ...audio, muted: !audio.muted });
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, audio, onAudioChange]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Drag text overlay handlers
  const handleOverlayMouseDown = (e: React.MouseEvent, overlayId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingOverlay(overlayId);
  };

  useEffect(() => {
    if (!draggingOverlay) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!videoAreaRef.current || !onTextOverlayMove) return;
      const rect = videoAreaRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      onTextOverlayMove(draggingOverlay, Math.round(x), Math.round(y));
    };

    const handleMouseUp = () => {
      setDraggingOverlay(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingOverlay, onTextOverlayMove]);

  return (
    <div className="w-full">
      {/* Video filename + remove button */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <h2 className="text-zinc-400 text-xs font-medium truncate">
            {videoName}
          </h2>
        </div>
        <button
          onClick={onRemoveVideo}
          className="flex items-center gap-1.5 text-zinc-600 hover:text-red-400 text-xs transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
          Remove
        </button>
      </div>

      {/* The actual video element */}
      <div
        ref={containerRef}
        className="relative rounded-xl overflow-hidden bg-black group"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(!isPlaying)}
      >
        <div ref={videoAreaRef} className="relative">
          <video
            ref={videoRef}
            src={videoUrl}
            style={{ ...filterStyle, ...cropStyle }}
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

          {/* Center play/pause indicator on click */}
          {!isPlaying && (
            <div
              className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/20"
              onClick={togglePlay}
            >
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}

          {/* Text overlays rendered on top of the video */}
          {textOverlays.map((overlay) => (
            <div
              key={overlay.id}
              className={`absolute select-none font-bold ${draggingOverlay === overlay.id ? "cursor-grabbing" : "cursor-grab"}`}
              style={{
                left: `${overlay.x}%`,
                top: `${overlay.y}%`,
                transform: "translate(-50%, -50%)",
                fontSize: `${overlay.fontSize}px`,
                color: overlay.color,
                textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
              }}
              onMouseDown={(e) => handleOverlayMouseDown(e, overlay.id)}
            >
              {overlay.text}
            </div>
          ))}

          {/* Watermark overlay */}
          {watermark.enabled && watermark.text && (
            <div
              className="absolute select-none pointer-events-none font-medium"
              style={{
                ...(watermark.position.includes("top") ? { top: "12px" } : { bottom: "12px" }),
                ...(watermark.position.includes("left") ? { left: "12px" } : { right: "12px" }),
                fontSize: `${watermark.fontSize}px`,
                color: watermark.color,
                opacity: watermark.opacity / 100,
                textShadow: "1px 1px 3px rgba(0,0,0,0.6)",
              }}
            >
              {watermark.text}
            </div>
          )}
        </div>
      </div>

      {/* Playback controls */}
      <div className="flex items-center gap-3 mt-3 px-1">
        {/* Play/Pause button */}
        <button
          onClick={togglePlay}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/5"
        >
          {isPlaying ? (
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Time display */}
        <span className="text-zinc-500 text-xs font-mono min-w-[85px]">
          <span className="text-zinc-300">{formatTime(currentTime)}</span> / {formatTime(duration)}
        </span>

        {/* Progress bar */}
        <div
          className="flex-1 h-1.5 bg-white/5 rounded-full cursor-pointer relative group/progress"
          onClick={(e) => {
            if (!videoRef.current) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percent = clickX / rect.width;
            videoRef.current.currentTime = percent * duration;
          }}
        >
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all relative"
            style={{
              width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%",
            }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Speed selector */}
        <div className="relative">
          <button
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-400 hover:text-white transition-all border border-white/5"
          >
            {playbackSpeed}x
          </button>
          {showSpeedMenu && (
            <div className="absolute bottom-full mb-1 right-0 bg-zinc-900 border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
              {SPEED_OPTIONS.map((speed) => (
                <button
                  key={speed}
                  onClick={() => {
                    onPlaybackSpeedChange(speed);
                    setShowSpeedMenu(false);
                  }}
                  className={`block w-full text-left px-3 py-1.5 text-xs transition-colors ${
                    playbackSpeed === speed
                      ? "bg-blue-600 text-white"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Volume / mute controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onAudioChange({ ...audio, muted: !audio.muted })}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            {audio.muted || audio.volume === 0 ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
              </svg>
            )}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={audio.muted ? 0 : Math.round(audio.volume * 100)}
            onChange={(e) => {
              const vol = parseInt(e.target.value) / 100;
              onAudioChange({ ...audio, volume: vol, muted: vol === 0 });
            }}
            className="w-16 h-1"
          />
          <span className="text-zinc-600 text-[10px] font-mono w-7">
            {audio.muted ? "0" : Math.round(audio.volume * 100)}%
          </span>
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="flex gap-3 mt-2.5 px-1 flex-wrap">
        {[
          { key: "Space", label: "Play" },
          { key: "← →", label: "Seek" },
          { key: "↑ ↓", label: "Volume" },
          { key: "F", label: "Fullscreen" },
          { key: "M", label: "Mute" },
        ].map((shortcut) => (
          <div key={shortcut.key} className="flex items-center gap-1">
            <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-500 font-mono">
              {shortcut.key}
            </kbd>
            <span className="text-zinc-600 text-[10px]">{shortcut.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
