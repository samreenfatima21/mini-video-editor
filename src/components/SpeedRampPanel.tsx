"use client";

import type { SpeedRampPreset, SpeedRampSettings } from "@/types/editor";

interface SpeedRampPanelProps {
  speedRamp: SpeedRampSettings;
  onChange: (settings: SpeedRampSettings) => void;
}

const PRESETS: { preset: SpeedRampPreset; label: string; desc: string; curve: string }[] = [
  {
    preset: 'none',
    label: 'None',
    desc: 'Constant speed',
    curve: 'M0 50 L100 50',
  },
  {
    preset: 'ramp-up',
    label: 'Ramp Up',
    desc: '0.5x → 2x',
    curve: 'M0 70 Q50 65 100 15',
  },
  {
    preset: 'ramp-down',
    label: 'Ramp Down',
    desc: '2x → 0.5x',
    curve: 'M0 15 Q50 20 100 70',
  },
  {
    preset: 'slow-mo-burst',
    label: 'Slow-Mo Burst',
    desc: '1x → 0.3x → 1x',
    curve: 'M0 40 Q25 40 33 80 Q50 80 66 80 Q75 40 100 40',
  },
];

export default function SpeedRampPanel({ speedRamp, onChange }: SpeedRampPanelProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Speed Ramp</h3>
      </div>

      {speedRamp.preset !== 'none' && (
        <p className="text-[10px] px-2 py-1.5 rounded mb-3" style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)' }}>
          Overrides constant speed when active
        </p>
      )}

      <div className="space-y-2">
        {PRESETS.map((p) => {
          const isActive = speedRamp.preset === p.preset;
          return (
            <button
              key={p.preset}
              onClick={() => onChange({ preset: p.preset })}
              className="w-full rounded-lg p-3 text-left transition-all"
              style={{
                background: isActive ? 'var(--accent-bg)' : 'var(--bg-elevated)',
                border: isActive ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
              }}
            >
              <div className="flex items-center gap-3">
                {/* Speed curve SVG */}
                <svg
                  viewBox="0 0 100 100"
                  className="w-12 h-8 flex-shrink-0"
                  style={{ opacity: isActive ? 1 : 0.5 }}
                >
                  <line x1="0" y1="90" x2="100" y2="90" stroke="var(--border-subtle)" strokeWidth="1" />
                  <path
                    d={p.curve}
                    fill="none"
                    stroke={isActive ? 'var(--accent)' : 'var(--text-muted)'}
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
                <div>
                  <div className="text-[11px] font-medium" style={{ color: isActive ? 'var(--accent)' : 'var(--text-primary)' }}>
                    {p.label}
                  </div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {p.desc}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
