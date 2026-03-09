"use client";

import type { FilterSettings } from "@/types/editor";

interface FilterPanelProps {
  filters: FilterSettings;
  onFiltersChange: (filters: FilterSettings) => void;
}

const PRESETS: { name: string; filters: FilterSettings }[] = [
  { name: "Normal", filters: { brightness: 100, contrast: 100, grayscale: 0 } },
  { name: "Vintage", filters: { brightness: 110, contrast: 85, grayscale: 30 } },
  { name: "Cinematic", filters: { brightness: 90, contrast: 130, grayscale: 10 } },
  { name: "Bright", filters: { brightness: 140, contrast: 110, grayscale: 0 } },
  { name: "Noir", filters: { brightness: 95, contrast: 120, grayscale: 100 } },
  { name: "Warm", filters: { brightness: 115, contrast: 105, grayscale: 5 } },
  { name: "Cool", filters: { brightness: 95, contrast: 110, grayscale: 15 } },
  { name: "Sepia", filters: { brightness: 110, contrast: 90, grayscale: 45 } },
  { name: "Retro", filters: { brightness: 105, contrast: 80, grayscale: 25 } },
  { name: "Fade", filters: { brightness: 120, contrast: 75, grayscale: 10 } },
  { name: "Dramatic", filters: { brightness: 85, contrast: 150, grayscale: 5 } },
  { name: "Sunset", filters: { brightness: 125, contrast: 115, grayscale: 8 } },
  { name: "Ocean", filters: { brightness: 90, contrast: 105, grayscale: 20 } },
];

export default function FilterPanel({
  filters,
  onFiltersChange,
}: FilterPanelProps) {
  const updateFilter = (key: keyof FilterSettings, value: number) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onFiltersChange({ brightness: 100, contrast: 100, grayscale: 0 });
  };

  const isModified =
    filters.brightness !== 100 ||
    filters.contrast !== 100 ||
    filters.grayscale !== 0;

  const activePreset = PRESETS.find(
    (p) =>
      p.filters.brightness === filters.brightness &&
      p.filters.contrast === filters.contrast &&
      p.filters.grayscale === filters.grayscale
  );

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Filters</h3>
        {isModified && (
          <button
            onClick={resetFilters}
            className="text-[11px] transition-colors flex items-center gap-1"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Reset
          </button>
        )}
      </div>

      {/* Preset grid — 2 columns */}
      <div className="grid grid-cols-2 gap-1.5 mb-4">
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => onFiltersChange(preset.filters)}
            className="px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all text-left"
            style={{
              background: activePreset?.name === preset.name ? 'var(--accent-bg)' : 'var(--bg-elevated)',
              color: activePreset?.name === preset.name ? 'var(--accent)' : 'var(--text-secondary)',
              border: activePreset?.name === preset.name ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
            }}
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Sliders */}
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-[11px] mb-1">
            <span style={{ color: 'var(--text-muted)' }}>Brightness</span>
            <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{filters.brightness}%</span>
          </div>
          <input
            type="range" min={0} max={200}
            value={filters.brightness}
            onChange={(e) => updateFilter("brightness", parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <div className="flex justify-between text-[11px] mb-1">
            <span style={{ color: 'var(--text-muted)' }}>Contrast</span>
            <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{filters.contrast}%</span>
          </div>
          <input
            type="range" min={0} max={200}
            value={filters.contrast}
            onChange={(e) => updateFilter("contrast", parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <div className="flex justify-between text-[11px] mb-1">
            <span style={{ color: 'var(--text-muted)' }}>Grayscale</span>
            <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{filters.grayscale}%</span>
          </div>
          <input
            type="range" min={0} max={100}
            value={filters.grayscale}
            onChange={(e) => updateFilter("grayscale", parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
