"use client";

import { useRef } from "react";
import type { BackgroundMusic } from "@/types/editor";

interface AudioPanelProps {
  music: BackgroundMusic | null;
  onMusicChange: (music: BackgroundMusic) => void;
  onMusicUpdate: (changes: Partial<BackgroundMusic>) => void;
  onMusicRemove: () => void;
}

export default function AudioPanel({
  music,
  onMusicChange,
  onMusicUpdate,
  onMusicRemove,
}: AudioPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onMusicChange({
      file,
      fileName: file.name,
      url,
      volume: 0.5,
      startOffset: 0,
      loop: false,
      fadeIn: 0,
      fadeOut: 0,
    });
  };

  return (
    <div className="w-full">
      <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Background Music</h3>

      {!music ? (
        <div>
          <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={handleFileSelect} />
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-[11px] font-medium transition-all"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px dashed var(--border-active)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z" />
            </svg>
            Upload Audio File
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* File info */}
          <div className="flex items-center justify-between px-3 py-2 rounded-lg"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
            <span className="text-[11px] truncate max-w-[160px]" style={{ color: 'var(--text-secondary)' }}>
              {music.fileName}
            </span>
            <button onClick={onMusicRemove} className="p-0.5 rounded transition-colors" style={{ color: 'var(--text-muted)' }}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Volume */}
          <div>
            <div className="flex justify-between text-[10px] mb-1">
              <span style={{ color: 'var(--text-muted)' }}>Volume</span>
              <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{Math.round(music.volume * 100)}%</span>
            </div>
            <input type="range" min={0} max={1} step={0.01} value={music.volume}
              onChange={(e) => onMusicUpdate({ volume: parseFloat(e.target.value) })} className="w-full" />
          </div>

          {/* Loop */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Loop</span>
            <button
              onClick={() => onMusicUpdate({ loop: !music.loop })}
              className="w-9 h-5 rounded-full transition-all relative"
              style={{ background: music.loop ? 'var(--accent)' : 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
            >
              <div className="absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all"
                style={{ left: music.loop ? '16px' : '2px' }} />
            </button>
          </div>

          {/* Start Offset */}
          <div>
            <div className="flex justify-between text-[10px] mb-1">
              <span style={{ color: 'var(--text-muted)' }}>Start Offset</span>
              <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{music.startOffset}s</span>
            </div>
            <input type="range" min={0} max={30} step={0.5} value={music.startOffset}
              onChange={(e) => onMusicUpdate({ startOffset: parseFloat(e.target.value) })} className="w-full" />
          </div>

          {/* Fade In/Out */}
          <div className="flex gap-2">
            <div className="flex-1">
              <div className="flex justify-between text-[10px] mb-1">
                <span style={{ color: 'var(--text-muted)' }}>Fade In</span>
                <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{music.fadeIn}s</span>
              </div>
              <input type="range" min={0} max={5} step={0.5} value={music.fadeIn}
                onChange={(e) => onMusicUpdate({ fadeIn: parseFloat(e.target.value) })} className="w-full" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-[10px] mb-1">
                <span style={{ color: 'var(--text-muted)' }}>Fade Out</span>
                <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{music.fadeOut}s</span>
              </div>
              <input type="range" min={0} max={5} step={0.5} value={music.fadeOut}
                onChange={(e) => onMusicUpdate({ fadeOut: parseFloat(e.target.value) })} className="w-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
