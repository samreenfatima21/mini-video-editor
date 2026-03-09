// All the types (shapes of data) our editor uses.

export interface VideoFile {
  file: File;
  url: string;
  name: string;
}

export interface TrimSettings {
  start: number;
  end: number;
}

// --- Font types ---
export type FontFamily = 'inter' | 'roboto-mono' | 'playfair' | 'oswald' | 'dancing-script' | 'bebas-neue';

// --- Text animation types ---
export type TextAnimation = 'none' | 'fade-in' | 'typewriter' | 'slide-in' | 'pop';

export interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: FontFamily;
  animation: TextAnimation;
  animationStartTime?: number;
  animationDuration?: number;
  // Styling
  strokeColor?: string;
  strokeWidth?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowBlur?: number;
  shadowColor?: string;
  backgroundColor?: string;
  backgroundPadding?: number;
  letterSpacing?: number;
}

export interface FilterSettings {
  brightness: number;
  contrast: number;
  grayscale: number;
  saturation: number;
  hueRotate: number;
  temperature: number;
}

export type PlaybackSpeed = 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2;

export interface AudioSettings {
  muted: boolean;
  volume: number;
  fadeIn: number;
  fadeOut: number;
}

// --- Transition types ---

export type TransitionType =
  | "none"
  | "dissolve"
  | "fade"
  | "fadeblack"
  | "fadewhite"
  | "wipeleft"
  | "wiperight"
  | "wipeup"
  | "wipedown"
  | "slideleft"
  | "slideright"
  | "slideup"
  | "slidedown"
  | "zoomin";

export interface ClipTransition {
  type: TransitionType;
  duration: number; // 0.3–2.0 seconds
}

export const TRANSITION_PRESETS: readonly { type: TransitionType; label: string; category: string }[] = [
  { type: "none", label: "None", category: "basic" },
  { type: "dissolve", label: "Dissolve", category: "basic" },
  { type: "zoomin", label: "Zoom In", category: "basic" },
  { type: "fade", label: "Fade", category: "fade" },
  { type: "fadeblack", label: "Black", category: "fade" },
  { type: "fadewhite", label: "White", category: "fade" },
  { type: "wipeleft", label: "Left", category: "wipe" },
  { type: "wiperight", label: "Right", category: "wipe" },
  { type: "wipeup", label: "Up", category: "wipe" },
  { type: "wipedown", label: "Down", category: "wipe" },
  { type: "slideleft", label: "Left", category: "slide" },
  { type: "slideright", label: "Right", category: "slide" },
  { type: "slideup", label: "Up", category: "slide" },
  { type: "slidedown", label: "Down", category: "slide" },
];

// --- Transform types ---
export type RotationDegrees = 0 | 90 | 180 | 270;

export interface TransformSettings {
  rotation: RotationDegrees;
  flipH: boolean;
  flipV: boolean;
}

// --- Pan & Zoom types ---
export interface PanZoomKeyframe {
  scale: number;
  x: number;
  y: number;
}

export type EasingType = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';

export interface PanZoomSettings {
  enabled: boolean;
  startKeyframe: PanZoomKeyframe;
  endKeyframe: PanZoomKeyframe;
  easing: EasingType;
}

// --- Sticker types ---
export type StickerType = 'emoji' | 'image' | 'shape';

export interface StickerOverlay {
  id: string;
  type: StickerType;
  value: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
}

// --- Chroma Key (Green Screen) ---
export interface ChromaKeySettings {
  enabled: boolean;
  color: string;
  similarity: number;
  blend: number;
}

// --- Speed Ramp ---
export type SpeedRampPreset = 'none' | 'ramp-up' | 'ramp-down' | 'slow-mo-burst';

export interface SpeedRampSettings {
  preset: SpeedRampPreset;
}

// --- Timeline clip ---

export interface TimelineClip {
  id: string;
  video: VideoFile;
  trim: TrimSettings;
  filters: FilterSettings;
  textOverlays: TextOverlay[];
  playbackSpeed: PlaybackSpeed;
  audio: AudioSettings;
  transition: ClipTransition | null; // null for first clip
  transform: TransformSettings;
  panZoom: PanZoomSettings;
  stickerOverlays: StickerOverlay[];
  chromaKey: ChromaKeySettings | null;
  speedRamp: SpeedRampSettings;
}

