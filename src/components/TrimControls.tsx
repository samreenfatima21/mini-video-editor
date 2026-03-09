"use client";

import { useState, useCallback } from "react";
import { getFFmpeg } from "@/lib/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

interface TrimControlsProps {
  videoFile: File;
  duration: number;
  trimStart: number;
  trimEnd: number;
  onTrimChange: (start: number, end: number) => void;
  onTrimComplete: (trimmedFile: File) => void;
  isProcessing: boolean;
  onProcessingChange: (processing: boolean) => void;
}

export default function TrimControls({
  videoFile,
  duration,
  trimStart,
  trimEnd,
  onTrimChange,
  onTrimComplete,
  isProcessing,
  onProcessingChange,
}: TrimControlsProps) {
  const [statusMessage, setStatusMessage] = useState("");

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms}`;
  };

  const handleTrim = useCallback(async () => {
    if (trimStart >= trimEnd) return;

    onProcessingChange(true);
    setStatusMessage("Loading FFmpeg...");

    try {
      const ffmpeg = await getFFmpeg();
      setStatusMessage("Reading video...");
      const inputData = await fetchFile(videoFile);
      await ffmpeg.writeFile("input.mp4", inputData);

      setStatusMessage(`Trimming ${formatTime(trimStart)} → ${formatTime(trimEnd)}...`);
      await ffmpeg.exec([
        "-i", "input.mp4",
        "-ss", trimStart.toString(),
        "-to", trimEnd.toString(),
        "-c:v", "libx264",
        "-c:a", "aac",
        "-strict", "experimental",
        "output.mp4",
      ]);

      setStatusMessage("Saving trimmed video...");
      const outputData = await ffmpeg.readFile("output.mp4");
      const trimmedBlob = new Blob([new Uint8Array(outputData as Uint8Array)], { type: "video/mp4" });
      const trimmedFile = new File([trimmedBlob], `trimmed_${videoFile.name}`, { type: "video/mp4" });

      await ffmpeg.deleteFile("input.mp4");
      await ffmpeg.deleteFile("output.mp4");

      onTrimComplete(trimmedFile);
      setStatusMessage("Trim complete!");
    } catch (error) {
      console.error("Trim failed:", error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      setStatusMessage(`Trim failed: ${errorMsg}`);
    } finally {
      onProcessingChange(false);
    }
  }, [videoFile, trimStart, trimEnd, onTrimComplete, onProcessingChange]);

  return (
    <div className="w-full">
      <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Trim Video</h3>

      {/* Start */}
      <div className="mb-3">
        <div className="flex justify-between text-[11px] mb-1">
          <span style={{ color: 'var(--text-muted)' }}>Start</span>
          <span className="font-mono" style={{ color: 'var(--accent)' }}>{formatTime(trimStart)}</span>
        </div>
        <input
          type="range" min={0} max={duration} step={0.1}
          value={trimStart}
          onChange={(e) => {
            const newStart = parseFloat(e.target.value);
            onTrimChange(Math.min(newStart, trimEnd - 0.1), trimEnd);
          }}
          className="w-full" disabled={isProcessing}
        />
      </div>

      {/* End */}
      <div className="mb-3">
        <div className="flex justify-between text-[11px] mb-1">
          <span style={{ color: 'var(--text-muted)' }}>End</span>
          <span className="font-mono" style={{ color: 'var(--accent)' }}>{formatTime(trimEnd)}</span>
        </div>
        <input
          type="range" min={0} max={duration} step={0.1}
          value={trimEnd}
          onChange={(e) => {
            const newEnd = parseFloat(e.target.value);
            onTrimChange(trimStart, Math.max(newEnd, trimStart + 0.1));
          }}
          className="w-full" disabled={isProcessing}
        />
      </div>

      {/* Clip length */}
      <div
        className="flex items-center justify-between mb-3 px-3 py-2 rounded-lg"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
      >
        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Clip length</span>
        <span className="text-[11px] font-mono" style={{ color: 'var(--text-primary)' }}>{formatTime(trimEnd - trimStart)}</span>
      </div>

      {/* Trim button */}
      <button
        onClick={handleTrim}
        disabled={isProcessing || trimStart >= trimEnd}
        className="w-full py-2 rounded-lg text-sm font-medium transition-all"
        style={{
          background: isProcessing || trimStart >= trimEnd ? 'var(--bg-elevated)' : 'var(--accent)',
          color: isProcessing || trimStart >= trimEnd ? 'var(--text-muted)' : 'white',
          cursor: isProcessing || trimStart >= trimEnd ? 'not-allowed' : 'pointer',
        }}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {statusMessage}
          </span>
        ) : "Trim Video"}
      </button>

      {!isProcessing && statusMessage && (
        <p className="text-[11px] text-center mt-2" style={{ color: 'var(--accent-success)' }}>
          {statusMessage}
        </p>
      )}
    </div>
  );
}
