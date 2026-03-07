"use client";

// This is a "custom hook" — a reusable piece of logic.
// It manages ALL the editor state (what video is loaded, trim points, filters, etc.)
// Think of it as the "brain" of our editor.

import { useState, useCallback } from "react";
import type { EditorState, VideoFile, FilterSettings, TextOverlay } from "@/types/editor";

// Default values when the editor first loads
const initialState: EditorState = {
  video: null,
  trim: { start: 0, end: 0 },
  textOverlays: [],
  filters: { brightness: 100, contrast: 100, grayscale: 0 },
  isProcessing: false,
  isFFmpegReady: false,
};

export function useVideoEditor() {
  // useState stores data that, when changed, causes the UI to update
  const [state, setState] = useState<EditorState>(initialState);

  // useCallback prevents this function from being recreated every render
  // (a performance optimization — don't worry about it too much for now)
  const setVideo = useCallback((file: File) => {
    // URL.createObjectURL creates a temporary URL that points to the file
    // in memory, so the <video> element can play it
    const url = URL.createObjectURL(file);
    const video: VideoFile = {
      file,
      url,
      name: file.name,
    };
    setState((prev) => ({ ...prev, video }));
  }, []);

  const removeVideo = useCallback(() => {
    // Clean up the temporary URL to free memory
    if (state.video?.url) {
      URL.revokeObjectURL(state.video.url);
    }
    setState(initialState);
  }, [state.video?.url]);

  const setTrim = useCallback((start: number, end: number) => {
    setState((prev) => ({ ...prev, trim: { start, end } }));
  }, []);

  const setFilters = useCallback((filters: FilterSettings) => {
    setState((prev) => ({ ...prev, filters }));
  }, []);

  const setProcessing = useCallback((isProcessing: boolean) => {
    setState((prev) => ({ ...prev, isProcessing }));
  }, []);

  const setFFmpegReady = useCallback((isFFmpegReady: boolean) => {
    setState((prev) => ({ ...prev, isFFmpegReady }));
  }, []);

  const setTextOverlays = useCallback((textOverlays: TextOverlay[]) => {
    setState((prev) => ({ ...prev, textOverlays }));
  }, []);

  // Return the state and all the functions to modify it
  return {
    state,
    setVideo,
    removeVideo,
    setTrim,
    setFilters,
    setProcessing,
    setFFmpegReady,
    setTextOverlays,
  };
}
