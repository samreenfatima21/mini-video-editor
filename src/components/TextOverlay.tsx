"use client";

import { useState, useRef } from "react";
import type { TextOverlay as TextOverlayType, FontFamily, TextAnimation } from "@/types/editor";
import { FONT_OPTIONS } from "@/lib/fonts";
import { ANIMATION_OPTIONS } from "@/lib/animations";

interface TextOverlayProps {
  overlays: TextOverlayType[];
  onOverlaysChange: (overlays: TextOverlayType[]) => void;
}

export default function TextOverlayPanel({
  overlays,
  onOverlaysChange,
}: TextOverlayProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragCounter = useRef(0);

  const addOverlay = () => {
    const newOverlay: TextOverlayType = {
      id: Date.now().toString(),
      text: "Your text here",
      x: 50,
      y: 50,
      fontSize: 32,
      color: "#ffffff",
      fontFamily: "inter",
      animation: "none",
    };
    onOverlaysChange([...overlays, newOverlay]);
    setActiveId(newOverlay.id);
  };

  const updateOverlay = (id: string, changes: Partial<TextOverlayType>) => {
    onOverlaysChange(
      overlays.map((o) => (o.id === id ? { ...o, ...changes } : o))
    );
  };

  const removeOverlay = (id: string) => {
    onOverlaysChange(overlays.filter((o) => o.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (id: string) => {
    dragCounter.current++;
    setDragOverId(id);
  };

  const handleDragLeave = () => {
    dragCounter.current--;
    if (dragCounter.current === 0) setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDragOverId(null);
    if (!dragId || dragId === targetId) { setDragId(null); return; }
    const fromIndex = overlays.findIndex((o) => o.id === dragId);
    const toIndex = overlays.findIndex((o) => o.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;
    const updated = [...overlays];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onOverlaysChange(updated);
    setDragId(null);
  };

  const handleDragEnd = () => {
    setDragId(null);
    setDragOverId(null);
    dragCounter.current = 0;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Text Overlays</h3>
          {overlays.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
              {overlays.length}
            </span>
          )}
        </div>
        <button
          onClick={addOverlay}
          className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md transition-all"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add
        </button>
      </div>

      {overlays.length === 0 && (
        <p className="text-[11px] text-center py-3" style={{ color: 'var(--text-muted)' }}>
          No text overlays. Click &quot;Add&quot; to start.
        </p>
      )}

      <div className="space-y-1.5">
        {overlays.map((overlay) => (
          <div
            key={overlay.id}
            draggable
            onDragStart={(e) => handleDragStart(e, overlay.id)}
            onDragOver={handleDragOver}
            onDragEnter={() => handleDragEnter(overlay.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, overlay.id)}
            onDragEnd={handleDragEnd}
            className="rounded-lg overflow-hidden transition-all"
            style={{
              background: 'var(--bg-elevated)',
              border: `1px solid ${dragOverId === overlay.id ? 'var(--accent)' : 'var(--border-subtle)'}`,
              opacity: dragId === overlay.id ? 0.5 : 1,
            }}
          >
            <button
              onClick={() => setActiveId(activeId === overlay.id ? null : overlay.id)}
              className="w-full flex items-center justify-between px-3 py-2 text-left transition-colors"
            >
              <span className="text-[11px] truncate max-w-[140px]" style={{ color: 'var(--text-secondary)' }}>
                &quot;{overlay.text}&quot;
              </span>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: overlay.color, border: '1px solid var(--border-active)' }} />
                <button
                  onClick={(e) => { e.stopPropagation(); removeOverlay(overlay.id); }}
                  className="p-0.5 rounded transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </button>

            {activeId === overlay.id && (
              <div className="px-3 pb-3 space-y-2.5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <div className="mt-2">
                  <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>Text</label>
                  <input
                    type="text"
                    value={overlay.text}
                    onChange={(e) => updateOverlay(overlay.id, { text: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-md text-[11px] outline-none transition-colors"
                    style={{ background: 'var(--bg-panel)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                  />
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>Color</label>
                    <input
                      type="color"
                      value={overlay.color}
                      onChange={(e) => updateOverlay(overlay.id, { color: e.target.value })}
                      className="w-full h-7 rounded-md cursor-pointer"
                      style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)' }}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>Size: {overlay.fontSize}px</label>
                    <input type="range" min={12} max={72} value={overlay.fontSize}
                      onChange={(e) => updateOverlay(overlay.id, { fontSize: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Font Family */}
                <div>
                  <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>Font</label>
                  <select
                    value={overlay.fontFamily || 'inter'}
                    onChange={(e) => updateOverlay(overlay.id, { fontFamily: e.target.value as FontFamily })}
                    className="w-full px-2.5 py-1.5 rounded-md text-[11px] outline-none"
                    style={{ background: 'var(--bg-panel)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>

                {/* Animation */}
                <div>
                  <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>Animation</label>
                  <select
                    value={overlay.animation || 'none'}
                    onChange={(e) => updateOverlay(overlay.id, { animation: e.target.value as TextAnimation })}
                    className="w-full px-2.5 py-1.5 rounded-md text-[11px] outline-none"
                    style={{ background: 'var(--bg-panel)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                  >
                    {ANIMATION_OPTIONS.map((a) => (
                      <option key={a.value} value={a.value}>{a.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>X: {overlay.x}%</label>
                    <input type="range" min={0} max={100} value={overlay.x}
                      onChange={(e) => updateOverlay(overlay.id, { x: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>Y: {overlay.y}%</label>
                    <input type="range" min={0} max={100} value={overlay.y}
                      onChange={(e) => updateOverlay(overlay.id, { y: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>

                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Drag text directly on the video preview
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
