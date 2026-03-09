"use client";

import { useCallback, useState, useRef } from "react";

interface VideoUploaderProps {
  onVideoSelect: (file: File) => void;
}

export default function VideoUploader({ onVideoSelect }: VideoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("video/")) {
        onVideoSelect(file);
      }
    },
    [onVideoSelect]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onVideoSelect(file);
    },
    [onVideoSelect]
  );

  return (
    <div
      className="group relative flex flex-col items-center justify-center w-full h-56 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300"
      style={{
        borderColor: isDragging ? 'var(--accent)' : 'var(--border-subtle)',
        background: isDragging ? 'var(--accent-bg)' : 'var(--bg-panel)',
        transform: isDragging ? 'scale(1.01)' : 'scale(1)',
      }}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300"
        style={{
          background: isDragging
            ? 'linear-gradient(135deg, var(--accent), #8d70ff)'
            : 'var(--bg-elevated)',
          transform: isDragging ? 'scale(1.1)' : 'scale(1)',
        }}
      >
        <svg
          className="w-6 h-6 transition-colors duration-300"
          style={{ color: isDragging ? 'white' : 'var(--text-secondary)' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
      </div>

      <p className="text-sm font-medium transition-colors" style={{ color: isDragging ? 'var(--accent)' : 'var(--text-primary)' }}>
        {isDragging ? "Drop your video here" : "Drag & drop a video"}
      </p>
      <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
        or click to browse — MP4, WebM, MOV
      </p>

      <div className="flex gap-2 mt-4">
        {["MP4", "WebM", "MOV"].map((fmt) => (
          <span
            key={fmt}
            className="text-[10px] px-2 py-0.5 rounded-full"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
          >
            {fmt}
          </span>
        ))}
      </div>

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
