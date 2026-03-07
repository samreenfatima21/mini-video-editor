"use client";

// TextOverlay — lets users add text on top of their video.
// Users can:
// - Type any text
// - Change the color and font size
// - Position it by dragging (future) or adjusting X/Y sliders
// - Add multiple text overlays

import { useState } from "react";
import type { TextOverlay as TextOverlayType } from "@/types/editor";

interface TextOverlayProps {
  overlays: TextOverlayType[];
  onOverlaysChange: (overlays: TextOverlayType[]) => void;
}

export default function TextOverlayPanel({
  overlays,
  onOverlaysChange,
}: TextOverlayProps) {
  // Track which overlay is currently being edited (expanded)
  const [activeId, setActiveId] = useState<string | null>(null);

  // Add a new text overlay with default values
  const addOverlay = () => {
    const newOverlay: TextOverlayType = {
      id: Date.now().toString(), // Simple unique ID using timestamp
      text: "Your text here",
      x: 50, // Center horizontally (percentage)
      y: 50, // Center vertically (percentage)
      fontSize: 32,
      color: "#ffffff",
    };
    onOverlaysChange([...overlays, newOverlay]);
    setActiveId(newOverlay.id); // Auto-expand the new one
  };

  // Update one specific overlay by its ID
  const updateOverlay = (id: string, changes: Partial<TextOverlayType>) => {
    onOverlaysChange(
      overlays.map((o) => (o.id === id ? { ...o, ...changes } : o))
    );
  };

  // Delete an overlay
  const removeOverlay = (id: string) => {
    onOverlaysChange(overlays.filter((o) => o.id !== id));
    if (activeId === id) setActiveId(null);
  };

  return (
    <div className="w-full bg-zinc-900 rounded-xl p-5 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium">Text Overlays</h3>
        <button
          onClick={addOverlay}
          className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          + Add Text
        </button>
      </div>

      {overlays.length === 0 && (
        <p className="text-zinc-500 text-sm">
          No text overlays yet. Click &quot;+ Add Text&quot; to add one.
        </p>
      )}

      {/* List of overlays */}
      <div className="space-y-3">
        {overlays.map((overlay) => (
          <div
            key={overlay.id}
            className="bg-zinc-800 rounded-lg overflow-hidden"
          >
            {/* Overlay header — click to expand/collapse */}
            <button
              onClick={() =>
                setActiveId(activeId === overlay.id ? null : overlay.id)
              }
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-750 transition-colors text-left"
            >
              <span className="text-zinc-200 text-sm truncate max-w-[200px]">
                &quot;{overlay.text}&quot;
              </span>
              <div className="flex items-center gap-2">
                {/* Color preview dot */}
                <div
                  className="w-4 h-4 rounded-full border border-zinc-600"
                  style={{ backgroundColor: overlay.color }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Don't toggle expand
                    removeOverlay(overlay.id);
                  }}
                  className="text-zinc-500 hover:text-red-400 text-xs transition-colors"
                >
                  Delete
                </button>
              </div>
            </button>

            {/* Expanded editor — only shows for the active overlay */}
            {activeId === overlay.id && (
              <div className="px-4 pb-4 space-y-3 border-t border-zinc-700">
                {/* Text input */}
                <div className="mt-3">
                  <label className="text-zinc-400 text-xs block mb-1">
                    Text
                  </label>
                  <input
                    type="text"
                    value={overlay.text}
                    onChange={(e) =>
                      updateOverlay(overlay.id, { text: e.target.value })
                    }
                    className="w-full bg-zinc-900 text-white px-3 py-2 rounded-lg text-sm border border-zinc-700 focus:border-blue-500 outline-none"
                  />
                </div>

                {/* Color and font size — side by side */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-zinc-400 text-xs block mb-1">
                      Color
                    </label>
                    <input
                      type="color"
                      value={overlay.color}
                      onChange={(e) =>
                        updateOverlay(overlay.id, { color: e.target.value })
                      }
                      className="w-full h-9 rounded-lg cursor-pointer bg-zinc-900 border border-zinc-700"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-zinc-400 text-xs block mb-1">
                      Size: {overlay.fontSize}px
                    </label>
                    <input
                      type="range"
                      min={12}
                      max={72}
                      value={overlay.fontSize}
                      onChange={(e) =>
                        updateOverlay(overlay.id, {
                          fontSize: parseInt(e.target.value),
                        })
                      }
                      className="w-full accent-blue-500"
                    />
                  </div>
                </div>

                {/* Position sliders */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-zinc-400 text-xs block mb-1">
                      X Position: {overlay.x}%
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={overlay.x}
                      onChange={(e) =>
                        updateOverlay(overlay.id, {
                          x: parseInt(e.target.value),
                        })
                      }
                      className="w-full accent-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-zinc-400 text-xs block mb-1">
                      Y Position: {overlay.y}%
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={overlay.y}
                      onChange={(e) =>
                        updateOverlay(overlay.id, {
                          y: parseInt(e.target.value),
                        })
                      }
                      className="w-full accent-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
