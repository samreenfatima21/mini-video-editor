# Mini Video Editor

A browser-based mini video editor built as a learning project.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Video Processing**: FFmpeg.wasm (runs in browser, no backend needed)
- **State Management**: React useState/useContext (keep it simple)
- **Deployment**: Vercel

## Project Goals

This is a **learning project** for a beginner. Prioritize:
1. Clear, readable code with comments explaining "why"
2. One feature at a time — don't build everything at once
3. Simple over clever — no premature abstractions
4. Working > perfect

## Features (Build Order)

1. Upload a video file
2. Video player with playback controls
3. Trim/cut video (set start and end points)
4. Add text overlays
5. Apply basic filters (brightness, contrast, grayscale)
6. Simple timeline UI
7. Export/download edited video

## Architecture

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main editor page
├── components/             # React components
│   ├── VideoUploader.tsx   # File upload
│   ├── VideoPlayer.tsx     # Video preview/playback
│   ├── Timeline.tsx        # Simple timeline
│   ├── TrimControls.tsx    # Start/end point controls
│   ├── TextOverlay.tsx     # Text overlay editor
│   ├── FilterPanel.tsx     # Filter controls
│   └── ExportButton.tsx    # Export/download
├── hooks/                  # Custom React hooks
│   └── useVideoEditor.ts  # Core editor state and logic
├── lib/                    # Utilities
│   └── ffmpeg.ts           # FFmpeg.wasm setup and helpers
└── types/                  # TypeScript types
    └── editor.ts           # Editor-related types
```

## Conventions

- Components: PascalCase (`VideoPlayer.tsx`)
- Hooks: camelCase with `use` prefix (`useVideoEditor.ts`)
- One component per file
- Props interfaces defined above the component
- Use `"use client"` directive for interactive components

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Build for production
- `npm run lint` — Run linter
- `npm test` — Run tests

## Important Notes

- FFmpeg.wasm requires specific Next.js config for WASM + SharedArrayBuffer
- Must set COOP/COEP headers for SharedArrayBuffer support
- Keep video files small during development (< 50MB)
- Test with short clips (5-10 seconds) to speed up iteration
