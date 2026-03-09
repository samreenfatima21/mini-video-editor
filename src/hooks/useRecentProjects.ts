"use client";

import { useState, useCallback, useEffect } from "react";
import type { RecentProject } from "@/types/editor";

const STORAGE_KEY = "framecut-recent-projects";
const MAX_PROJECTS = 10;

export function useRecentProjects() {
  const [projects, setProjects] = useState<RecentProject[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setProjects(JSON.parse(stored));
    } catch {
      // Ignore parse errors
    }
  }, []);

  const save = useCallback((list: RecentProject[]) => {
    setProjects(list);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Ignore quota errors
    }
  }, []);

  const addProject = useCallback(
    (name: string, fileName: string) => {
      const existing = projects.filter((p) => p.fileName !== fileName);
      const newProject: RecentProject = {
        id: Date.now().toString(),
        name,
        fileName,
        lastModified: Date.now(),
      };
      const updated = [newProject, ...existing].slice(0, MAX_PROJECTS);
      save(updated);
    },
    [projects, save]
  );

  const removeProject = useCallback(
    (id: string) => {
      save(projects.filter((p) => p.id !== id));
    },
    [projects, save]
  );

  const clearAll = useCallback(() => {
    save([]);
  }, [save]);

  return { projects, addProject, removeProject, clearAll };
}
