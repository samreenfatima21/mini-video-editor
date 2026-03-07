"use client";

// FilterPanel — sliders to adjust brightness, contrast, and grayscale.
// These filters are applied as CSS (instant preview) and later baked in on export.
//
// How CSS filters work:
// - brightness(100%) = normal, 200% = twice as bright, 0% = black
// - contrast(100%) = normal, 200% = very contrasty, 0% = all gray
// - grayscale(0%) = full color, 100% = black and white

import type { FilterSettings } from "@/types/editor";

interface FilterPanelProps {
  filters: FilterSettings;
  onFiltersChange: (filters: FilterSettings) => void;
}

export default function FilterPanel({
  filters,
  onFiltersChange,
}: FilterPanelProps) {
  // Helper to update just one filter while keeping the others
  const updateFilter = (key: keyof FilterSettings, value: number) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  // Reset all filters back to normal
  const resetFilters = () => {
    onFiltersChange({ brightness: 100, contrast: 100, grayscale: 0 });
  };

  // Check if any filter has been changed from default
  const isModified =
    filters.brightness !== 100 ||
    filters.contrast !== 100 ||
    filters.grayscale !== 0;

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
