"use client";

// FilterPanel — sliders to adjust brightness, contrast, and grayscale.
// Now with one-click presets: Vintage, Cinematic, Bright, Noir.

import type { FilterSettings } from "@/types/editor";

interface FilterPanelProps {
  filters: FilterSettings;
  onFiltersChange: (filters: FilterSettings) => void;
}

// One-click filter presets
const PRESETS: { name: string; emoji: string; filters: FilterSettings }[] = [
  { name: "Normal", emoji: "🔄", filters: { brightness: 100, contrast: 100, grayscale: 0 } },
  { name: "Vintage", emoji: "🎞️", filters: { brightness: 110, contrast: 85, grayscale: 30 } },
  { name: "Cinematic", emoji: "🎬", filters: { brightness: 90, contrast: 130, grayscale: 10 } },
  { name: "Bright", emoji: "☀️", filters: { brightness: 140, contrast: 110, grayscale: 0 } },
  { name: "Noir", emoji: "🖤", filters: { brightness: 95, contrast: 120, grayscale: 100 } },
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

  // Check which preset matches current filters
  const activePreset = PRESETS.find(
    (p) =>
      p.filters.brightness === filters.brightness &&
      p.filters.contrast === filters.contrast &&
      p.filters.grayscale === filters.grayscale
  );

  return (
    <div className="w-full bg-zinc-900 rounded-xl p-5 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium">Filters</h3>
        {isModified && (
          <button
            onClick={resetFilters}
            className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Filter Presets — one-click buttons */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => onFiltersChange(preset.filters)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activePreset?.name === preset.name
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
            }`}
          >
            {preset.emoji} {preset.name}
          </button>
        ))}
      </div>

      {/* Brightness slider */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-zinc-400">Brightness</span>
          <span className="text-yellow-400 font-mono">{filters.brightness}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={200}
          value={filters.brightness}
          onChange={(e) => updateFilter("brightness", parseInt(e.target.value))}
          className="w-full accent-yellow-500"
        />
      </div>

      {/* Contrast slider */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-zinc-400">Contrast</span>
          <span className="text-orange-400 font-mono">{filters.contrast}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={200}
          value={filters.contrast}
          onChange={(e) => updateFilter("contrast", parseInt(e.target.value))}
          className="w-full accent-orange-500"
        />
      </div>

      {/* Grayscale slider */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-zinc-400">Grayscale</span>
          <span className="text-zinc-300 font-mono">{filters.grayscale}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={filters.grayscale}
          onChange={(e) => updateFilter("grayscale", parseInt(e.target.value))}
          className="w-full accent-zinc-400"
        />
      </div>
    </div>
  );
}
