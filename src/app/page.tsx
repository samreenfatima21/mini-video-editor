"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useVideoEditor } from "@/hooks/useVideoEditor";
import { useUndoRedo } from "@/hooks/useUndoRedo";
import { useToast } from "@/hooks/useToast";
import { useRecentProjects } from "@/hooks/useRecentProjects";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useTheme } from "@/hooks/useTheme";
import { useMultiThumbnails } from "@/hooks/useThumbnails";
import { getFFmpeg } from "@/lib/ffmpeg";

import TopToolbar from "@/components/editor/TopToolbar";
import LeftSidebar from "@/components/editor/LeftSidebar";
import type { SidebarTab } from "@/components/editor/LeftSidebar";
import CenterCanvas from "@/components/editor/CenterCanvas";
import RightPropertiesPanel from "@/components/editor/RightPropertiesPanel";
import BottomTimeline from "@/components/editor/BottomTimeline";

import VideoUploader from "@/components/VideoUploader";
import Timeline from "@/components/Timeline";
import TrimControls from "@/components/TrimControls";
import FilterPanel from "@/components/FilterPanel";
import TextOverlayPanel from "@/components/TextOverlay";
import ExportButton from "@/components/ExportButton";
import CropPanel from "@/components/CropPanel";
import WatermarkPanel from "@/components/WatermarkPanel";
import TransitionPanel from "@/components/TransitionPanel";
import TransformPanel from "@/components/TransformPanel";
import AudioPanel from "@/components/AudioPanel";
import CaptionsPanel from "@/components/CaptionsPanel";
import PanZoomPanel from "@/components/PanZoomPanel";
import StickersPanel from "@/components/StickersPanel";
import ToastContainer from "@/components/Toast";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import SplashScreen from "@/components/SplashScreen";
import { useBackgroundMusic } from "@/hooks/useBackgroundMusic";
import type { FilterSettings, TextOverlay, AutoSaveData, BackgroundMusic, StickerOverlay } from "@/types/editor";

interface EditState {
  filters: FilterSettings;
  textOverlays: TextOverlay[];
}

