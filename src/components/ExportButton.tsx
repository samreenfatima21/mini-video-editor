"use client";

// ExportButton — the final step! Takes all your edits and creates a downloadable video.
//
// What it does:
// 1. Sends the video to FFmpeg
// 2. Applies filters (brightness, contrast, grayscale)
// 3. Burns text overlays into the video
// 4. Outputs a finished MP4 file
// 5. Triggers a browser download

import { useState, useCallback } from "react";
import { getFFmpeg } from "@/lib/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import type { FilterSettings, TextOverlay } from "@/types/editor";

interface ExportButtonProps {
  videoFile: File;
  filters: FilterSettings;
  textOverlays: TextOverlay[];
  isProcessing: boolean;
  onProcessingChange: (processing: boolean) => void;
}

export default function ExportButton({
  videoFile,
  filters,
  textOverlays,
  isProcessing,
  onProcessingChange,
}: ExportButtonProps) {
  const [statusMessage, setStatusMessage] = useState("");
  const [progress, setProgress] = useState(0);

  const handleExport = useCallback(async () => {
    onProcessingChange(true);
    setProgress(0);
    setStatusMessage("Loading FFmpeg...");

    try {
      const ffmpeg = await getFFmpeg();
      setProgress(10);

      // Step 1: Write the video into FFmpeg's virtual filesystem
      setStatusMessage("Reading video...");
      const inputData = await fetchFile(videoFile);
      await ffmpeg.writeFile("input.mp4", inputData);
      setProgress(30);

      // Step 2: Build the FFmpeg filter string
      // FFmpeg uses "filter chains" — a series of effects applied to the video
      const videoFilters: string[] = [];

      // Add brightness/contrast (FFmpeg uses "eq" filter)
      // FFmpeg brightness: -1.0 to 1.0 (0 = normal)
      // Our brightness: 0-200 (100 = normal)
      // So we convert: (brightness - 100) / 100
      const ffBrightness = (filters.brightness - 100) / 100;
      // FFmpeg contrast: 0.0 to 2.0 (1.0 = normal)
      // Our contrast: 0-200 (100 = normal)
      const ffContrast = filters.contrast / 100;

      if (ffBrightness !== 0 || ffContrast !== 1) {
        videoFilters.push(`eq=brightness=${ffBrightness}:contrast=${ffContrast}`);
      }

      // Add grayscale if applied
      if (filters.grayscale > 0) {
        // FFmpeg saturation: 0 = grayscale, 1 = normal
        const saturation = 1 - filters.grayscale / 100;
        videoFilters.push(`hue=s=${saturation}`);
      }

      // Add text overlays using FFmpeg's drawtext filter
      for (const overlay of textOverlays) {
        if (overlay.text.trim()) {
          // Convert percentage position to FFmpeg position
          // FFmpeg uses pixel positions, but we can use expressions with w (width) and h (height)
          const x = `(w*${overlay.x / 100})-(tw/2)`; // tw = text width
          const y = `(h*${overlay.y / 100})-(th/2)`; // th = text height

          // Escape special characters for FFmpeg
          const escapedText = overlay.text
            .replace(/'/g, "\\'")
            .replace(/:/g, "\\:");

          videoFilters.push(
            `drawtext=text='${escapedText}':fontsize=${overlay.fontSize}:fontcolor=${overlay.color}:x=${x}:y=${y}:shadowcolor=black:shadowx=2:shadowy=2`
          );
        }
      }

      // Step 3: Run FFmpeg export command
      setStatusMessage("Exporting video...");
      setProgress(40);

      const command: string[] = ["-i", "input.mp4"];

      if (videoFilters.length > 0) {
        // Apply all filters as a chain separated by commas
        command.push("-vf", videoFilters.join(","));
      }

      // Output settings
      command.push(
        "-c:v", "libx264",  // Video codec
        "-c:a", "aac",      // Audio codec
        "-strict", "experimental",
        "output.mp4"
      );

      await ffmpeg.exec(command);
      setProgress(80);

      // Step 4: Read the exported file
      setStatusMessage("Preparing download...");
      const outputData = await ffmpeg.readFile("output.mp4");
      setProgress(90);

      // Step 5: Trigger browser download
      const blob = new Blob([new Uint8Array(outputData as Uint8Array)], {
        type: "video/mp4",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `edited_${videoFile.name.replace(/\.[^.]+$/, "")}.mp4`;
      link.click();

      // Clean up
      URL.revokeObjectURL(url);
      await ffmpeg.deleteFile("input.mp4");
      await ffmpeg.deleteFile("output.mp4");

      setProgress(100);
      setStatusMessage("Export complete! Check your downloads.");
    } catch (error) {
      console.error("Export failed:", error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      setStatusMessage(`Export failed: ${errorMsg}`);
    } finally {
      onProcessingChange(false);
    }
  }, [videoFile, filters, textOverlays, onProcessingChange]);

  return (
    <div className="w-full bg-zinc-900 rounded-xl p-5 mt-4">
      <h3 className="text-white font-medium mb-3">Export</h3>

      <p className="text-zinc-500 text-sm mb-4">
        Export your video with all edits (filters + text) baked in.
      </p>

      {/* Progress bar — only shows during export */}
      {isProcessing && (
        <div className="mb-4">
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-zinc-400 text-sm mt-2 text-center">
            {statusMessage}
          </p>
        </div>
      )}

      <button
        onClick={handleExport}
        disabled={isProcessing}
        className={`
          w-full py-3 rounded-lg font-medium transition-all text-lg
          ${
            isProcessing
              ? "bg-zinc-700 text-zinc-500 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-500 text-white cursor-pointer"
          }
        `}
      >
        {isProcessing ? "Exporting..." : "Export & Download"}
      </button>

      {/* Success message */}
      {!isProcessing && progress === 100 && (
        <p className="text-green-400 text-sm text-center mt-2">
          {statusMessage}
        </p>
      )}
    </div>
  );
}
