"use client";

import { useRef } from "react";
import type { AudioSettings } from "@/types/editor";

interface BottomTimelineProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  audio: AudioSettings;
  onAudioChange: (audio: AudioSettings) => void;
  onAddClip?: (file: File) => void;
  clipCount?: number;
  children?: React.ReactNode;
}

export default function BottomTimeline({
  isPlaying,
  onTogglePlay,
  currentTime,
  duration,
  onSeek,
  audio,
  onAudioChange,
  onAddClip,
  clipCount = 0,
  children,
}: BottomTimelineProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="timeline-region flex flex-col">
      {/* Top control bar — 32px */}
      <div
        className="flex items-center gap-3 px-3 h-8 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        {/* Play/Pause */}
        <button
          onClick={onTogglePlay}
          className="w-6 h-6 flex items-center justify-center rounded transition-all"
          style={{ color: 'var(--text-primary)' }}
        >
          {isPlaying ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Skip backward */}
        <button
          onClick={() => onSeek(Math.max(0, currentTime - 5))}
          className="w-5 h-5 flex items-center justify-center transition-all"
          style={{ color: 'var(--text-secondary)' }}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.062a1.125 1.125 0 0 1 0-1.953l7.108-4.062A1.125 1.125 0 0 1 21 8.688v8.123ZM11.25 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.062a1.125 1.125 0 0 1 0-1.953l7.108-4.062a1.125 1.125 0 0 1 1.683.977v8.123Z" />
          </svg>
        </button>

        {/* Skip forward */}
        <button
          onClick={() => onSeek(Math.min(duration, currentTime + 5))}
          className="w-5 h-5 flex items-center justify-center transition-all"
          style={{ color: 'var(--text-secondary)' }}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.062a1.125 1.125 0 0 1 0 1.953l-7.108 4.062A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.062a1.125 1.125 0 0 1 0 1.953l-7.108 4.062a1.125 1.125 0 0 1-1.683-.977V8.69Z" />
          </svg>
        </button>

        {/* Time */}
        <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--text-primary)' }}>{formatTime(currentTime)}</span>
          {' / '}
          {formatTime(duration)}
        </span>

        <div className="flex-1" />

        {/* Add clip button */}
        {onAddClip && clipCount < 10 && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onAddClip(file);
                e.target.value = "";
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
              title="Add clip to timeline"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Clip
            </button>
          </>
        )}

        {/* Volume */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onAudioChange({ ...audio, muted: !audio.muted })}
            style={{ color: 'var(--text-secondary)' }}
          >
            {audio.muted || audio.volume === 0 ? (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
        </div>
      </div>

      {/* Bottom: Timeline track area */}
      <div className="flex-1 overflow-hidden px-2 py-1">
        {children}
      </div>
    </div>
  );
}
