"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type {
  FilterSettings, TextOverlay, PlaybackSpeed, AudioSettings,
  CropSettings, WatermarkSettings, TransformSettings, PanZoomSettings,
  StickerOverlay, CaptionSettings,
} from "@/types/editor";
import { FONTS } from "@/lib/fonts";
import { ANIMATIONS } from "@/lib/animations";
import CaptionOverlay from "@/components/CaptionOverlay";
import ShapeRenderer from "@/components/ShapeRenderer";

interface CenterCanvasProps {
  videoUrl: string;
  filters: FilterSettings;
  textOverlays: TextOverlay[];
  playbackSpeed: PlaybackSpeed;
  audio: AudioSettings;
  crop: CropSettings;
  watermark: WatermarkSettings;
  transform: TransformSettings;
  panZoom: PanZoomSettings;
  stickerOverlays: StickerOverlay[];
  captionSettings: CaptionSettings;
  currentTime: number;
  showOriginal?: boolean;
  onVideoRef?: (ref: HTMLVideoElement | null) => void;
  onTimeUpdate?: (currentTime: number) => void;
  onLoadedMetadata?: (duration: number) => void;
  onTextOverlayMove?: (id: string, x: number, y: number) => void;
  onStickerMove?: (id: string, x: number, y: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

const defaultFilters: FilterSettings = { brightness: 100, contrast: 100, grayscale: 0 };

const aspectRatioCSS: Record<string, string | undefined> = {
  "16:9": "16/9",
  "9:16": "9/16",
  "1:1": "1/1",
  "4:5": "4/5",
  "4:3": "4/3",
  original: undefined,
};

export default function CenterCanvas({
  videoUrl,
  filters,
  textOverlays,
  playbackSpeed,
  audio,
  crop,
  watermark,
  transform,
  panZoom,
  stickerOverlays,
  captionSettings,
  currentTime,
  showOriginal = false,
  onVideoRef,
  onTimeUpdate,
  onLoadedMetadata,
  onTextOverlayMove,
  onStickerMove,
  isPlaying,
  onTogglePlay,
}: CenterCanvasProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoAreaRef = useRef<HTMLDivElement>(null);
  const [draggingOverlay, setDraggingOverlay] = useState<string | null>(null);

  useEffect(() => {
    onVideoRef?.(videoRef.current);
  }, [onVideoRef]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = audio.muted;
      videoRef.current.volume = audio.volume;
    }
  }, [audio.muted, audio.volume]);

  const activeFilters = showOriginal ? defaultFilters : filters;
  const filterStyle = {
    filter: `brightness(${activeFilters.brightness}%) contrast(${activeFilters.contrast}%) grayscale(${activeFilters.grayscale}%)`,
  };

  const cropStyle: React.CSSProperties = {};
  const arCSS = aspectRatioCSS[crop.preset];
  if (arCSS) {
    cropStyle.aspectRatio = arCSS;
    cropStyle.objectFit = "cover";
  }

  // Drag text overlay handlers
  const handleOverlayMouseDown = (e: React.MouseEvent, overlayId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingOverlay(overlayId);
  };

  useEffect(() => {
    if (!draggingOverlay) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!videoAreaRef.current || !onTextOverlayMove) return;
      const rect = videoAreaRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      onTextOverlayMove(draggingOverlay, Math.round(x), Math.round(y));
    };

