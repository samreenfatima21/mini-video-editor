"use client";

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { keys: ["Space"], description: "Play / Pause" },
  { keys: ["\u2190"], description: "Seek back 5s" },
  { keys: ["\u2192"], description: "Seek forward 5s" },
  { keys: [","], description: "Previous frame" },
  { keys: ["."], description: "Next frame" },
  { keys: ["\u2191"], description: "Volume up" },
  { keys: ["\u2193"], description: "Volume down" },
  { keys: ["M"], description: "Toggle mute" },
  { keys: ["S"], description: "Split clip at playhead" },
  { keys: ["Ctrl", "D"], description: "Duplicate selected clip" },
  { keys: ["Ctrl", "Z"], description: "Undo" },
  { keys: ["Ctrl", "Shift", "Z"], description: "Redo" },
  { keys: ["Ctrl", "+"], description: "Zoom timeline in" },
  { keys: ["Ctrl", "-"], description: "Zoom timeline out" },
  { keys: ["Ctrl", "S"], description: "Save project" },
  { keys: ["?"], description: "Show shortcuts" },
];

export default function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
        style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-active)' }}
      >
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" style={{ color: 'var(--accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4 space-y-2">
          {SHORTCUTS.map((shortcut) => (
            <div
              key={shortcut.description}
              className="flex items-center justify-between py-2"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, i) => (
                  <span key={i}>
                    <kbd
                      className="px-2 py-1 rounded-md text-xs font-mono"
                      style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                    >
                      {key}
                    </kbd>
                    {i < shortcut.keys.length - 1 && (
                      <span className="text-xs mx-0.5" style={{ color: 'var(--text-muted)' }}>+</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 text-center" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Press{' '}
            <kbd
              className="px-1.5 py-0.5 rounded text-[10px] font-mono"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
            >
              ?
            </kbd>
            {' '}to toggle
          </span>
        </div>
      </div>
    </div>
  );
}
