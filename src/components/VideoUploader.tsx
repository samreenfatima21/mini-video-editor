"use client";

// VideoUploader — lets users pick a video file or drag-and-drop one.
// This is the FIRST thing users see when they open the app.

import { useCallback, useState, useRef } from "react";

// Props = the inputs this component receives from its parent
interface VideoUploaderProps {
  onVideoSelect: (file: File) => void;
}

export default function VideoUploader({ onVideoSelect }: VideoUploaderProps) {
  // Track whether user is dragging a file over the drop zone
  const [isDragging, setIsDragging] = useState(false);
  // useRef gives us a reference to the hidden <input> element
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Called when a file is dropped onto the drop zone
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault(); // Stop browser from opening the file
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      // Only accept video files
      if (file && file.type.startsWith("video/")) {
        onVideoSelect(file);
      }
    },
    [onVideoSelect]
  );

  // Called when user picks a file from the file dialog
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onVideoSelect(file);
      }
    },
    [onVideoSelect]
  );

  return (
    <div
      // This is the drop zone — the big area users can drag files onto
      className={`
        flex flex-col items-center justify-center
        w-full h-80 rounded-2xl border-2 border-dashed
        cursor-pointer transition-all duration-200
        ${
          isDragging
            ? "border-blue-500 bg-blue-500/10 scale-[1.02]"
            : "border-zinc-600 bg-zinc-900 hover:border-zinc-400 hover:bg-zinc-800"
        }
      `}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      {/* Upload icon */}
      <svg
        className="w-16 h-16 text-zinc-400 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
        />
      </svg>

      <p className="text-zinc-300 text-lg font-medium">
        {isDragging ? "Drop your video here!" : "Drag & drop a video"}
      </p>
      <p className="text-zinc-500 text-sm mt-2">
        or click to browse — MP4, WebM, MOV supported
      </p>

      {/* Hidden file input — we trigger it programmatically */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