export default function Home() {
  const {
    state,
    addClip,
    removeClip,
    removeAllClips,
    selectClip,
    reorderClips,
    replaceClipVideo,
    setClipTrim,
    setClipFilters,
    setClipTextOverlays,
    setClipPlaybackSpeed,
    setClipAudio,
    setClipTransition,
    rotateClip,
    toggleFlipH,
    toggleFlipV,
    resetTransform,
    setClipPanZoom,
    addSticker,
    updateSticker,
    removeSticker,
    setCrop,
    setWatermark,
    setExportQuality,
    setProcessing,
    setGlobalFadeIn,
    setGlobalFadeOut,
    setBackgroundMusic,
    updateBackgroundMusic,
    removeBackgroundMusic,
    addCaption,
    updateCaption,
    removeCaption,
    setCaptionStyle,
    setCaptionsEnabled,
    selectedClip,
    totalDuration,
  } = useVideoEditor();

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [projectName, setProjectName] = useState("Untitled Project");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showOriginal, setShowOriginal] = useState(false);
  const [showAutoSaveBanner, setShowAutoSaveBanner] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<SidebarTab>(null);
  const videoElRef = useRef<HTMLVideoElement | null>(null);

  const { pushState, undo, redo, canUndo, canRedo } = useUndoRedo<EditState>();
  const { toasts, addToast, removeToast } = useToast();
  const { projects, addProject, removeProject } = useRecentProjects();
  const { theme, toggleTheme } = useTheme();

  const clipThumbnails = useMultiThumbnails(state.clips);

  // Background music sync
  useBackgroundMusic(state.backgroundMusic, isPlaying, currentTime, videoElRef.current);

  // Auto-save (simplified — doesn't save File objects)
  const getAutoSaveData = useCallback((): AutoSaveData | null => {
    if (state.clips.length === 0) return null;
    const clip = selectedClip;
    return {
      projectName,
      filters: clip?.filters ?? { brightness: 100, contrast: 100, grayscale: 0 },
      textOverlays: clip?.textOverlays ?? [],
      trim: clip?.trim ?? { start: 0, end: 0 },
      playbackSpeed: clip?.playbackSpeed ?? 1,
      audio: clip?.audio ?? { muted: false, volume: 1, fadeIn: 0, fadeOut: 0 },
      transitions: { fadeIn: state.globalFadeIn, fadeOut: state.globalFadeOut },
      crop: state.crop,
      watermark: state.watermark,
      exportQuality: state.exportQuality,
      savedAt: Date.now(),
    };
  }, [projectName, state, selectedClip]);

  const { loadSaved, clearSaved, hasSavedData } = useAutoSave(getAutoSaveData, state.clips.length > 0);

  // FFmpeg init + splash
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    getFFmpeg()
      .then(() => { timeout = setTimeout(() => setShowSplash(false), 1500); })
      .catch(() => { timeout = setTimeout(() => setShowSplash(false), 1500); });
    return () => clearTimeout(timeout);
  }, []);

  // Auto-save check
  useEffect(() => {
    if (hasSavedData()) setShowAutoSaveBanner(true);
  }, [hasSavedData]);

  const restoreAutoSave = useCallback(() => {
    const saved = loadSaved();
    if (saved) {
      setProjectName(saved.projectName);
      setCrop(saved.crop);
      setWatermark(saved.watermark);
      setExportQuality(saved.exportQuality);
      setGlobalFadeIn(saved.transitions.fadeIn);
      setGlobalFadeOut(saved.transitions.fadeOut);
      addToast("Previous session restored (re-upload videos)", "success");
    }
    setShowAutoSaveBanner(false);
  }, [loadSaved, setCrop, setWatermark, setExportQuality, setGlobalFadeIn, setGlobalFadeOut, addToast]);

  const dismissAutoSave = useCallback(() => {
    clearSaved();
    setShowAutoSaveBanner(false);
  }, [clearSaved]);

  const handleFiltersChange = useCallback(
    (filters: FilterSettings) => {
      if (!selectedClip) return;
      pushState({ filters: selectedClip.filters, textOverlays: selectedClip.textOverlays });
      setClipFilters(filters);
    },
    [pushState, setClipFilters, selectedClip]
  );

  const handleTextOverlaysChange = useCallback(
    (overlays: TextOverlay[]) => {
      if (!selectedClip) return;
      pushState({ filters: selectedClip.filters, textOverlays: selectedClip.textOverlays });
      setClipTextOverlays(overlays);
    },
    [pushState, setClipTextOverlays, selectedClip]
  );

  const handleTextOverlayMove = useCallback(
    (id: string, x: number, y: number) => {
      if (!selectedClip) return;
      setClipTextOverlays(
        selectedClip.textOverlays.map((o) => (o.id === id ? { ...o, x, y } : o))
      );
    },
    [selectedClip, setClipTextOverlays]
  );

  const handleUndo = useCallback(() => {
    const s = undo();
    if (s) { setClipFilters(s.filters); setClipTextOverlays(s.textOverlays); }
  }, [undo, setClipFilters, setClipTextOverlays]);

  const handleRedo = useCallback(() => {
    const s = redo();
    if (s) { setClipFilters(s.filters); setClipTextOverlays(s.textOverlays); }
  }, [redo, setClipFilters, setClipTextOverlays]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "?" || (e.shiftKey && e.code === "Slash")) {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        if (e.shiftKey) { e.preventDefault(); handleRedo(); }
        else { e.preventDefault(); handleUndo(); }
      }

      if (state.clips.length === 0) return;
      const clipAudio = selectedClip?.audio ?? { muted: false, volume: 1, fadeIn: 0, fadeOut: 0 };
      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          handleSeek(Math.max(0, currentTime - 5));
          break;
        case "ArrowRight":
          e.preventDefault();
          handleSeek(Math.min(duration, currentTime + 5));
          break;
        case "ArrowUp":
          e.preventDefault();
          setClipAudio({ ...clipAudio, volume: Math.min(1, clipAudio.volume + 0.1) });
          break;
        case "ArrowDown":
          e.preventDefault();
          setClipAudio({ ...clipAudio, volume: Math.max(0, clipAudio.volume - 0.1) });
          break;
        case "KeyM":
          setClipAudio({ ...clipAudio, muted: !clipAudio.muted });
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo, state.clips, selectedClip, currentTime, duration, setClipAudio]);

  const handleVideoSelect = useCallback(
    (file: File) => {
      addClip(file);
      addProject(projectName, file.name);
      addToast("Video loaded successfully", "success");
    },
    [addClip, addProject, projectName, addToast]
  );

  const handleAddClip = useCallback(
    (file: File) => {
      addClip(file);
      addToast("Clip added to timeline", "success");
    },
    [addClip, addToast]
  );

  const handleTrimComplete = useCallback((trimmedFile: File) => {
    if (selectedClip) {
      replaceClipVideo(selectedClip.id, trimmedFile);
      addToast("Video trimmed successfully", "success");
    }
  }, [selectedClip, replaceClipVideo, addToast]);

  const handleSeek = useCallback((time: number) => {
    if (videoElRef.current) videoElRef.current.currentTime = time;
  }, []);

  const togglePlay = useCallback(() => {
    if (!videoElRef.current) return;
    if (isPlaying) {
      videoElRef.current.pause();
    } else {
      videoElRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleExportFromToolbar = useCallback(() => {
    setActiveTab('export');
  }, []);

  const handleTransitionClick = useCallback((clipId: string) => {
    selectClip(clipId);
    setActiveTab('transitions');
  }, [selectClip]);

  // Render sidebar panel content based on activeTab
  const renderSidebarContent = () => {
    if (state.clips.length === 0) return null;
    const clip = selectedClip;
    switch (activeTab) {
      case 'trim':
        return clip && duration > 0 ? (
          <TrimControls
            videoFile={clip.video.file}
            duration={duration}
            trimStart={clip.trim.start}
            trimEnd={clip.trim.end}
            onTrimChange={setClipTrim}
            onTrimComplete={handleTrimComplete}
            isProcessing={state.isProcessing}
            onProcessingChange={setProcessing}
          />
        ) : null;
      case 'filters':
        return clip ? (
          <FilterPanel
            filters={clip.filters}
            onFiltersChange={handleFiltersChange}
          />
        ) : null;
      case 'text':
        return clip ? (
          <TextOverlayPanel
            overlays={clip.textOverlays}
            onOverlaysChange={handleTextOverlaysChange}
          />
        ) : null;
      case 'crop':
        return (
          <CropPanel
            crop={state.crop}
            onCropChange={setCrop}
          />
        );
      case 'watermark':
        return (
          <WatermarkPanel
            watermark={state.watermark}
            onWatermarkChange={setWatermark}
          />
        );
      case 'transitions':
        return (
          <TransitionPanel
            clips={state.clips}
            onTransitionChange={setClipTransition}
            selectedClipId={state.selectedClipId}
          />
        );
      case 'transform':
        return clip ? (
          <TransformPanel
            transform={clip.transform}
            onRotate={rotateClip}
            onToggleFlipH={toggleFlipH}
            onToggleFlipV={toggleFlipV}
            onReset={resetTransform}
          />
        ) : null;
      case 'audio':
        return (
          <AudioPanel
            music={state.backgroundMusic}
            onMusicChange={setBackgroundMusic}
            onMusicUpdate={updateBackgroundMusic}
            onMusicRemove={removeBackgroundMusic}
          />
        );
      case 'captions':
        return (
          <CaptionsPanel
            captions={state.captionSettings.captions}
            enabled={state.captionSettings.enabled}
            style={state.captionSettings.style}
            currentTime={currentTime}
            onAddCaption={addCaption}
            onUpdateCaption={updateCaption}
            onRemoveCaption={removeCaption}
            onStyleChange={setCaptionStyle}
            onEnabledChange={setCaptionsEnabled}
          />
        );
      case 'panzoom':
        return clip ? (
          <PanZoomPanel
            panZoom={clip.panZoom}
            onChange={setClipPanZoom}
          />
        ) : null;
      case 'stickers':
        return clip ? (
          <StickersPanel
            stickers={clip.stickerOverlays}
            onAddSticker={addSticker}
            onUpdateSticker={updateSticker}
            onRemoveSticker={removeSticker}
          />
        ) : null;
      case 'export':
        return (
          <ExportButton
            clips={state.clips}
            crop={state.crop}
            watermark={state.watermark}
            exportQuality={state.exportQuality}
            globalFadeIn={state.globalFadeIn}
            globalFadeOut={state.globalFadeOut}
            isProcessing={state.isProcessing}
            onProcessingChange={setProcessing}
            onExportQualityChange={setExportQuality}
            onGlobalFadeInChange={setGlobalFadeIn}
            onGlobalFadeOutChange={setGlobalFadeOut}
            backgroundMusic={state.backgroundMusic}
            captionSettings={state.captionSettings}
            addToast={addToast}
          />
        );
      default:
        return null;
    }
  };

  const hasClips = state.clips.length > 0;
  const clipAudio = selectedClip?.audio ?? { muted: false, volume: 1, fadeIn: 0, fadeOut: 0 };
  const clipSpeed = selectedClip?.playbackSpeed ?? 1;

  return (
    <div data-theme={theme}>
      {showSplash && <SplashScreen />}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <KeyboardShortcuts isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />

      {/* Mobile warning */}
      <div className="mobile-warning fixed inset-0 z-[300] flex items-center justify-center p-6" style={{ background: 'var(--bg-base)' }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Desktop Required</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            FrameCut requires a screen width of at least 1024px for the best editing experience.
          </p>
        </div>
      </div>

      {!hasClips ? (
        /* ====== LANDING LAYOUT ====== */
        <div className="landing-layout">
          <TopToolbar
            hasVideo={false}
            projectName={projectName}
            onProjectNameChange={setProjectName}
            isPlaying={false}
            onTogglePlay={() => {}}
            playbackSpeed={1}
            onPlaybackSpeedChange={() => {}}
            currentTime={0}
            duration={0}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
            showOriginal={false}
            onToggleOriginal={() => {}}
            theme={theme}
            onToggleTheme={toggleTheme}
            onShowShortcuts={() => setShowShortcuts(true)}
            isProcessing={false}
            onExport={() => {}}
            audio={{ muted: false, volume: 1, fadeIn: 0, fadeOut: 0 }}
            onAudioChange={() => {}}
            onRemoveVideo={removeAllClips}
          />

          <div className="canvas-region flex-col gap-6 p-8 overflow-y-auto" style={{ display: 'flex' }}>
            {showAutoSaveBanner && (
              <div
                className="max-w-lg w-full flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent)' }}
              >
                <span className="text-sm" style={{ color: 'var(--accent)' }}>Previous session found. Restore?</span>
                <div className="flex gap-2">
                  <button onClick={restoreAutoSave} className="btn-accent text-xs py-1 px-3">Restore</button>
                  <button onClick={dismissAutoSave} className="text-xs py-1 px-3 rounded-lg" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>Dismiss</button>
                </div>
              </div>
            )}

            <div className="text-center max-w-lg">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500 via-violet-500 to-purple-600 opacity-20 blur-xl" />
                <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-2xl">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                </div>
              </div>

              <h2 className="text-4xl font-extrabold mb-3 tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Frame<span style={{ color: 'var(--accent)' }}>Cut</span>
              </h2>
              <p className="text-lg mb-2 font-medium" style={{ color: 'var(--text-secondary)' }}>
                Professional video editing in your browser
              </p>
              <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
                Multi-clip timeline, transitions, filters, text overlays, and export — no downloads, no signups, completely free.
              </p>
            </div>

            <div className="max-w-sm w-full">
              <label className="text-[10px] uppercase tracking-wider block mb-1.5 text-center" style={{ color: 'var(--text-muted)' }}>
                Name your project
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="My Awesome Video"
                className="w-full text-center text-base px-4 py-3 rounded-xl outline-none transition-colors"
                style={{
                  background: 'var(--bg-panel)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                }}
              />
            </div>

            <div className="max-w-lg w-full">
              <VideoUploader onVideoSelect={handleVideoSelect} />
            </div>

            {projects.length > 0 && (
              <div className="max-w-lg w-full">
                <h3 className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Recent Projects</h3>
                <div className="space-y-1.5">
                  {projects.slice(0, 5).map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between px-3 py-2 rounded-lg transition-all"
                      style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)' }}
                    >
                      <div>
                        <p className="text-xs" style={{ color: 'var(--text-primary)' }}>{project.name}</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{project.fileName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                          {new Date(project.lastModified).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => removeProject(project.id)}
                          className="p-1 rounded transition-colors"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 gap-3 max-w-lg w-full">
              {[
                { label: "Multi-Clip", desc: "Timeline", color: "from-pink-500 to-rose-600" },
                { label: "Transitions", desc: "14 types", color: "from-amber-500 to-orange-600" },
                { label: "Filters", desc: "13 presets", color: "from-cyan-500 to-blue-600" },
                { label: "Export", desc: "MP4 download", color: "from-emerald-500 to-green-600" },
              ].map((f) => (
                <div
                  key={f.label}
                  className="text-center py-3 rounded-lg transition-all"
                  style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)' }}
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${f.color} flex items-center justify-center mx-auto mb-2 opacity-80`}>
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                    </svg>
                  </div>
                  <p className="text-[11px] font-semibold" style={{ color: 'var(--text-primary)' }}>{f.label}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-full" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)' }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent-success)' }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>100% in-browser — your videos never leave your device</span>
            </div>
          </div>
        </div>
      ) : (
        /* ====== EDITOR LAYOUT ====== */
        <div className={`editor-layout ${activeTab ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
          <TopToolbar
            hasVideo={true}
            projectName={projectName}
            onProjectNameChange={setProjectName}
            isPlaying={isPlaying}
            onTogglePlay={togglePlay}
            playbackSpeed={clipSpeed}
            onPlaybackSpeedChange={setClipPlaybackSpeed}
            currentTime={currentTime}
            duration={duration}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
            showOriginal={showOriginal}
            onToggleOriginal={() => setShowOriginal(!showOriginal)}
            theme={theme}
            onToggleTheme={toggleTheme}
            onShowShortcuts={() => setShowShortcuts(true)}
            isProcessing={state.isProcessing}
            onExport={handleExportFromToolbar}
            audio={clipAudio}
            onAudioChange={setClipAudio}
            onRemoveVideo={removeAllClips}
          />

          <LeftSidebar activeTab={activeTab} onTabChange={setActiveTab}>
            {renderSidebarContent()}
          </LeftSidebar>

          {selectedClip && (
            <CenterCanvas
              videoUrl={selectedClip.video.url}
              filters={selectedClip.filters}
              textOverlays={selectedClip.textOverlays}
              playbackSpeed={selectedClip.playbackSpeed}
              audio={selectedClip.audio}
              crop={state.crop}
              watermark={state.watermark}
              transform={selectedClip.transform}
              panZoom={selectedClip.panZoom}
              stickerOverlays={selectedClip.stickerOverlays}
              captionSettings={state.captionSettings}
              currentTime={currentTime}
              showOriginal={showOriginal}
              onVideoRef={(el) => { videoElRef.current = el; }}
              onTimeUpdate={(time) => setCurrentTime(time)}
              onLoadedMetadata={(dur) => {
                setDuration(dur);
                if (selectedClip.trim.end === 0) setClipTrim(0, dur);
              }}
              onTextOverlayMove={handleTextOverlayMove}
              onStickerMove={(id, x, y) => updateSticker(id, { x, y })}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
            />
          )}

          <RightPropertiesPanel
            activeTab={activeTab}
            videoName={selectedClip?.video.name ?? ""}
            duration={duration}
            currentTime={currentTime}
            fileSize={selectedClip?.video.file.size}
            clipCount={state.clips.length}
            clipIndex={selectedClip ? state.clips.findIndex(c => c.id === selectedClip.id) + 1 : 0}
          />

          <BottomTimeline
            isPlaying={isPlaying}
            onTogglePlay={togglePlay}
            currentTime={currentTime}
            duration={totalDuration}
            onSeek={handleSeek}
            audio={clipAudio}
            onAudioChange={setClipAudio}
            onAddClip={handleAddClip}
            clipCount={state.clips.length}
          >
            <Timeline
              clips={state.clips}
              selectedClipId={state.selectedClipId}
              onSelectClip={selectClip}
              currentTime={currentTime}
              totalDuration={totalDuration}
              onSeek={handleSeek}
              clipThumbnails={clipThumbnails}
              onTransitionClick={handleTransitionClick}
              onReorderClips={reorderClips}
            />
          </BottomTimeline>
        </div>
      )}
    </div>
  );
}
