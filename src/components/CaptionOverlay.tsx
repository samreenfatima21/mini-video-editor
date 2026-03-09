"use client";

import type { CaptionSettings } from "@/types/editor";

interface CaptionOverlayProps {
  captionSettings: CaptionSettings;
  currentTime: number;
}

export default function CaptionOverlay({ captionSettings, currentTime }: CaptionOverlayProps) {
  if (!captionSettings.enabled) return null;

  const activeCaption = captionSettings.captions.find(
    (c) => currentTime >= c.startTime && currentTime <= c.endTime
  );

  if (!activeCaption) return null;

  const { style } = captionSettings;

  return (
    <div
      className="absolute left-0 right-0 flex justify-center pointer-events-none px-4"
      style={{ [style.position === 'top' ? 'top' : 'bottom']: '16px' }}
    >
      <div
        className="px-4 py-2 rounded-lg max-w-[80%] text-center"
        style={{
          fontSize: `${style.fontSize}px`,
          color: style.fontColor,
          backgroundColor: style.backgroundColor,
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
        }}
      >
        {activeCaption.text}
      </div>
    </div>
  );
}
