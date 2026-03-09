"use client";

import { useState, useCallback, useMemo } from "react";
import type {
  EditorState,
  TimelineClip,
  FilterSettings,
  TextOverlay,
  PlaybackSpeed,
  AudioSettings,
  ClipTransition,
  CropSettings,
  WatermarkSettings,
  ExportQuality,
  TransformSettings,
  RotationDegrees,
  PanZoomSettings,
  StickerOverlay,
  BackgroundMusic,
  Caption,
  CaptionStyle,
  CaptionSettings,
} from "@/types/editor";
import { getTotalDuration } from "@/types/editor";

const defaultFilters: FilterSettings = { brightness: 100, contrast: 100, grayscale: 0 };
const defaultAudio: AudioSettings = { muted: false, volume: 1, fadeIn: 0, fadeOut: 0 };
const defaultTransform: TransformSettings = { rotation: 0, flipH: false, flipV: false };
const defaultPanZoom: PanZoomSettings = {
  enabled: false,
  startKeyframe: { scale: 1, x: 50, y: 50 },
  endKeyframe: { scale: 1, x: 50, y: 50 },
  easing: 'linear',
};
const defaultCaptionSettings: CaptionSettings = {
  captions: [],
  enabled: false,
  style: { fontSize: 24, fontColor: '#ffffff', backgroundColor: 'rgba(0,0,0,0.7)', position: 'bottom' },
};

const initialState: EditorState = {
  clips: [],
  selectedClipId: null,
  crop: { preset: "original" },
  watermark: {
    enabled: false,
    text: "FrameCut",
    position: "bottom-right",
    opacity: 50,
    fontSize: 24,
    color: "#ffffff",
  },
  exportQuality: "original",
  isProcessing: false,
  isFFmpegReady: false,
  globalFadeIn: 0,
  globalFadeOut: 0,
  backgroundMusic: null,
  captionSettings: { ...defaultCaptionSettings },
};

let clipCounter = 0;

