"use client";

// useUndoRedo — tracks state history so users can undo/redo changes.
// Works with any state type. Keeps last 30 states in memory.

import { useState, useCallback } from "react";

interface UndoRedoReturn<T> {
  pushState: (state: T) => void;
  undo: () => T | null;
  redo: () => T | null;
  canUndo: boolean;
  canRedo: boolean;
}

export function useUndoRedo<T>(maxHistory: number = 30): UndoRedoReturn<T> {
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

  return {
    pushState,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}
