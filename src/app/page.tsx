"use client";

// This is the main page of our video editor.
// It's "use client" because it uses React state (interactive).
//
// Flow: Upload → Player + Timeline → Trim/Filters/Text → Export

import { useState, useRef, useCallback } from "react";
import { useVideoEditor } from "@/hooks/useVideoEditor";
import VideoUploader from "@/components/VideoUploader";
import VideoPlayer from "@/components/VideoPlayer";
import Timeline from "@/components/Timeline";
import TrimControls from "@/components/TrimControls";
import FilterPanel from "@/components/FilterPanel";
import TextOverlayPanel from "@/components/TextOverlay";
import ExportButton from "@/components/ExportButton";

export default function Home() {
  const { state, setVideo, removeVideo, setTrim, setFilters, setProcessing, setTextOverlays } =
    useVideoEditor();

  // Track video duration and current playback time
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Reference to the video element so Timeline can seek it
  const videoElRef = useRef<HTMLVideoElement | null>(null);

  // When trimming is complete, replace the current video with the trimmed one
  const handleTrimComplete = (trimmedFile: File) => {
    setVideo(trimmedFile);
  };

  // When user clicks the timeline, jump the video to that time
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
          <h1 className="text-xl font-semibold text-white">
            Mini Video Editor
          </h1>
          <span className="text-zinc-500 text-sm">
            All Features Active
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {!state.video ? (
          // No video yet — show the uploader
          <div className="max-w-2xl mx-auto">
            <VideoUploader onVideoSelect={setVideo} />
            <p className="text-zinc-600 text-center text-sm mt-4">
              Upload a short video clip to get started
            </p>
          </div>
        ) : (
          // Video loaded — show player + editing tools
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
                // Set default trim to full video length
                if (state.trim.end === 0) {
                  setTrim(0, dur);
                }
              }}
            />

            {/* Timeline — shows playhead position and trim region */}
            {duration > 0 && (
              <Timeline
                currentTime={currentTime}
                duration={duration}
                trimStart={state.trim.start}
                trimEnd={state.trim.end}
                onSeek={handleSeek}
              />
            )}

            {/* Editing tools side by side on larger screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Trim controls */}
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

              {/* Filter controls */}
              <FilterPanel
                filters={state.filters}
                onFiltersChange={setFilters}
              />
            </div>

            {/* Text overlay controls */}
            <TextOverlayPanel
              overlays={state.textOverlays}
              onOverlaysChange={setTextOverlays}
            />

            {/* Export button — the final step */}
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
    </div>
  );
}
