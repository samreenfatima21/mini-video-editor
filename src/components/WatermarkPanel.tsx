"use client";

import type { WatermarkSettings } from "@/types/editor";

interface WatermarkPanelProps {
  watermark: WatermarkSettings;
  onWatermarkChange: (watermark: WatermarkSettings) => void;
}

const POSITIONS: { label: string; value: WatermarkSettings["position"] }[] = [
  { label: "Top Left", value: "top-left" },
  { label: "Top Right", value: "top-right" },
  { label: "Bottom Left", value: "bottom-left" },
  { label: "Bottom Right", value: "bottom-right" },
];

export default function WatermarkPanel({ watermark, onWatermarkChange }: WatermarkPanelProps) {
  const update = (changes: Partial<WatermarkSettings>) => {
    onWatermarkChange({ ...watermark, ...changes });
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Watermark</h3>
        <button
          onClick={() => update({ enabled: !watermark.enabled })}
          className="w-8 h-4.5 rounded-full transition-all flex-shrink-0"
          style={{ background: watermark.enabled ? 'var(--accent)' : 'var(--bg-elevated)' }}
        >
          <div
            className="w-3.5 h-3.5 rounded-full bg-white shadow transition-transform"
            style={{ transform: watermark.enabled ? 'translateX(16px)' : 'translateX(2px)', marginTop: '1px' }}
          />
        </button>
      </div>

      {watermark.enabled && (
        <div className="space-y-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>Text</label>
            <input
              type="text"
              value={watermark.text}
              onChange={(e) => update({ text: e.target.value })}
              placeholder="Your watermark"
              className="w-full px-2.5 py-1.5 rounded-md text-[11px] outline-none transition-colors"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>Position</label>
            <div className="grid grid-cols-2 gap-1.5">
              {POSITIONS.map((pos) => (
                <button
                  key={pos.value}
                  onClick={() => update({ position: pos.value })}
                  className="py-1.5 rounded-md text-[11px] font-medium transition-all"
                  style={{
                    background: watermark.position === pos.value ? 'var(--accent-bg)' : 'var(--bg-elevated)',
                    color: watermark.position === pos.value ? 'var(--accent)' : 'var(--text-secondary)',
                    border: watermark.position === pos.value ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                  }}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>Color</label>
              <input
                type="color" value={watermark.color}
                onChange={(e) => update({ color: e.target.value })}
                className="w-full h-7 rounded-md cursor-pointer"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>
                Size: {watermark.fontSize}px
              </label>
              <input type="range" min={12} max={48} value={watermark.fontSize}
                onChange={(e) => update({ fontSize: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span style={{ color: 'var(--text-muted)' }}>Opacity</span>
              <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{watermark.opacity}%</span>
            </div>
            <input type="range" min={10} max={100} value={watermark.opacity}
              onChange={(e) => update({ opacity: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