export function useVideoEditor() {
  const [state, setState] = useState<EditorState>(initialState);

  // --- Clip management ---

  const addClip = useCallback((file: File): string => {
    const id = `clip-${Date.now()}-${clipCounter++}`;
    const url = URL.createObjectURL(file);
    const clip: TimelineClip = {
      id,
      video: { file, url, name: file.name },
      trim: { start: 0, end: 0 },
      filters: { ...defaultFilters },
      textOverlays: [],
      playbackSpeed: 1,
      audio: { ...defaultAudio },
      transition: null, // will be set below for non-first clips
      transform: { ...defaultTransform },
      panZoom: { ...defaultPanZoom },
      stickerOverlays: [],
    };

    setState((prev) => {
      const isFirst = prev.clips.length === 0;
      const newClip = isFirst
        ? clip
        : { ...clip, transition: { type: "dissolve" as const, duration: 0.5 } };
      return {
        ...prev,
        clips: [...prev.clips, newClip],
        selectedClipId: id,
      };
    });

    return id;
  }, []);

  const removeClip = useCallback((clipId: string) => {
    setState((prev) => {
      const idx = prev.clips.findIndex((c) => c.id === clipId);
      if (idx === -1) return prev;

      // Revoke URL
      URL.revokeObjectURL(prev.clips[idx].video.url);

      const newClips = prev.clips.filter((c) => c.id !== clipId);
      // If the removed clip was first, the new first clip should have no transition
      if (idx === 0 && newClips.length > 0) {
        newClips[0] = { ...newClips[0], transition: null };
      }

      const newSelected =
        prev.selectedClipId === clipId
          ? newClips.length > 0
            ? newClips[Math.min(idx, newClips.length - 1)].id
            : null
          : prev.selectedClipId;

      return { ...prev, clips: newClips, selectedClipId: newSelected };
    });
  }, []);

  const removeAllClips = useCallback(() => {
    setState((prev) => {
      prev.clips.forEach((c) => URL.revokeObjectURL(c.video.url));
      return { ...initialState };
    });
  }, []);

  const selectClip = useCallback((clipId: string) => {
    setState((prev) => ({ ...prev, selectedClipId: clipId }));
  }, []);

  const reorderClips = useCallback((fromIndex: number, toIndex: number) => {
    setState((prev) => {
      const newClips = [...prev.clips];
      const [moved] = newClips.splice(fromIndex, 1);
      newClips.splice(toIndex, 0, moved);
      // First clip should never have a transition
      if (newClips.length > 0) {
        newClips[0] = { ...newClips[0], transition: null };
        // Ensure non-first clips have a transition
        for (let i = 1; i < newClips.length; i++) {
          if (!newClips[i].transition) {
            newClips[i] = { ...newClips[i], transition: { type: "dissolve", duration: 0.5 } };
          }
        }
      }
      return { ...prev, clips: newClips };
    });
  }, []);

  // --- Per-clip setters (operate on selected clip) ---

  const updateSelectedClip = useCallback(
    (updater: (clip: TimelineClip) => TimelineClip) => {
      setState((prev) => {
        if (!prev.selectedClipId) return prev;
        return {
          ...prev,
          clips: prev.clips.map((c) =>
            c.id === prev.selectedClipId ? updater(c) : c
          ),
        };
      });
    },
    []
  );

  const setClipTrim = useCallback(
    (start: number, end: number) => updateSelectedClip((c) => ({ ...c, trim: { start, end } })),
    [updateSelectedClip]
  );

  const setClipFilters = useCallback(
    (filters: FilterSettings) => updateSelectedClip((c) => ({ ...c, filters })),
    [updateSelectedClip]
  );

  const setClipTextOverlays = useCallback(
    (textOverlays: TextOverlay[]) => updateSelectedClip((c) => ({ ...c, textOverlays })),
    [updateSelectedClip]
  );

  const setClipPlaybackSpeed = useCallback(
    (playbackSpeed: PlaybackSpeed) => updateSelectedClip((c) => ({ ...c, playbackSpeed })),
    [updateSelectedClip]
  );

  const setClipAudio = useCallback(
    (audio: AudioSettings) => updateSelectedClip((c) => ({ ...c, audio })),
    [updateSelectedClip]
  );

  const setClipTransition = useCallback(
    (clipId: string, transition: ClipTransition | null) => {
      setState((prev) => ({
        ...prev,
        clips: prev.clips.map((c) => (c.id === clipId ? { ...c, transition } : c)),
      }));
    },
    []
  );

  // --- Transform (rotate/flip) ---
  const rotateClip = useCallback(
    (direction: 'cw' | 'ccw') => updateSelectedClip((c) => {
      const steps: RotationDegrees[] = [0, 90, 180, 270];
      const idx = steps.indexOf(c.transform.rotation);
      const next = direction === 'cw'
        ? steps[(idx + 1) % 4]
        : steps[(idx + 3) % 4];
      return { ...c, transform: { ...c.transform, rotation: next } };
    }),
    [updateSelectedClip]
  );

  const toggleFlipH = useCallback(
    () => updateSelectedClip((c) => ({ ...c, transform: { ...c.transform, flipH: !c.transform.flipH } })),
    [updateSelectedClip]
  );

  const toggleFlipV = useCallback(
    () => updateSelectedClip((c) => ({ ...c, transform: { ...c.transform, flipV: !c.transform.flipV } })),
    [updateSelectedClip]
  );

  const resetTransform = useCallback(
    () => updateSelectedClip((c) => ({ ...c, transform: { ...defaultTransform } })),
    [updateSelectedClip]
  );

  // --- Pan & Zoom ---
  const setClipPanZoom = useCallback(
    (panZoom: PanZoomSettings) => updateSelectedClip((c) => ({ ...c, panZoom })),
    [updateSelectedClip]
  );

  // --- Stickers ---
  const addSticker = useCallback(
    (sticker: StickerOverlay) => updateSelectedClip((c) => ({
      ...c, stickerOverlays: [...c.stickerOverlays, sticker],
    })),
    [updateSelectedClip]
  );

  const updateSticker = useCallback(
    (stickerId: string, changes: Partial<StickerOverlay>) => updateSelectedClip((c) => ({
      ...c,
      stickerOverlays: c.stickerOverlays.map((s) => s.id === stickerId ? { ...s, ...changes } : s),
    })),
    [updateSelectedClip]
  );

  const removeSticker = useCallback(
    (stickerId: string) => updateSelectedClip((c) => ({
      ...c,
      stickerOverlays: c.stickerOverlays.filter((s) => s.id !== stickerId),
    })),
    [updateSelectedClip]
  );

  // Replaces setVideo for trim-complete (replaces the selected clip's file)
  const replaceClipVideo = useCallback((clipId: string, file: File) => {
    setState((prev) => {
      const clip = prev.clips.find((c) => c.id === clipId);
      if (clip) URL.revokeObjectURL(clip.video.url);
      const url = URL.createObjectURL(file);
      return {
        ...prev,
        clips: prev.clips.map((c) =>
          c.id === clipId
            ? { ...c, video: { file, url, name: file.name }, trim: { start: 0, end: 0 } }
            : c
        ),
      };
    });
  }, []);

  // --- Global setters ---

  const setCrop = useCallback((crop: CropSettings) => {
    setState((prev) => ({ ...prev, crop }));
  }, []);

  const setWatermark = useCallback((watermark: WatermarkSettings) => {
    setState((prev) => ({ ...prev, watermark }));
  }, []);

  const setExportQuality = useCallback((exportQuality: ExportQuality) => {
    setState((prev) => ({ ...prev, exportQuality }));
  }, []);

  const setProcessing = useCallback((isProcessing: boolean) => {
    setState((prev) => ({ ...prev, isProcessing }));
  }, []);

  const setGlobalFadeIn = useCallback((globalFadeIn: number) => {
    setState((prev) => ({ ...prev, globalFadeIn }));
  }, []);

  const setGlobalFadeOut = useCallback((globalFadeOut: number) => {
    setState((prev) => ({ ...prev, globalFadeOut }));
  }, []);

  // --- Background Music ---
  const setBackgroundMusic = useCallback((backgroundMusic: BackgroundMusic | null) => {
    setState((prev) => {
      if (prev.backgroundMusic?.url) URL.revokeObjectURL(prev.backgroundMusic.url);
      return { ...prev, backgroundMusic };
    });
  }, []);

  const updateBackgroundMusic = useCallback((changes: Partial<BackgroundMusic>) => {
    setState((prev) => {
      if (!prev.backgroundMusic) return prev;
      return { ...prev, backgroundMusic: { ...prev.backgroundMusic, ...changes } };
    });
  }, []);

  const removeBackgroundMusic = useCallback(() => {
    setState((prev) => {
      if (prev.backgroundMusic?.url) URL.revokeObjectURL(prev.backgroundMusic.url);
      return { ...prev, backgroundMusic: null };
    });
  }, []);

  // --- Captions ---
  const addCaption = useCallback((caption: Caption) => {
    setState((prev) => ({
      ...prev,
      captionSettings: {
        ...prev.captionSettings,
        captions: [...prev.captionSettings.captions, caption],
      },
    }));
  }, []);

  const updateCaption = useCallback((captionId: string, changes: Partial<Caption>) => {
    setState((prev) => ({
      ...prev,
      captionSettings: {
        ...prev.captionSettings,
        captions: prev.captionSettings.captions.map((c) =>
          c.id === captionId ? { ...c, ...changes } : c
        ),
      },
    }));
  }, []);

  const removeCaption = useCallback((captionId: string) => {
    setState((prev) => ({
      ...prev,
      captionSettings: {
        ...prev.captionSettings,
        captions: prev.captionSettings.captions.filter((c) => c.id !== captionId),
      },
    }));
  }, []);

  const setCaptionStyle = useCallback((style: CaptionStyle) => {
    setState((prev) => ({
      ...prev,
      captionSettings: { ...prev.captionSettings, style },
    }));
  }, []);

  const setCaptionsEnabled = useCallback((enabled: boolean) => {
    setState((prev) => ({
      ...prev,
      captionSettings: { ...prev.captionSettings, enabled },
    }));
  }, []);

  // --- Derived ---

  const selectedClip = useMemo(
    () => state.clips.find((c) => c.id === state.selectedClipId) ?? null,
    [state.clips, state.selectedClipId]
  );

  const totalDuration = useMemo(
    () => getTotalDuration(state.clips),
    [state.clips]
  );

  return {
    state,
    // Clip management
    addClip,
    removeClip,
    removeAllClips,
    selectClip,
    reorderClips,
    replaceClipVideo,
    // Per-clip setters
    setClipTrim,
    setClipFilters,
    setClipTextOverlays,
    setClipPlaybackSpeed,
    setClipAudio,
    setClipTransition,
    // Transform (rotate/flip)
    rotateClip,
    toggleFlipH,
    toggleFlipV,
    resetTransform,
    // Pan & Zoom
    setClipPanZoom,
    // Stickers
    addSticker,
    updateSticker,
    removeSticker,
    // Global setters
    setCrop,
    setWatermark,
    setExportQuality,
    setProcessing,
    setGlobalFadeIn,
    setGlobalFadeOut,
    // Background music
    setBackgroundMusic,
    updateBackgroundMusic,
    removeBackgroundMusic,
    // Captions
    addCaption,
    updateCaption,
    removeCaption,
    setCaptionStyle,
    setCaptionsEnabled,
    // Derived
    selectedClip,
    totalDuration,
  };
}
