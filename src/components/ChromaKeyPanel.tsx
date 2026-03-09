"use client";

import type { ChromaKeySettings } from "@/types/editor";

interface ChromaKeyPanelProps {
  chromaKey: ChromaKeySettings | null;
  onChange: (settings: ChromaKeySettings | null) => void;
}

const QUICK_COLORS = [
  { label: "Green", color: "#00ff00" },
  { label: "Blue", color: "#0000ff" },
  { label: "Red", color: "#ff0000" },
];

export default function ChromaKeyPanel({ chromaKey, onChange }: ChromaKeyPanelProps) {
  const enabled = chromaKey?.enabled ?? false;

  const handleToggle = () => {
    if (enabled) {
      onChange(null);
    } else {
      onChange({ enabled: true, color: "#00ff00", similarity: 0.3, blend: 0.1 });
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Green Screen</h3>
        <button
          onClick={handleToggle}
          className="relative w-9 h-5 rounded-full transition-colors"
          style={{ background: enabled ? 'var(--accent)' : 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
        >
          <div
            className="absolute top-0.5 w-3.5 h-3.5 rounded-full transition-transform"
            style={{
              background: enabled ? 'white' : 'var(--text-muted)',
              transform: enabled ? 'translateX(18px)' : 'translateX(2px)',
            }}
          />
        </button>
      </div>

      {enabled && chromaKey && (
        <div className="space-y-3">
          <p className="text-[10px] px-2 py-1.5 rounded" style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)' }}>
            Effect applied during export only
          </p>

          {/* Quick color picks */}
          <div>
            <label className="text-[10px] uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-muted)' }}>Key Color</label>
            <div className="flex gap-1.5 mb-2">
              {QUICK_COLORS.map((qc) => (
                <button
                  key={qc.label}
                  onClick={() => onChange({ ...chromaKey, color: qc.color })}
                  className="flex-1 py-1.5 rounded-md text-[10px] font-medium transition-all"
                  style={{
                    background: chromaKey.color === qc.color ? 'var(--accent-bg)' : 'var(--bg-elevated)',
                    color: chromaKey.color === qc.color ? 'var(--accent)' : 'var(--text-secondary)',
                    border: chromaKey.color === qc.color ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                  }}
                >
                  <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: qc.color }} />
                  {qc.label}
                </button>
              ))}
            </div>
            <input
              type="color"
              value={chromaKey.color}
              onChange={(e) => onChange({ ...chromaKey, color: e.target.value })}
              className="w-full h-7 rounded-md cursor-pointer"
              style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)' }}
            />
          </div>

          {/* Similarity */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span style={{ color: 'var(--text-muted)' }}>Similarity</span>
              <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{chromaKey.similarity.toFixed(2)}</span>
            </div>
            <input
              type="range" min={0.01} max={1} step={0.01}
              value={chromaKey.similarity}
              onChange={(e) => onChange({ ...chromaKey, similarity: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Blend */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span style={{ color: 'var(--text-muted)' }}>Blend</span>
              <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{chromaKey.blend.toFixed(2)}</span>
            </div>
            <input
              type="range" min={0} max={1} step={0.01}
              value={chromaKey.blend}
              onChange={(e) => onChange({ ...chromaKey, blend: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
