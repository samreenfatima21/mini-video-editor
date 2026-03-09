"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import type { TimelineClip } from "@/types/editor";
import { getEffectiveDuration } from "@/types/editor";

interface TimelineProps {
  clips: TimelineClip[];
  selectedClipId: string | null;
  onSelectClip: (clipId: string) => void;
  currentTime: number;
  totalDuration: number;
  onSeek: (time: number) => void;
  clipThumbnails: Record<string, string[]>;
  onTransitionClick?: (clipId: string) => void;
  onReorderClips?: (fromIndex: number, toIndex: number) => void;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
}

export default function Timeline({
  clips,
  selectedClipId,
  onSelectClip,
  currentTime,
  totalDuration,
  onSeek,
  clipThumbnails,
  onTransitionClick,
  onReorderClips,
  zoom = 1,
  onZoomChange,
}: TimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Auto-scroll to keep playhead visible
  useEffect(() => {
    if (!scrollContainerRef.current || totalDuration === 0 || zoom <= 1) return;
    const container = scrollContainerRef.current;
    const playheadPos = (currentTime / totalDuration) * container.scrollWidth;
    const viewStart = container.scrollLeft;
    const viewEnd = viewStart + container.clientWidth;
    if (playheadPos < viewStart + 40 || playheadPos > viewEnd - 40) {
      container.scrollLeft = playheadPos - container.clientWidth / 2;
    }
  }, [currentTime, totalDuration, zoom]);

  // Ctrl/Cmd + scroll wheel to zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if ((e.metaKey || e.ctrlKey) && onZoomChange) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 1 : -1;
      onZoomChange(Math.max(1, Math.min(10, zoom + delta)));
    }
  }, [zoom, onZoomChange]);

  const handleTrackClick = (e: React.MouseEvent) => {
    if (!timelineRef.current || totalDuration === 0) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const scrollOffset = scrollContainerRef.current?.scrollLeft ?? 0;
    const clickX = e.clientX - rect.left + scrollOffset;
    const percent = clickX / (rect.width * zoom);
    onSeek(Math.max(0, Math.min(totalDuration, percent * totalDuration)));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const playheadPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== toIndex && onReorderClips) {
      onReorderClips(dragIndex, toIndex);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  if (clips.length === 0) return null;

  return (
    <div className="w-full h-full flex flex-col" onWheel={handleWheel}>
      {/* Clip blocks track — scrollable when zoomed */}
      <div
        ref={scrollContainerRef}
        className="relative flex-1 rounded overflow-x-auto overflow-y-hidden"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}
      >
        <div
          ref={timelineRef}
          className="relative h-full flex items-stretch cursor-pointer"
          style={{ width: `${zoom * 100}%`, minWidth: '100%' }}
          onClick={handleTrackClick}
        >
        {clips.map((clip, i) => {
          const dur = getEffectiveDuration(clip);
          const widthPercent = totalDuration > 0 ? (dur / totalDuration) * 100 : 100 / clips.length;
          const isSelected = clip.id === selectedClipId;
          const thumbnails = clipThumbnails[clip.id] || [];

          return (
            <div key={clip.id} className="flex items-stretch" style={{ width: `${widthPercent}%` }}>
              {/* Transition indicator between clips */}
              {i > 0 && clip.transition && clip.transition.type !== "none" && (
                <div
                  className="flex items-center justify-center flex-shrink-0 cursor-pointer z-10"
                  style={{ width: '20px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTransitionClick?.(clip.id);
                  }}
                  title={`${clip.transition.type} (${clip.transition.duration}s)`}
                >
                  <div
                    className="w-4 h-4 rotate-45 rounded-sm"
                    style={{ background: 'var(--accent)', opacity: 0.8 }}
                  />
                </div>
              )}

              {/* Clip block */}
              <div
                className="flex-1 relative overflow-hidden rounded-sm transition-all"
                draggable={!!onReorderClips}
                onDragStart={(e) => handleDragStart(e, i)}
                onDragOver={handleDragOver}
                onDragEnter={() => setDragOverIndex(i)}
                onDragLeave={() => { if (dragOverIndex === i) setDragOverIndex(null); }}
                onDrop={(e) => handleDrop(e, i)}
                onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                style={{
                  background: isSelected ? 'var(--accent-bg)' : 'rgba(255,255,255,0.05)',
                  border: isSelected
                    ? '2px solid var(--accent)'
                    : dragOverIndex === i
                    ? '2px solid var(--accent-hover)'
                    : '2px solid transparent',
                  opacity: dragIndex === i ? 0.4 : 1,
                  margin: '0 1px',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectClip(clip.id);
                }}
              >
                {/* Thumbnails */}
                {thumbnails.length > 0 && (
                  <div className="absolute inset-0 flex opacity-50">
                    {thumbnails.map((thumb, ti) => (
                      <div
                        key={ti}
                        className="flex-1 bg-cover bg-center"
                        style={{ backgroundImage: `url(${thumb})` }}
                      />
                    ))}
                  </div>
                )}

                {/* Clip label */}
                <div className="absolute bottom-0 left-0 right-0 px-1.5 py-0.5"
                  style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.6))' }}>
                  <span className="text-[9px] text-white truncate block">{clip.video.name}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Playhead */}
        <div
          className="absolute top-0 h-full w-0.5 z-20 pointer-events-none"
          style={{
            left: `${playheadPercent}%`,
            background: 'var(--text-primary)',
            boxShadow: '0 0 6px rgba(255,255,255,0.3)',
          }}
        >
          <div
            className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-sm rotate-45"
            style={{ background: 'var(--text-primary)' }}
          />
        </div>
        </div>{/* end inner zoomed track */}
      </div>{/* end scroll container */}

      {/* Time markers */}
      <div className="relative w-full h-3.5 mt-0.5 flex-shrink-0 overflow-hidden">
        {totalDuration > 0 && (() => {
          const effectiveDuration = totalDuration / zoom;
          let interval = 1;
          if (effectiveDuration > 30) interval = 5;
          if (effectiveDuration > 120) interval = 10;
          if (effectiveDuration > 300) interval = 30;
          if (zoom >= 4) interval = Math.max(0.5, interval / zoom);
          const markers = [];
          for (let t = 0; t <= totalDuration; t += interval) markers.push(t);
          return markers.map((t) => (
            <div
              key={t}
              className="absolute text-[8px] font-mono"
              style={{
                left: `${(t / totalDuration) * 100}%`,
                transform: "translateX(-50%)",
                color: 'var(--text-muted)',
              }}
            >
              {formatTime(t)}
            </div>
          ));
        })()}
      </div>
    </div>
  );
}
