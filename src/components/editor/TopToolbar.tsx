"use client";

import { useState, useRef, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import type { PlaybackSpeed, AudioSettings } from "@/types/editor";

const SPEED_OPTIONS: PlaybackSpeed[] = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

interface TopToolbarProps {
  hasVideo: boolean;
  projectName: string;
  onProjectNameChange: (name: string) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackSpeed: PlaybackSpeed;
  onPlaybackSpeedChange: (speed: PlaybackSpeed) => void;
  currentTime: number;
  duration: number;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  showOriginal: boolean;
  onToggleOriginal: () => void;
  theme: string;
  onToggleTheme: () => void;
  onShowShortcuts: () => void;
  isProcessing: boolean;
  onExport: () => void;
  onSaveProject?: () => void;
  onLoadProject?: () => void;
  audio: AudioSettings;
  onAudioChange: (audio: AudioSettings) => void;
  onRemoveVideo: () => void;
}

export default function TopToolbar({
  hasVideo,
  projectName,
  onProjectNameChange,
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onPlaybackSpeedChange,
  currentTime,
  duration,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  showOriginal,
  onToggleOriginal,
  theme,
  onToggleTheme,
  onShowShortcuts,
  isProcessing,
  onExport,
  onSaveProject,
  onLoadProject,
  onRemoveVideo,
}: TopToolbarProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="toolbar-region flex items-center justify-between px-3 h-12">
      {/* Left: Logo + Project name */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 via-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
          </svg>
        </div>
        <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
          Frame<span style={{ color: 'var(--accent)' }}>Cut</span>
        </span>

        {hasVideo && (
          <>
            <div className="w-px h-5" style={{ background: 'var(--border-subtle)' }} />
            {isEditingName ? (
              <input
                ref={nameInputRef}
                type="text"
                value={projectName}
                onChange={(e) => onProjectNameChange(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => { if (e.key === "Enter") setIsEditingName(false); }}
                className="text-xs px-2 py-1 rounded-md border outline-none w-36"
                style={{
                  background: 'var(--bg-elevated)',
                  borderColor: 'var(--accent)',
                  color: 'var(--text-primary)',
                }}
              />
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors truncate max-w-[160px]"
                style={{ color: 'var(--text-secondary)' }}
              >
                {projectName}
                <svg className="w-2.5 h-2.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
              </button>
            )}
          </>
        )}
      </div>

      {/* Center: Playback controls */}
      {hasVideo && (
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
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

          {/* Speed */}
          <div className="relative">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="px-2 py-1 rounded-md text-[11px] font-mono transition-all"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
            >
              {playbackSpeed}x
            </button>
            {showSpeedMenu && (
              <div
                className="absolute top-full mt-1 left-0 rounded-lg shadow-xl overflow-hidden z-50"
                style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-active)' }}
              >
                {SPEED_OPTIONS.map((speed) => (
                  <button
                    key={speed}
                    onClick={() => { onPlaybackSpeedChange(speed); setShowSpeedMenu(false); }}
                    className="block w-full text-left px-3 py-1.5 text-xs transition-colors"
                    style={{
                      background: playbackSpeed === speed ? 'var(--accent)' : 'transparent',
                      color: playbackSpeed === speed ? 'white' : 'var(--text-secondary)',
                    }}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Time display */}
          <span className="text-[11px] font-mono min-w-[80px]" style={{ color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--text-primary)' }}>{formatTime(currentTime)}</span>
            {' / '}
            {formatTime(duration)}
          </span>
        </div>
      )}

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {hasVideo && (
          <>
            {/* Undo */}
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="p-1.5 rounded-md transition-all"
              style={{
                color: canUndo ? 'var(--text-secondary)' : 'var(--text-muted)',
                opacity: canUndo ? 1 : 0.4,
              }}
              title="Undo (Ctrl+Z)"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
              </svg>
            </button>

            {/* Redo */}
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="p-1.5 rounded-md transition-all"
              style={{
                color: canRedo ? 'var(--text-secondary)' : 'var(--text-muted)',
                opacity: canRedo ? 1 : 0.4,
              }}
              title="Redo (Ctrl+Shift+Z)"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" />
              </svg>
            </button>

            <div className="w-px h-4" style={{ background: 'var(--border-subtle)' }} />

            {/* Before/After */}
            <button
              onClick={onToggleOriginal}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] transition-all"
              style={{
                background: showOriginal ? 'rgba(245,166,35,0.15)' : 'var(--bg-elevated)',
                color: showOriginal ? '#f5a623' : 'var(--text-muted)',
                border: showOriginal ? '1px solid rgba(245,166,35,0.3)' : '1px solid transparent',
              }}
              title="Toggle original/edited"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              {showOriginal ? "OG" : "Edit"}
            </button>

            {/* Remove video */}
            <button
              onClick={onRemoveVideo}
              className="p-1.5 rounded-md transition-all hover:opacity-80"
              style={{ color: 'var(--text-muted)' }}
              title="Remove video"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="w-px h-4" style={{ background: 'var(--border-subtle)' }} />
          </>
        )}

        {/* User button */}
        <UserButton
          appearance={{
            elements: {
              avatarBox: {
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                boxShadow: "0 0 0 2px rgba(124,92,252,0.3)",
              },
            },
          }}
        />

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-md transition-all"
          style={{ color: 'var(--text-secondary)' }}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
            </svg>
          )}
        </button>

        {/* Shortcuts */}
        <button
          onClick={onShowShortcuts}
          className="p-1.5 rounded-md transition-all"
          style={{ color: 'var(--text-secondary)' }}
          title="Keyboard shortcuts (?)"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </button>

        {/* Save/Load */}
        {hasVideo && onSaveProject && (
          <button
            onClick={onSaveProject}
            className="p-1.5 rounded-md transition-all"
            style={{ color: 'var(--text-secondary)' }}
            title="Save project (Ctrl+S)"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </button>
        )}
        {hasVideo && onLoadProject && (
          <button
            onClick={onLoadProject}
            className="p-1.5 rounded-md transition-all"
            style={{ color: 'var(--text-secondary)' }}
            title="Load project"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
            </svg>
          </button>
        )}

        {hasVideo && (onSaveProject || onLoadProject) && (
          <div className="w-px h-4" style={{ background: 'var(--border-subtle)' }} />
        )}

        {/* Export button */}
        {hasVideo && (
          <button
            onClick={onExport}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ml-1"
            style={{
              background: isProcessing ? 'var(--bg-elevated)' : 'var(--accent-success)',
              color: isProcessing ? 'var(--text-muted)' : 'white',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
            }}
          >
            {isProcessing ? (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            )}
            Export
          </button>
        )}
      </div>
    </div>
  );
}
