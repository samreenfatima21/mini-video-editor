"use client";

import { useCallback, useState, useEffect } from "react";
import type { EditorState } from "@/types/editor";

const DB_NAME = "framecut-projects";
const DB_VERSION = 1;
const META_STORE = "metadata";
const BLOB_STORE = "blobs";

export interface ProjectMetadata {
  id: string;
  name: string;
  savedAt: number;
  clipCount: number;
}

interface SavedProject {
  metadata: ProjectMetadata;
  state: Omit<EditorState, "isProcessing" | "isFFmpegReady">;
  videoFiles: { clipId: string; file: File }[];
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(BLOB_STORE)) {
        db.createObjectStore(BLOB_STORE, { keyPath: "id" });
      }
    };
  });
}

export function useProjectStorage() {
  const [projects, setProjects] = useState<ProjectMetadata[]>([]);

  const refreshList = useCallback(async () => {
    try {
      const db = await openDB();
      const tx = db.transaction(META_STORE, "readonly");
      const store = tx.objectStore(META_STORE);
      const request = store.getAll();
      return new Promise<ProjectMetadata[]>((resolve) => {
        request.onsuccess = () => {
          const list = (request.result as ProjectMetadata[]).sort(
            (a, b) => b.savedAt - a.savedAt
          );
          setProjects(list);
          resolve(list);
        };
        request.onerror = () => {
          setProjects([]);
          resolve([]);
        };
      });
    } catch {
      setProjects([]);
      return [];
    }
  }, []);

  useEffect(() => {
    refreshList();
  }, [refreshList]);

  const saveProject = useCallback(
    async (name: string, state: EditorState): Promise<string> => {
      const db = await openDB();
      const id = `proj-${Date.now()}`;

      // Extract video files from clips
      const videoFiles = state.clips.map((c) => ({
        clipId: c.id,
        file: c.video.file,
      }));

      // Create serializable state (strip File objects and blob URLs)
      const { isProcessing, isFFmpegReady, ...serializableBase } = state;
      const serializableState = {
        ...serializableBase,
        clips: state.clips.map((c) => ({
          ...c,
          video: { file: null as unknown as File, url: "", name: c.video.name },
        })),
      };

      const metadata: ProjectMetadata = {
        id,
        name,
        savedAt: Date.now(),
        clipCount: state.clips.length,
      };

      // Save metadata
      const metaTx = db.transaction(META_STORE, "readwrite");
      metaTx.objectStore(META_STORE).put(metadata);

      // Save blobs (state JSON + video files)
      const blobTx = db.transaction(BLOB_STORE, "readwrite");
      blobTx.objectStore(BLOB_STORE).put({
        id,
        state: JSON.parse(JSON.stringify(serializableState)),
        videoFiles,
      });

      await refreshList();
      return id;
    },
    [refreshList]
  );

  const loadProject = useCallback(
    async (
      id: string
    ): Promise<{ state: EditorState; name: string } | null> => {
      try {
        const db = await openDB();

        // Load metadata
        const metaTx = db.transaction(META_STORE, "readonly");
        const metaReq = metaTx.objectStore(META_STORE).get(id);
        const metadata = await new Promise<ProjectMetadata | undefined>(
          (resolve) => {
            metaReq.onsuccess = () => resolve(metaReq.result);
            metaReq.onerror = () => resolve(undefined);
          }
        );
        if (!metadata) return null;

        // Load blobs
        const blobTx = db.transaction(BLOB_STORE, "readonly");
        const blobReq = blobTx.objectStore(BLOB_STORE).get(id);
        const blobData = await new Promise<{
          id: string;
          state: SavedProject["state"];
          videoFiles: { clipId: string; file: File }[];
        } | undefined>((resolve) => {
          blobReq.onsuccess = () => resolve(blobReq.result);
          blobReq.onerror = () => resolve(undefined);
        });
        if (!blobData) return null;

        const savedState = blobData.state;
        const videoFiles = blobData.videoFiles;

        // Reconstruct clips with File objects and blob URLs
        const clips = savedState.clips.map((clip) => {
          const vf = videoFiles.find((v) => v.clipId === clip.id);
          const file = vf?.file;
          const url = file ? URL.createObjectURL(file) : "";
          return {
            ...clip,
            video: { file: file ?? new File([], clip.video.name), url, name: clip.video.name },
          };
        });

        const restoredState: EditorState = {
          ...savedState,
          clips,
          isProcessing: false,
          isFFmpegReady: true,
        };

        return { state: restoredState, name: metadata.name };
      } catch {
        return null;
      }
    },
    []
  );

  const deleteProject = useCallback(
    async (id: string) => {
      try {
        const db = await openDB();
        const metaTx = db.transaction(META_STORE, "readwrite");
        metaTx.objectStore(META_STORE).delete(id);
        const blobTx = db.transaction(BLOB_STORE, "readwrite");
        blobTx.objectStore(BLOB_STORE).delete(id);
        await refreshList();
      } catch {
        // ignore
      }
    },
    [refreshList]
  );

  return {
    projects,
    saveProject,
    loadProject,
    deleteProject,
    refreshList,
  };
}
