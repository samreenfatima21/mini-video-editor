"use client";

import type { SidebarTab } from "./LeftSidebar";

interface RightPropertiesPanelProps {
  activeTab: SidebarTab;
  videoName: string;
  duration: number;
  currentTime: number;
  fileSize?: number;
  clipCount?: number;
  clipIndex?: number;
}

export default function RightPropertiesPanel({
  activeTab,
  videoName,
  duration,
  currentTime,
  fileSize,
  clipCount = 1,
  clipIndex = 1,
}: RightPropertiesPanelProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const tabTitles: Record<string, string> = {
    trim: 'Trim Properties',
    filters: 'Filter Properties',
    text: 'Text Properties',
    crop: 'Crop Properties',
    watermark: 'Watermark Properties',
    speed: 'Speed Properties',
    export: 'Export Properties',
  };

  return (
    <div className="properties-region p-3">
      <h3
        className="text-xs font-semibold uppercase tracking-wider mb-4 px-1"
        style={{ color: 'var(--text-muted)' }}
      >
        {activeTab ? tabTitles[activeTab] || 'Properties' : 'Project Info'}
      </h3>

      {/* Project info — always visible */}
      <div className="space-y-2">
        <div
          className="rounded-lg p-3"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="space-y-2.5">
            <div className="flex justify-between">
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>File</span>
              <span className="text-[11px] truncate max-w-[150px]" style={{ color: 'var(--text-secondary)' }}>
                {videoName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Duration</span>
              <span className="text-[11px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                {formatTime(duration)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Current</span>
              <span className="text-[11px] font-mono" style={{ color: 'var(--text-primary)' }}>
                {formatTime(currentTime)}
              </span>
            </div>
            {fileSize !== undefined && fileSize > 0 && (
              <div className="flex justify-between">
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Size</span>
                <span className="text-[11px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                  {formatFileSize(fileSize)}
                </span>
              </div>
            )}
            {clipCount > 1 && (
              <div className="flex justify-between">
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Clip</span>
                <span className="text-[11px] font-mono" style={{ color: 'var(--accent)' }}>
                  {clipIndex} of {clipCount}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Hint text */}
        {!activeTab && (
          <p className="text-[11px] px-1 mt-3" style={{ color: 'var(--text-muted)' }}>
            Select a tool from the sidebar to edit your video.
          </p>
        )}

        {/* Keyboard shortcuts reference */}
        <div className="mt-4 px-1">
          <h4 className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
            Shortcuts
          </h4>
          <div className="space-y-1.5">
            {[
              { key: "Space", label: "Play/Pause" },
              { key: "F", label: "Fullscreen" },
              { key: "M", label: "Mute" },
              { key: "?", label: "All shortcuts" },
            ].map((s) => (
              <div key={s.key} className="flex items-center justify-between">
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.label}</span>
                <kbd
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                  style={{
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
