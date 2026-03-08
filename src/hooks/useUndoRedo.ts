"use client";

// useUndoRedo — tracks state history so users can undo/redo changes.
// Works with any state type. Keeps last 20 states in memory.

import { useState, useCallback, useEffect } from "react";

interface UndoRedoReturn<T> {
  pushState: (state: T) => void;
  undo: () => T | null;
  redo: () => T | null;
  canUndo: boolean;
  canRedo: boolean;
}

export function useUndoRedo<T>(maxHistory: number = 20): UndoRedoReturn<T> {
  const [past, setPast] = useState<T[]>([]);
  const [future, setFuture] = useState<T[]>([]);

  const pushState = useCallback(
    (state: T) => {
      setPast((prev) => {
        const newPast = [...prev, state];
        // Keep only the last maxHistory states
        if (newPast.length > maxHistory) {
          return newPast.slice(newPast.length - maxHistory);
        }
        return newPast;
      });
      // Any new change clears the redo stack
      setFuture([]);
    },
    [maxHistory]
  );

  const undo = useCallback((): T | null => {
    if (past.length === 0) return null;

    const newPast = [...past];
    const previousState = newPast.pop()!;

    setPast(newPast);
    setFuture((prev) => [previousState, ...prev]);

    // Return the state to restore (the one before the popped one)
    return newPast.length > 0 ? newPast[newPast.length - 1] : null;
  }, [past]);

  const redo = useCallback((): T | null => {
    if (future.length === 0) return null;

    const newFuture = [...future];
    const nextState = newFuture.shift()!;

    setFuture(newFuture);
    setPast((prev) => [...prev, nextState]);

    return nextState;
  }, [future]);

  // Keyboard shortcuts: Ctrl+Z for undo, Ctrl+Shift+Z for redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  return {
    pushState,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}
