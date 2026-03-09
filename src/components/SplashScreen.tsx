"use client";

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      {/* Animated logo */}
      <div className="relative w-20 h-20 mb-6">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500 via-violet-500 to-purple-600 opacity-30 blur-xl animate-pulse" />
        <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-2xl">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        </div>
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
        Frame<span style={{ color: 'var(--accent)' }}>Cut</span>
      </h1>

      <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Initializing video engine...</p>

      {/* Loading spinner */}
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 animate-spin" style={{ color: 'var(--accent)' }} fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Loading FFmpeg...</span>
      </div>
    </div>
  );
}
