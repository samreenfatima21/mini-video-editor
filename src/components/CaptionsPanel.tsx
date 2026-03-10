"use client";

import { useState } from "react";
import type { Caption, CaptionStyle } from "@/types/editor";
import { extractAudio } from "@/lib/extractAudio";

interface CaptionsPanelProps {
  captions: Caption[];
  enabled: boolean;
  style: CaptionStyle;
  currentTime: number;
  videoFile?: File;
  onAddCaption: (caption: Caption) => void;
  onUpdateCaption: (id: string, changes: Partial<Caption>) => void;
  onRemoveCaption: (id: string) => void;
  onClearCaptions?: () => void;
  onStyleChange: (style: CaptionStyle) => void;
  onEnabledChange: (enabled: boolean) => void;
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function CaptionsPanel({
  captions,
  enabled,
  style,
  currentTime,
  videoFile,
  onAddCaption,
  onUpdateCaption,
  onRemoveCaption,
  onClearCaptions,
  onStyleChange,
  onEnabledChange,
}: CaptionsPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStatus, setGeneratingStatus] = useState("");

  const handleAdd = () => {
    onAddCaption({
      id: `cap-${Date.now()}`,
      startTime: currentTime,
      endTime: currentTime + 3,
      text: "Caption text",
    });
  };

  const handleAutoGenerate = async () => {
    if (!videoFile) return;

    // Confirm before overwriting existing captions
    if (captions.length > 0) {
      const ok = window.confirm(
        "This will replace all existing captions. Continue?"
      );
      if (!ok) return;
      onClearCaptions?.();
    }

    setIsGenerating(true);

    try {
      // Step 1: Extract audio
      setGeneratingStatus("Extracting audio...");
      const audioBlob = await extractAudio(videoFile);

      // Step 2: Send to Whisper API
      setGeneratingStatus("Transcribing...");
      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.mp3");

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(
          (err as { error?: string }).error || `Transcription failed (${response.status})`
        );
      }

      const data = (await response.json()) as {
        segments: { start: number; end: number; text: string }[];
      };

      if (!data.segments || data.segments.length === 0) {
        throw new Error("No speech detected in the audio");
      }

      // Step 3: Convert segments to captions
      for (const seg of data.segments) {
        onAddCaption({
          id: `cap-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          startTime: seg.start,
          endTime: seg.end,
          text: seg.text,
        });
      }

      setGeneratingStatus("");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Auto-generation failed";
      alert(message);
      setGeneratingStatus("");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Captions</h3>
        <button
          onClick={() => onEnabledChange(!enabled)}
          className="w-9 h-5 rounded-full transition-all relative"
          style={{ background: enabled ? 'var(--accent)' : 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all"
            style={{ left: enabled ? '16px' : '2px' }} />
        </button>
      </div>

      {enabled && (
        <>
          {/* Style controls */}
          <div className="mb-3 space-y-2">
            <label className="text-[10px] uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>Style</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[10px] block mb-1" style={{ color: 'var(--text-muted)' }}>Size: {style.fontSize}px</label>
                <input type="range" min={14} max={48} value={style.fontSize}
                  onChange={(e) => onStyleChange({ ...style, fontSize: parseInt(e.target.value) })} className="w-full" />
              </div>
              <div className="w-12">
                <label className="text-[10px] block mb-1" style={{ color: 'var(--text-muted)' }}>Color</label>
                <input type="color" value={style.fontColor}
                  onChange={(e) => onStyleChange({ ...style, fontColor: e.target.value })}
                  className="w-full h-7 rounded cursor-pointer" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)' }} />
              </div>
            </div>
            <div className="flex gap-2">
              {(['bottom', 'top'] as const).map((pos) => (
                <button
                  key={pos}
                  onClick={() => onStyleChange({ ...style, position: pos })}
                  className="flex-1 py-1.5 rounded-md text-[11px] font-medium transition-all capitalize"
                  style={{
                    background: style.position === pos ? 'var(--accent-bg)' : 'var(--bg-elevated)',
                    color: style.position === pos ? 'var(--accent)' : 'var(--text-secondary)',
                    border: `1px solid ${style.position === pos ? 'var(--accent)' : 'var(--border-subtle)'}`,
                  }}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {/* Auto-Generate button */}
          <button
            onClick={handleAutoGenerate}
            disabled={isGenerating || !videoFile}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold mb-2 transition-all disabled:opacity-50"
            style={{
              background: isGenerating ? 'var(--bg-elevated)' : 'var(--accent)',
              color: isGenerating ? 'var(--text-secondary)' : '#fff',
              border: `1px solid ${isGenerating ? 'var(--border-subtle)' : 'var(--accent)'}`,
            }}
          >
            {isGenerating ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {generatingStatus}
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                </svg>
                Auto-Generate
              </>
            )}
          </button>

          {/* Add manual caption button */}
          <button
            onClick={handleAdd}
            className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-medium mb-3 transition-all"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Caption at {formatTime(currentTime)}
          </button>

          {/* Clear All button */}
          {captions.length > 0 && onClearCaptions && (
            <button
              onClick={() => {
                if (window.confirm("Remove all captions?")) onClearCaptions();
              }}
              className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-medium mb-3 transition-all"
              style={{ background: 'var(--bg-elevated)', color: 'var(--accent-error, #ef4444)', border: '1px solid var(--border-subtle)' }}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
              Clear All
            </button>
          )}

          {/* Caption list */}
          <div className="space-y-2">
            {captions.map((cap) => (
              <div key={cap.id} className="rounded-lg px-3 py-2 space-y-1.5"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                    {formatTime(cap.startTime)} - {formatTime(cap.endTime)}
                  </span>
                  <button onClick={() => onRemoveCaption(cap.id)} className="p-0.5" style={{ color: 'var(--text-muted)' }}>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <input
                  type="text"
                  value={cap.text}
                  onChange={(e) => onUpdateCaption(cap.id, { text: e.target.value })}
                  className="w-full px-2 py-1 rounded text-[11px] outline-none"
                  style={{ background: 'var(--bg-panel)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Start</label>
                    <input type="number" min={0} step={0.1} value={cap.startTime}
                      onChange={(e) => onUpdateCaption(cap.id, { startTime: parseFloat(e.target.value) || 0 })}
                      className="w-full px-1.5 py-0.5 rounded text-[10px] font-mono outline-none"
                      style={{ background: 'var(--bg-panel)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
                  </div>
                  <div className="flex-1">
                    <label className="text-[9px]" style={{ color: 'var(--text-muted)' }}>End</label>
                    <input type="number" min={0} step={0.1} value={cap.endTime}
                      onChange={(e) => onUpdateCaption(cap.id, { endTime: parseFloat(e.target.value) || 0 })}
                      className="w-full px-1.5 py-0.5 rounded text-[10px] font-mono outline-none"
                      style={{ background: 'var(--bg-panel)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {captions.length === 0 && (
            <p className="text-[11px] text-center py-2" style={{ color: 'var(--text-muted)' }}>
              No captions yet. Click &quot;Auto-Generate&quot; or &quot;Add Caption&quot; to start.
            </p>
          )}
        </>
      )}
    </div>
  );
}
