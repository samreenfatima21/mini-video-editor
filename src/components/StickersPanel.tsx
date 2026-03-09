"use client";

import { useState } from "react";
import type { StickerOverlay } from "@/types/editor";
import { EMOJI_CATEGORIES, SHAPE_STICKERS } from "@/data/stickerLibrary";
import ShapeRenderer from "./ShapeRenderer";

interface StickersPanelProps {
  stickers: StickerOverlay[];
  onAddSticker: (sticker: StickerOverlay) => void;
  onUpdateSticker: (id: string, changes: Partial<StickerOverlay>) => void;
  onRemoveSticker: (id: string) => void;
}

type StickerTab = 'emoji' | 'shapes';

export default function StickersPanel({
  stickers,
  onAddSticker,
  onUpdateSticker,
  onRemoveSticker,
}: StickersPanelProps) {
  const [tab, setTab] = useState<StickerTab>('emoji');
  const [emojiCategory, setEmojiCategory] = useState(Object.keys(EMOJI_CATEGORIES)[0]);
  const [activeStickerId, setActiveStickerId] = useState<string | null>(null);

  const addEmoji = (emoji: string) => {
    onAddSticker({
      id: `sticker-${Date.now()}`,
      type: 'emoji',
      value: emoji,
      x: 50,
      y: 50,
      scale: 1,
      rotation: 0,
      opacity: 1,
    });
  };

  const addShape = (shapeId: string) => {
    onAddSticker({
      id: `sticker-${Date.now()}`,
      type: 'shape',
      value: shapeId,
      x: 50,
      y: 50,
      scale: 1,
      rotation: 0,
      opacity: 1,
    });
  };

  return (
    <div className="w-full">
      <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Stickers</h3>

      {/* Tab picker */}
      <div className="flex gap-1 mb-3">
        {(['emoji', 'shapes'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-1.5 rounded-md text-[11px] font-medium transition-all capitalize"
            style={{
              background: tab === t ? 'var(--accent-bg)' : 'var(--bg-elevated)',
              color: tab === t ? 'var(--accent)' : 'var(--text-secondary)',
              border: `1px solid ${tab === t ? 'var(--accent)' : 'var(--border-subtle)'}`,
            }}
          >
            {t === 'emoji' ? 'Emoji' : 'Shapes'}
          </button>
        ))}
      </div>

      {/* Emoji tab */}
      {tab === 'emoji' && (
        <div>
          <select
            value={emojiCategory}
            onChange={(e) => setEmojiCategory(e.target.value)}
            className="w-full px-2 py-1.5 rounded-md text-[11px] outline-none mb-2"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
          >
            {Object.keys(EMOJI_CATEGORIES).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div className="grid grid-cols-7 gap-1">
            {EMOJI_CATEGORIES[emojiCategory]?.map((emoji, i) => (
              <button
                key={i}
                onClick={() => addEmoji(emoji)}
                className="w-full aspect-square flex items-center justify-center text-lg rounded-md transition-all hover:scale-110"
                style={{ background: 'var(--bg-elevated)' }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Shapes tab */}
      {tab === 'shapes' && (
        <div className="grid grid-cols-4 gap-1.5">
          {SHAPE_STICKERS.map((shape) => (
            <button
              key={shape.id}
              onClick={() => addShape(shape.id)}
              className="flex flex-col items-center gap-1 py-2 rounded-md transition-all"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
            >
              <ShapeRenderer shape={shape.id} size={24} />
              <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{shape.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Active stickers list */}
      {stickers.length > 0 && (
        <div className="mt-3">
          <label className="text-[10px] uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Active ({stickers.length})
          </label>
          <div className="space-y-1.5">
            {stickers.map((s) => (
              <div key={s.id} className="rounded-lg overflow-hidden"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                <button
                  onClick={() => setActiveStickerId(activeStickerId === s.id ? null : s.id)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-left"
                >
                  <span className="text-sm">
                    {s.type === 'emoji' ? s.value : s.type === 'shape' ? s.value : s.value}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemoveSticker(s.id); }}
                    className="p-0.5" style={{ color: 'var(--text-muted)' }}
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </button>
                {activeStickerId === s.id && (
                  <div className="px-3 pb-2 space-y-1.5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <div className="pt-1.5">
                      <div className="flex justify-between text-[10px]">
                        <span style={{ color: 'var(--text-muted)' }}>Scale</span>
                        <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{s.scale.toFixed(1)}x</span>
                      </div>
                      <input type="range" min={0.2} max={3} step={0.1} value={s.scale}
                        onChange={(e) => onUpdateSticker(s.id, { scale: parseFloat(e.target.value) })} className="w-full" />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px]">
                        <span style={{ color: 'var(--text-muted)' }}>Opacity</span>
                        <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{Math.round(s.opacity * 100)}%</span>
                      </div>
                      <input type="range" min={0} max={1} step={0.05} value={s.opacity}
                        onChange={(e) => onUpdateSticker(s.id, { opacity: parseFloat(e.target.value) })} className="w-full" />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px]">
                        <span style={{ color: 'var(--text-muted)' }}>Rotation</span>
                        <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{s.rotation}°</span>
                      </div>
                      <input type="range" min={0} max={360} value={s.rotation}
                        onChange={(e) => onUpdateSticker(s.id, { rotation: parseInt(e.target.value) })} className="w-full" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
