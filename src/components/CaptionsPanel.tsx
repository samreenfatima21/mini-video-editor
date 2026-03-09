"use client";

import type { Caption, CaptionStyle } from "@/types/editor";

interface CaptionsPanelProps {
  captions: Caption[];
  enabled: boolean;
  style: CaptionStyle;
  currentTime: number;
  onAddCaption: (caption: Caption) => void;
  onUpdateCaption: (id: string, changes: Partial<Caption>) => void;
  onRemoveCaption: (id: string) => void;
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
  onAddCaption,
  onUpdateCaption,
  onRemoveCaption,
  onStyleChange,
  onEnabledChange,
}: CaptionsPanelProps) {
  const handleAdd = () => {
    onAddCaption({
      id: `cap-${Date.now()}`,
      startTime: currentTime,
      endTime: currentTime + 3,
      text: "Caption text",
    });
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

          {/* Add button */}
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
              No captions yet. Click &quot;Add Caption&quot; to start.
            </p>
          )}
        </>
      )}
    </div>
  );
}
