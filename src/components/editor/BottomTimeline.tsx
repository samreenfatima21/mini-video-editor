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
  onDuplicateClip?: () => void;
  onSplitClip?: () => void;
  onStepBackward?: () => void;
  onStepForward?: () => void;
  clipCount?: number;
  hasSelectedClip?: boolean;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
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
  onDuplicateClip,
  onSplitClip,
  onStepBackward,
  onStepForward,
  clipCount = 0,
  hasSelectedClip = false,
  zoom = 1,
  onZoomChange,
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

        {/* Frame step backward */}
        {onStepBackward && (
          <button
            onClick={onStepBackward}
            className="w-5 h-5 flex items-center justify-center transition-all"
            style={{ color: 'var(--text-secondary)' }}
            title="Previous frame (,)"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
        )}

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

        {/* Frame step forward */}
        {onStepForward && (
          <button
            onClick={onStepForward}
            className="w-5 h-5 flex items-center justify-center transition-all"
            style={{ color: 'var(--text-secondary)' }}
            title="Next frame (.)"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        )}

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

        {/* Split clip */}
        {onSplitClip && (
          <button
            onClick={onSplitClip}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
            title="Split at playhead (S)"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m7.848 8.25 1.536.887M7.848 8.25a3 3 0 1 1-5.196-3 3 3 0 0 1 5.196 3Zm1.536.887a2.165 2.165 0 0 1 1.083 1.839c.005.351.054.695.14 1.024M9.384 9.137l2.077 1.199M7.848 15.75l1.536-.887m-1.536.887a3 3 0 1 1-5.196 3 3 3 0 0 1 5.196-3Zm1.536-.887a2.165 2.165 0 0 0 1.083-1.838c.005-.352.054-.695.14-1.025m-1.223 2.863 2.077-1.199m0-3.328a4.323 4.323 0 0 1 2.068-1.379l5.325-1.628a4.5 4.5 0 0 1 2.48-.044l.803.215-7.794 4.5m-2.882-1.664A4.331 4.331 0 0 0 10.607 12m3.736 0 7.794 4.5-.802.215a4.5 4.5 0 0 1-2.48-.043l-5.326-1.629a4.324 4.324 0 0 1-2.068-1.379M14.343 12l-2.882 1.664" />
            </svg>
            Split
          </button>
        )}

        {/* Duplicate clip */}
        {onDuplicateClip && hasSelectedClip && (
          <button
            onClick={onDuplicateClip}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
            title="Duplicate clip (Ctrl+D)"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
            </svg>
            Dupe
          </button>
        )}

        {/* Timeline zoom */}
        {onZoomChange && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onZoomChange(Math.max(1, zoom - 1))}
              disabled={zoom <= 1}
              className="w-5 h-5 flex items-center justify-center rounded transition-all"
              style={{ color: zoom <= 1 ? 'var(--text-muted)' : 'var(--text-secondary)', opacity: zoom <= 1 ? 0.4 : 1 }}
              title="Zoom out (Ctrl+-)"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
              </svg>
            </button>
            <span className="text-[10px] font-mono min-w-[28px] text-center" style={{ color: 'var(--text-muted)' }}>
              {zoom}x
            </span>
            <button
              onClick={() => onZoomChange(Math.min(10, zoom + 1))}
              disabled={zoom >= 10}
              className="w-5 h-5 flex items-center justify-center rounded transition-all"
              style={{ color: zoom >= 10 ? 'var(--text-muted)' : 'var(--text-secondary)', opacity: zoom >= 10 ? 0.4 : 1 }}
              title="Zoom in (Ctrl++)"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          </div>
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
