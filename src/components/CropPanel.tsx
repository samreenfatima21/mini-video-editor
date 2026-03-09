"use client";

import type { CropSettings, AspectRatioPreset } from "@/types/editor";

interface CropPanelProps {
  crop: CropSettings;
  onCropChange: (crop: CropSettings) => void;
}

const PRESETS: { label: string; value: AspectRatioPreset; desc: string }[] = [
  { label: "16:9", value: "16:9", desc: "Landscape" },
  { label: "9:16", value: "9:16", desc: "Vertical" },
  { label: "1:1", value: "1:1", desc: "Square" },
  { label: "4:5", value: "4:5", desc: "Portrait" },
  { label: "4:3", value: "4:3", desc: "Classic" },
  { label: "Original", value: "original", desc: "No crop" },
];

export default function CropPanel({ crop, onCropChange }: CropPanelProps) {
  return (
    <div className="w-full">
      <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Aspect Ratio</h3>

      <div className="grid grid-cols-2 gap-1.5">
        {PRESETS.map((preset) => (
          <button
            key={preset.value}
            onClick={() => onCropChange({ preset: preset.value })}
            className="flex flex-col items-center gap-0.5 py-2.5 rounded-lg text-[11px] font-medium transition-all"
            style={{
              background: crop.preset === preset.value ? 'var(--accent-bg)' : 'var(--bg-elevated)',
              color: crop.preset === preset.value ? 'var(--accent)' : 'var(--text-secondary)',
              border: crop.preset === preset.value ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
            }}
          >
            <span className="font-semibold">{preset.label}</span>
            <span className="text-[9px] opacity-60">{preset.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
