"use client";

// TrimControls — lets users pick a START and END point to cut a clip.
// This is where FFmpeg does real work for the first time!
//
// How it works:
// 1. User moves two sliders to pick start & end times
// 2. User clicks "Trim Video"
// 3. FFmpeg reads the original video, cuts it, and creates a new trimmed file
// 4. The trimmed video replaces the original in the player

import { useState, useCallback } from "react";
import { getFFmpeg } from "@/lib/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

interface TrimControlsProps {
  // The original video file the user uploaded
  videoFile: File;
  // Total length of the video in seconds
  duration: number;
  // Current trim start/end values
  trimStart: number;
  trimEnd: number;
  // Functions to update state
  onTrimChange: (start: number, end: number) => void;
  onTrimComplete: (trimmedFile: File) => void;
  // Is FFmpeg currently working?
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
  // Progress message shown while FFmpeg is working
  const [statusMessage, setStatusMessage] = useState("");

  // Format seconds into MM:SS.ms display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms}`;
  };

  // This is the main function — it uses FFmpeg to actually trim the video
  const handleTrim = useCallback(async () => {
    if (trimStart >= trimEnd) return;

    onProcessingChange(true);
    setStatusMessage("Loading FFmpeg...");

    try {
      // Step 1: Get FFmpeg ready (loads ~30MB on first use, then cached)
      const ffmpeg = await getFFmpeg();

      // Step 2: Write the user's video file into FFmpeg's virtual file system
      // (FFmpeg.wasm has its own "fake" filesystem in the browser)
      setStatusMessage("Reading video...");
      const inputData = await fetchFile(videoFile);
      await ffmpeg.writeFile("input.mp4", inputData);

      // Step 3: Run the FFmpeg trim command
      // -ss = start time, -to = end time
      // We re-encode the video to handle all formats (MOV, MP4, WebM, etc.)
      setStatusMessage(
        `Trimming ${formatTime(trimStart)} → ${formatTime(trimEnd)}...`
      );
      await ffmpeg.exec([
        "-i", "input.mp4",
        "-ss", trimStart.toString(),
        "-to", trimEnd.toString(),
        "-c:v", "libx264",
        "-c:a", "aac",
        "-strict", "experimental",
        "output.mp4",
      ]);

      // Step 4: Read the trimmed video out of FFmpeg's filesystem
      setStatusMessage("Saving trimmed video...");
      const outputData = await ffmpeg.readFile("output.mp4");

      // Step 5: Convert it back into a File object the browser can use
      // We cast to Uint8Array because FFmpeg returns FileData type
      const trimmedBlob = new Blob([new Uint8Array(outputData as Uint8Array)], { type: "video/mp4" });
      const trimmedFile = new File([trimmedBlob], `trimmed_${videoFile.name}`, {
        type: "video/mp4",
      });

      // Step 6: Clean up FFmpeg's filesystem
      await ffmpeg.deleteFile("input.mp4");
      await ffmpeg.deleteFile("output.mp4");

      // Done! Send the trimmed file back to the parent
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
    <div className="w-full bg-zinc-900 rounded-xl p-5 mt-6">
      <h3 className="text-white font-medium mb-4">Trim Video</h3>

      {/* Start time slider */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-zinc-400">Start</span>
          <span className="text-blue-400 font-mono">{formatTime(trimStart)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={duration}
          step={0.1}
          value={trimStart}
          onChange={(e) => {
            const newStart = parseFloat(e.target.value);
            // Don't let start go past end
            onTrimChange(Math.min(newStart, trimEnd - 0.1), trimEnd);
          }}
          className="w-full accent-blue-500"
          disabled={isProcessing}
        />
      </div>

      {/* End time slider */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-zinc-400">End</span>
          <span className="text-blue-400 font-mono">{formatTime(trimEnd)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={duration}
          step={0.1}
          value={trimEnd}
          onChange={(e) => {
            const newEnd = parseFloat(e.target.value);
            // Don't let end go before start
            onTrimChange(trimStart, Math.max(newEnd, trimStart + 0.1));
          }}
          className="w-full accent-blue-500"
          disabled={isProcessing}
        />
      </div>

      {/* Duration preview */}
      <p className="text-zinc-500 text-sm mb-4">
        Clip length: <span className="text-zinc-300">{formatTime(trimEnd - trimStart)}</span>
      </p>

      {/* Trim button */}
      <button
        onClick={handleTrim}
        disabled={isProcessing || trimStart >= trimEnd}
        className={`
          w-full py-3 rounded-lg font-medium transition-all
          ${
            isProcessing || trimStart >= trimEnd
              ? "bg-zinc-700 text-zinc-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
          }
        `}
      >
        {isProcessing ? statusMessage : "Trim Video"}
      </button>

      {/* Status message (shown after trim completes) */}
      {!isProcessing && statusMessage && (
        <p className="text-green-400 text-sm text-center mt-2">
          {statusMessage}
        </p>
      )}
    </div>
  );
}
