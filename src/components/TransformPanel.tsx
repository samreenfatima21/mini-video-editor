"use client";

import type { TransformSettings } from "@/types/editor";

interface TransformPanelProps {
  transform: TransformSettings;
  onRotate: (direction: 'cw' | 'ccw') => void;
  onToggleFlipH: () => void;
  onToggleFlipV: () => void;
  onReset: () => void;
}

export default function TransformPanel({
  transform,
  onRotate,
  onToggleFlipH,
  onToggleFlipV,
  onReset,
}: TransformPanelProps) {
  return (
    <div className="w-full">
      <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Transform</h3>

      {/* Rotation */}
      <div className="mb-4">
        <label className="text-[10px] uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>
          Rotation: {transform.rotation}°
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => onRotate('ccw')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-medium transition-all"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
            </svg>
            CCW
          </button>
          <button
            onClick={() => onRotate('cw')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-medium transition-all"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
          >
            CW
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Flip */}
      <div className="mb-4">
        <label className="text-[10px] uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>Flip</label>
        <div className="flex gap-2">
          <button
            onClick={onToggleFlipH}
            className="flex-1 py-2 rounded-lg text-[11px] font-medium transition-all"
            style={{
              background: transform.flipH ? 'var(--accent-bg)' : 'var(--bg-elevated)',
              color: transform.flipH ? 'var(--accent)' : 'var(--text-secondary)',
              border: `1px solid ${transform.flipH ? 'var(--accent)' : 'var(--border-subtle)'}`,
            }}
          >
            Flip H
          </button>
          <button
            onClick={onToggleFlipV}
            className="flex-1 py-2 rounded-lg text-[11px] font-medium transition-all"
            style={{
              background: transform.flipV ? 'var(--accent-bg)' : 'var(--bg-elevated)',
              color: transform.flipV ? 'var(--accent)' : 'var(--text-secondary)',
              border: `1px solid ${transform.flipV ? 'var(--accent)' : 'var(--border-subtle)'}`,
            }}
          >
            Flip V
          </button>
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={onReset}
        className="w-full py-1.5 rounded-lg text-[11px] font-medium transition-all"
        style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
      >
        Reset Transform
      </button>
    </div>
  );
}
