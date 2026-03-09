"use client";

import type { PanZoomSettings, EasingType } from "@/types/editor";

interface PanZoomPanelProps {
  panZoom: PanZoomSettings;
  onChange: (panZoom: PanZoomSettings) => void;
}

const PRESETS: { label: string; start: { scale: number; x: number; y: number }; end: { scale: number; x: number; y: number } }[] = [
  { label: "Zoom In", start: { scale: 1, x: 50, y: 50 }, end: { scale: 1.5, x: 50, y: 50 } },
  { label: "Zoom Out", start: { scale: 1.5, x: 50, y: 50 }, end: { scale: 1, x: 50, y: 50 } },
  { label: "Pan L\u2192R", start: { scale: 1.3, x: 30, y: 50 }, end: { scale: 1.3, x: 70, y: 50 } },
  { label: "Pan R\u2192L", start: { scale: 1.3, x: 70, y: 50 }, end: { scale: 1.3, x: 30, y: 50 } },
];

const EASING_OPTIONS: { value: EasingType; label: string }[] = [
  { value: "linear", label: "Linear" },
  { value: "ease-in", label: "Ease In" },
  { value: "ease-out", label: "Ease Out" },
  { value: "ease-in-out", label: "Ease In-Out" },
];

export default function PanZoomPanel({ panZoom, onChange }: PanZoomPanelProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Pan & Zoom</h3>
        <button
          onClick={() => onChange({ ...panZoom, enabled: !panZoom.enabled })}
          className="w-9 h-5 rounded-full transition-all relative"
          style={{ background: panZoom.enabled ? 'var(--accent)' : 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all"
            style={{ left: panZoom.enabled ? '16px' : '2px' }} />
        </button>
      </div>

      {panZoom.enabled && (
        <>
          {/* Presets */}
          <div className="mb-3">
            <label className="text-[10px] uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-muted)' }}>Presets</label>
            <div className="grid grid-cols-2 gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => onChange({ ...panZoom, startKeyframe: p.start, endKeyframe: p.end })}
                  className="py-1.5 rounded-md text-[10px] font-medium transition-all"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Start Keyframe */}
          <div className="mb-3">
            <label className="text-[10px] uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-muted)' }}>Start</label>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span style={{ color: 'var(--text-muted)' }}>Scale</span>
                <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{panZoom.startKeyframe.scale.toFixed(1)}x</span>
              </div>
              <input type="range" min={1} max={3} step={0.1} value={panZoom.startKeyframe.scale}
                onChange={(e) => onChange({ ...panZoom, startKeyframe: { ...panZoom.startKeyframe, scale: parseFloat(e.target.value) } })} className="w-full" />
              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="flex justify-between text-[10px]">
                    <span style={{ color: 'var(--text-muted)' }}>X</span>
                    <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{panZoom.startKeyframe.x}%</span>
                  </div>
                  <input type="range" min={0} max={100} value={panZoom.startKeyframe.x}
                    onChange={(e) => onChange({ ...panZoom, startKeyframe: { ...panZoom.startKeyframe, x: parseInt(e.target.value) } })} className="w-full" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-[10px]">
                    <span style={{ color: 'var(--text-muted)' }}>Y</span>
                    <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{panZoom.startKeyframe.y}%</span>
                  </div>
                  <input type="range" min={0} max={100} value={panZoom.startKeyframe.y}
                    onChange={(e) => onChange({ ...panZoom, startKeyframe: { ...panZoom.startKeyframe, y: parseInt(e.target.value) } })} className="w-full" />
                </div>
              </div>
            </div>
          </div>

          {/* End Keyframe */}
          <div className="mb-3">
            <label className="text-[10px] uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-muted)' }}>End</label>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span style={{ color: 'var(--text-muted)' }}>Scale</span>
                <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{panZoom.endKeyframe.scale.toFixed(1)}x</span>
              </div>
              <input type="range" min={1} max={3} step={0.1} value={panZoom.endKeyframe.scale}
                onChange={(e) => onChange({ ...panZoom, endKeyframe: { ...panZoom.endKeyframe, scale: parseFloat(e.target.value) } })} className="w-full" />
              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="flex justify-between text-[10px]">
                    <span style={{ color: 'var(--text-muted)' }}>X</span>
                    <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{panZoom.endKeyframe.x}%</span>
                  </div>
                  <input type="range" min={0} max={100} value={panZoom.endKeyframe.x}
                    onChange={(e) => onChange({ ...panZoom, endKeyframe: { ...panZoom.endKeyframe, x: parseInt(e.target.value) } })} className="w-full" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-[10px]">
                    <span style={{ color: 'var(--text-muted)' }}>Y</span>
                    <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{panZoom.endKeyframe.y}%</span>
                  </div>
                  <input type="range" min={0} max={100} value={panZoom.endKeyframe.y}
                    onChange={(e) => onChange({ ...panZoom, endKeyframe: { ...panZoom.endKeyframe, y: parseInt(e.target.value) } })} className="w-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Easing */}
          <div>
            <label className="text-[10px] uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-muted)' }}>Easing</label>
            <select
              value={panZoom.easing}
              onChange={(e) => onChange({ ...panZoom, easing: e.target.value as EasingType })}
              className="w-full px-2.5 py-1.5 rounded-md text-[11px] outline-none"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
            >
              {EASING_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
}
