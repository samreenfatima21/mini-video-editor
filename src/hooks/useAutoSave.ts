"use client";

import { useEffect, useCallback } from "react";
import type { AutoSaveData } from "@/types/editor";

const STORAGE_KEY = "framecut-autosave";
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

export function useAutoSave(getData: () => AutoSaveData | null, hasVideo: boolean) {
  // Auto-save every 30 seconds when a video is loaded
  useEffect(() => {
    if (!hasVideo) return;

    const interval = setInterval(() => {
      const data = getData();
      if (data) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch {
          // Ignore quota errors
        }
      }
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [hasVideo, getData]);

  const loadSaved = useCallback((): AutoSaveData | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // Ignore parse errors
    }
    return null;
  }, []);

  const clearSaved = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore errors
    }
  }, []);

  const hasSavedData = useCallback((): boolean => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== null;
    } catch {
      return false;
    }
  }, []);

  return { loadSaved, clearSaved, hasSavedData };
}