    const handleMouseUp = () => setDraggingOverlay(null);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingOverlay, onTextOverlayMove]);

  const handlePlayPause = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    onTogglePlay();
  }, [isPlaying, onTogglePlay]);

  // Build transform + panZoom CSS for video element
  const transformParts: string[] = [];
  if (transform.rotation !== 0) transformParts.push(`rotate(${transform.rotation}deg)`);
  if (transform.flipH) transformParts.push("scaleX(-1)");
  if (transform.flipV) transformParts.push("scaleY(-1)");

  // Pan & Zoom: interpolate based on currentTime and clip duration
  if (panZoom.enabled) {
    const videoDur = videoRef.current?.duration || 1;
    const progress = Math.min(1, Math.max(0, (currentTime || 0) / videoDur));
    const lerp = (a: number, b: number) => a + (b - a) * progress;
    const scale = lerp(panZoom.startKeyframe.scale, panZoom.endKeyframe.scale);
    const tx = lerp(panZoom.startKeyframe.x, panZoom.endKeyframe.x) - 50;
    const ty = lerp(panZoom.startKeyframe.y, panZoom.endKeyframe.y) - 50;
    transformParts.push(`scale(${scale})`);
    transformParts.push(`translate(${-tx}%, ${-ty}%)`);
  }

  const videoTransformStyle: React.CSSProperties = transformParts.length > 0
    ? { transform: transformParts.join(" ") }
    : {};

  // For 90/270 rotation, scale down to fit
  if (transform.rotation === 90 || transform.rotation === 270) {
    videoTransformStyle.maxWidth = "70%";
    videoTransformStyle.maxHeight = "70%";
  }

  return (
    <div className="canvas-region">
      <div ref={videoAreaRef} className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          src={videoUrl}
          style={{ ...filterStyle, ...cropStyle, ...videoTransformStyle }}
          className="max-w-full max-h-full object-contain transition-transform"
          onTimeUpdate={() => {
            if (videoRef.current) {
              onTimeUpdate?.(videoRef.current.currentTime);
            }
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              onLoadedMetadata?.(videoRef.current.duration);
            }
          }}
          onEnded={onTogglePlay}
          onClick={handlePlayPause}
        />

        {/* Center play indicator when paused */}
        {!isPlaying && (
          <div
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            onClick={handlePlayPause}
            style={{ background: 'rgba(0,0,0,0.15)' }}
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Text overlays */}
        {textOverlays.map((overlay) => {
          const fontConfig = FONTS[overlay.fontFamily || 'inter'];
          const animConfig = ANIMATIONS[overlay.animation || 'none'];
          return (
            <div
              key={overlay.id}
              className={`absolute select-none font-bold ${animConfig.cssClass} ${draggingOverlay === overlay.id ? "cursor-grabbing" : "cursor-grab"}`}
              style={{
                left: `${overlay.x}%`,
                top: `${overlay.y}%`,
                transform: "translate(-50%, -50%)",
                fontSize: `${overlay.fontSize}px`,
                color: overlay.color,
                fontFamily: fontConfig.cssFamily,
                textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
              }}
              onMouseDown={(e) => handleOverlayMouseDown(e, overlay.id)}
            >
              {overlay.text}
            </div>
          );
        })}

        {/* Sticker overlays */}
        {stickerOverlays.map((sticker) => (
          <div
            key={sticker.id}
            className={`absolute select-none ${draggingOverlay === sticker.id ? "cursor-grabbing" : "cursor-grab"}`}
            style={{
              left: `${sticker.x}%`,
              top: `${sticker.y}%`,
              transform: `translate(-50%, -50%) scale(${sticker.scale}) rotate(${sticker.rotation}deg)`,
              opacity: sticker.opacity,
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDraggingOverlay(sticker.id);
            }}
          >
            {sticker.type === 'emoji' && <span style={{ fontSize: '48px' }}>{sticker.value}</span>}
            {sticker.type === 'shape' && <ShapeRenderer shape={sticker.value} size={48} />}
            {sticker.type === 'image' && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={sticker.value} alt="sticker" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
            )}
          </div>
        ))}

        {/* Caption overlay */}
        <CaptionOverlay captionSettings={captionSettings} currentTime={currentTime} />

        {/* Watermark */}
        {watermark.enabled && watermark.text && (
          <div
            className="absolute select-none pointer-events-none font-medium"
            style={{
              ...(watermark.position.includes("top") ? { top: "12px" } : { bottom: "12px" }),
              ...(watermark.position.includes("left") ? { left: "12px" } : { right: "12px" }),
              fontSize: `${watermark.fontSize}px`,
              color: watermark.color,
              opacity: watermark.opacity / 100,
              textShadow: "1px 1px 3px rgba(0,0,0,0.6)",
            }}
          >
            {watermark.text}
          </div>
        )}
      </div>
    </div>
  );
}
