// All the types (shapes of data) our editor uses.
// Think of types like blueprints — they describe what data looks like.

export interface VideoFile {
  // The actual file the user uploaded
  file: File;
  // A temporary URL so the browser can play the video
  url: string;
  // Video filename for display
  name: string;
}

export interface TrimSettings {
  // Where to start the clip (in seconds)
  start: number;
  // Where to end the clip (in seconds)
  end: number;
}

export interface TextOverlay {
  // Unique ID for this text overlay
  id: string;
  // The text to display
  text: string;
  // Position on the video (0-100 percentage)
  x: number;
  y: number;
  // Font size in pixels
  fontSize: number;
  // Text color
  color: string;
}

export interface FilterSettings {
  // 0-200, where 100 is normal
  brightness: number;
  // 0-200, where 100 is normal
  contrast: number;
  // 0-100, where 0 is full color and 100 is fully grayscale
  grayscale: number;
}

// The complete state of our editor
export interface EditorState {
  // The video the user uploaded (null if nothing uploaded yet)
  video: VideoFile | null;
  // Trim start/end points
  trim: TrimSettings;
  // All text overlays on the video
  textOverlays: TextOverlay[];
  // Filter settings
  filters: FilterSettings;
  // Is FFmpeg currently processing something?
  isProcessing: boolean;
  // Is FFmpeg loaded and ready?
  isFFmpegReady: boolean;
}
