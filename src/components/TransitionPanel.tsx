"use client";

import type { TimelineClip, ClipTransition, TransitionType } from "@/types/editor";
import { TRANSITION_PRESETS } from "@/types/editor";

interface TransitionPanelProps {
  clips: TimelineClip[];
  onTransitionChange: (clipId: string, transition: ClipTransition | null) => void;
  selectedClipId: string | null;
}

const CATEGORIES = ["basic", "fade", "wipe", "slide"];
const CATEGORY_LABELS: Record<string, string> = {
  basic: "Basic",
  fade: "Fade",
  wipe: "Wipe",
  slide: "Slide",
};

export default function TransitionPanel({
  clips,
  onTransitionChange,
  selectedClipId,
}: TransitionPanelProps) {
  // Find the clip whose transition we're editing (default to selected clip if it has a transition)
  const editableClips = clips.filter((_, i) => i > 0); // first clip can't have a transition
  const activeClip = editableClips.find((c) => c.id === selectedClipId) ?? editableClips[0] ?? null;

  if (clips.length < 2) {
    return (
      <div className="w-full">
        <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Transitions</h3>
        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
          Add at least 2 clips to use transitions.
        </p>
      </div>
    );
  }

  if (!activeClip) return null;

  const currentTransition = activeClip.transition ?? { type: "none" as TransitionType, duration: 0.5 };
  const clipIndex = clips.findIndex((c) => c.id === activeClip.id);
  const prevClip = clipIndex > 0 ? clips[clipIndex - 1] : null;

  const setType = (type: TransitionType) => {
    if (type === "none") {
      onTransitionChange(activeClip.id, { type: "none", duration: 0 });
    } else {
      onTransitionChange(activeClip.id, { type, duration: currentTransition.duration || 0.5 });
    }
  };

  const setDuration = (duration: number) => {
    onTransitionChange(activeClip.id, { ...currentTransition, duration });
  };

  const applyToAll = () => {
    for (const clip of editableClips) {
      onTransitionChange(clip.id, { ...currentTransition });
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Transitions</h3>

      {/* Clip pair selector */}
      {editableClips.length > 1 && (
        <div className="mb-3">
          <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>Between</label>
          <select
            value={activeClip.id}
            onChange={(e) => {
              // We use onTransitionChange indirectly — just select the clip
              const clip = clips.find((c) => c.id === e.target.value);
              if (clip) {
                // Can't change selection from here directly, but we show the right controls
              }
            }}
            className="w-full px-2 py-1.5 rounded-md text-[11px] outline-none"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
            disabled
          >
            {editableClips.map((clip, i) => {
              const idx = clips.indexOf(clip);
              return (
                <option key={clip.id} value={clip.id}>
                  Clip {idx} → Clip {idx + 1}
                </option>
              );
            })}
          </select>
          <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
            {prevClip ? `${prevClip.video.name} → ${activeClip.video.name}` : ''}
          </p>
        </div>
      )}

      {/* Transition type grid by category */}
      {CATEGORIES.map((cat) => {
        const presets = TRANSITION_PRESETS.filter((p) => p.category === cat);
        return (
          <div key={cat} className="mb-3">
            <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>
              {CATEGORY_LABELS[cat]}
            </label>
            <div className="grid grid-cols-3 gap-1">
              {presets.map((preset) => (
                <button
                  key={preset.type}
                  onClick={() => setType(preset.type)}
                  className="py-1.5 rounded-md text-[11px] font-medium transition-all"
                  style={{
                    background: currentTransition.type === preset.type ? 'var(--accent-bg)' : 'var(--bg-elevated)',
                    color: currentTransition.type === preset.type ? 'var(--accent)' : 'var(--text-secondary)',
                    border: currentTransition.type === preset.type ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {/* Duration slider */}
      {currentTransition.type !== "none" && (
        <div className="mb-3">
          <div className="flex justify-between text-[11px] mb-1">
            <span style={{ color: 'var(--text-muted)' }}>Duration</span>
            <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{currentTransition.duration.toFixed(1)}s</span>
          </div>
          <input
            type="range"
            min={0.3}
            max={2.0}
            step={0.1}
            value={currentTransition.duration}
            onChange={(e) => setDuration(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      )}

      {/* Apply to all */}
      {editableClips.length > 1 && currentTransition.type !== "none" && (
        <button
          onClick={applyToAll}
          className="w-full py-1.5 rounded-md text-[11px] font-medium transition-all"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
        >
          Apply to all transitions
        </button>
      )}
    </div>
  );
}