// --- Legacy transition settings (kept for global fade in/out) ---

export interface TransitionSettings {
  fadeIn: number;
  fadeOut: number;
}

// Aspect ratio presets
export type AspectRatioPreset = "16:9" | "9:16" | "1:1" | "4:5" | "4:3" | "original";

export interface CropSettings {
  preset: AspectRatioPreset;
}

export interface WatermarkSettings {
  enabled: boolean;
  text: string;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  opacity: number;
  fontSize: number;
  color: string;
}

export type ExportQuality = "720p" | "1080p" | "original";

// --- Background Music ---
export interface BackgroundMusic {
  file: File;
  fileName: string;
  url: string;
  volume: number;
  startOffset: number;
  loop: boolean;
  fadeIn: number;
  fadeOut: number;
}

// --- Captions / Subtitles ---
export interface Caption {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
}

export interface CaptionStyle {
  fontSize: number;
  fontColor: string;
  backgroundColor: string;
  position: 'bottom' | 'top';
}

export interface CaptionSettings {
  captions: Caption[];
  enabled: boolean;
  style: CaptionStyle;
}

export type ThemeMode = "dark" | "light";

export interface RecentProject {
  id: string;
  name: string;
  fileName: string;
  lastModified: number;
  thumbnail?: string;
}

export interface AutoSaveData {
  projectName: string;
  filters: FilterSettings;
  textOverlays: TextOverlay[];
  trim: TrimSettings;
  playbackSpeed: PlaybackSpeed;
  audio: AudioSettings;
  transitions: TransitionSettings;
  crop: CropSettings;
  watermark: WatermarkSettings;
  exportQuality: ExportQuality;
  savedAt: number;
}

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

// The complete state of our editor
export interface EditorState {
  clips: TimelineClip[];
  selectedClipId: string | null;
  // Global settings
  crop: CropSettings;
  watermark: WatermarkSettings;
  exportQuality: ExportQuality;
  isProcessing: boolean;
  isFFmpegReady: boolean;
  // Global fade in/out (intro/outro)
  globalFadeIn: number;
  globalFadeOut: number;
  // Background music (global)
  backgroundMusic: BackgroundMusic | null;
  // Captions / subtitles (global)
  captionSettings: CaptionSettings;
}

// Average speed multiplier for speed ramp presets
const RAMP_AVG_SPEED: Record<SpeedRampPreset, number> = {
  'none': 1,
  'ramp-up': 1.25,      // avg of 0.5x→2x
  'ramp-down': 1.25,    // avg of 2x→0.5x
  'slow-mo-burst': 0.77, // avg of 1x→0.3x→1x
};

// Helper to compute effective clip duration
export function getEffectiveDuration(clip: TimelineClip): number {
  const trimmed = clip.trim.end - clip.trim.start;
  if (trimmed <= 0) return 0;
  const speedRampFactor = clip.speedRamp?.preset && clip.speedRamp.preset !== 'none'
    ? RAMP_AVG_SPEED[clip.speedRamp.preset]
    : 1;
  return trimmed / (clip.playbackSpeed * speedRampFactor);
}

// Find which clip is at a given global time, and the local time within that clip
export function findClipAtTime(clips: TimelineClip[], globalTime: number): { clipIndex: number; localTime: number } | null {
  let elapsed = 0;
  for (let i = 0; i < clips.length; i++) {
    const dur = getEffectiveDuration(clips[i]);
    const overlap = i > 0 && clips[i].transition && clips[i].transition!.type !== "none"
      ? clips[i].transition!.duration
      : 0;
    const start = elapsed - overlap;
    const end = start + dur;
    if (globalTime >= start && globalTime < end) {
      return { clipIndex: i, localTime: globalTime - start };
    }
    elapsed = start + dur;
  }
  return null;
}

// Compute total timeline duration across all clips
export function getTotalDuration(clips: TimelineClip[]): number {
  return clips.reduce((sum, clip, i) => {
    const dur = getEffectiveDuration(clip);
    const overlap = i > 0 && clip.transition && clip.transition.type !== "none"
      ? clip.transition.duration
      : 0;
    return sum + dur - overlap;
  }, 0);
}
