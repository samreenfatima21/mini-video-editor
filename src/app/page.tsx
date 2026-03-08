"use client";

// Main page — V2 with undo/redo, better layout, and keyboard shortcuts.

import { useState, useRef, useCallback, useEffect } from "react";
import { useVideoEditor } from "@/hooks/useVideoEditor";
import { useUndoRedo } from "@/hooks/useUndoRedo";
import VideoUploader from "@/components/VideoUploader";
import VideoPlayer from "@/components/VideoPlayer";
import Timeline from "@/components/Timeline";
import TrimControls from "@/components/TrimControls";
import FilterPanel from "@/components/FilterPanel";
import TextOverlayPanel from "@/components/TextOverlay";
import ExportButton from "@/components/ExportButton";
import type { FilterSettings, TextOverlay } from "@/types/editor";

// State shape for undo/redo (only tracks user-editable settings)
interface EditState {
  filters: FilterSettings;
  textOverlays: TextOverlay[];
}

export default function Home() {
  const { state, setVideo, removeVideo, setTrim, setFilters, setProcessing, setTextOverlays } =
    useVideoEditor();

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const videoElRef = useRef<HTMLVideoElement | null>(null);

  // Undo/redo for filters and text overlays
  const { pushState, undo, redo, canUndo, canRedo } = useUndoRedo<EditState>();

  // Track filter changes for undo
  const handleFiltersChange = useCallback(
    (filters: FilterSettings) => {
      pushState({ filters: state.filters, textOverlays: state.textOverlays });
      setFilters(filters);
    },
    [pushState, setFilters, state.filters, state.textOverlays]
  );

  // Track text overlay changes for undo
  const handleTextOverlaysChange = useCallback(
    (overlays: TextOverlay[]) => {
      pushState({ filters: state.filters, textOverlays: state.textOverlays });
      setTextOverlays(overlays);
    },
    [pushState, setTextOverlays, state.filters, state.textOverlays]
  );

  // Handle undo/redo keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        if (e.shiftKey) {
          e.preventDefault();
          const redoState = redo();
          if (redoState) {
            setFilters(redoState.filters);
            setTextOverlays(redoState.textOverlays);
          }
        } else {
          e.preventDefault();
          const undoState = undo();
          if (undoState) {
            setFilters(undoState.filters);
            setTextOverlays(undoState.textOverlays);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, setFilters, setTextOverlays]);

  const handleTrimComplete = (trimmedFile: File) => {
    setVideo(trimmedFile);
  };

  const handleSeek = useCallback((time: number) => {
    if (videoElRef.current) {
      videoElRef.current.currentTime = time;
    }
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-white">
              Mini Video Editor
            </h1>
            <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full font-medium">
              V2
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Undo/Redo buttons */}
            {state.video && (
              <>
                <button
                  onClick={() => {
                    const undoState = undo();
                    if (undoState) {
                      setFilters(undoState.filters);
                      setTextOverlays(undoState.textOverlays);
                    }
                  }}
                  disabled={!canUndo}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    canUndo
                      ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                      : "bg-zinc-900 text-zinc-700 cursor-not-allowed"
                  }`}
                  title="Undo (Ctrl+Z)"
                >
                  ↩ Undo
                </button>
                <button
                  onClick={() => {
                    const redoState = redo();
                    if (redoState) {
                      setFilters(redoState.filters);
                      setTextOverlays(redoState.textOverlays);
                    }
                  }}
                  disabled={!canRedo}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    canRedo
                      ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                      : "bg-zinc-900 text-zinc-700 cursor-not-allowed"
                  }`}
                  title="Redo (Ctrl+Shift+Z)"
                >
                  Redo ↪
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {!state.video ? (
          <div className="max-w-2xl mx-auto">
            <VideoUploader onVideoSelect={setVideo} />
            <p className="text-zinc-600 text-center text-sm mt-4">
              Upload a short video clip to get started
            </p>

            {/* Feature highlights for V2 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
              {[
                { icon: "🎬", label: "Filter Presets" },
                { icon: "⌨️", label: "Keyboard Shortcuts" },
                { icon: "↩️", label: "Undo / Redo" },
                { icon: "✂️", label: "Trim & Export" },
              ].map((feature) => (
                <div
                  key={feature.label}
                  className="bg-zinc-900 rounded-xl p-4 text-center border border-zinc-800"
                >
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <div className="text-zinc-400 text-xs">{feature.label}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <VideoPlayer
              videoUrl={state.video.url}
              videoName={state.video.name}
              filters={state.filters}
              textOverlays={state.textOverlays}
              onRemoveVideo={removeVideo}
              onVideoRef={(el) => {
                videoElRef.current = el;
              }}
              onTimeUpdate={(time) => setCurrentTime(time)}
              onLoadedMetadata={(dur) => {
                setDuration(dur);
                if (state.trim.end === 0) {
                  setTrim(0, dur);
                }
              }}
            />

            {/* Timeline */}
            {duration > 0 && (
              <Timeline
                currentTime={currentTime}
                duration={duration}
                trimStart={state.trim.start}
                trimEnd={state.trim.end}
                onSeek={handleSeek}
              />
            )}

            {/* Editing tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {duration > 0 && (
                <TrimControls
                  videoFile={state.video.file}
                  duration={duration}
                  trimStart={state.trim.start}
                  trimEnd={state.trim.end}
                  onTrimChange={setTrim}
                  onTrimComplete={handleTrimComplete}
                  isProcessing={state.isProcessing}
                  onProcessingChange={setProcessing}
                />
              )}

              <FilterPanel
                filters={state.filters}
                onFiltersChange={handleFiltersChange}
              />
            </div>

            {/* Text overlay controls */}
            <TextOverlayPanel
              overlays={state.textOverlays}
              onOverlaysChange={handleTextOverlaysChange}
            />

            {/* Export button */}
            <ExportButton
              videoFile={state.video.file}
              filters={state.filters}
              textOverlays={state.textOverlays}
              isProcessing={state.isProcessing}
              onProcessingChange={setProcessing}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-4 mt-12">
        <div className="max-w-5xl mx-auto text-center text-zinc-600 text-xs">
          Built with Claude Code — Phase 3 Capstone Project
        </div>
      </footer>
    </div>
  );
}
