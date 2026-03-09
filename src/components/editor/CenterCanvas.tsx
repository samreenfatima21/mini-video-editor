"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type {
  FilterSettings, TextOverlay, PlaybackSpeed, AudioSettings,
  CropSettings, WatermarkSettings, TransformSettings, PanZoomSettings,
  StickerOverlay, CaptionSettings, ChromaKeySettings, SpeedRampSettings,
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
  chromaKey?: ChromaKeySettings | null;
  speedRamp?: SpeedRampSettings;
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

const defaultFilters: FilterSettings = { brightness: 100, contrast: 100, grayscale: 0, saturation: 100, hueRotate: 0, temperature: 0 };

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
  chromaKey,
  speedRamp,
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

  // Dynamic playback rate for speed ramp
  useEffect(() => {
    if (!speedRamp || speedRamp.preset === 'none' || !isPlaying) return;
    let animId: number;
    const tick = () => {
      if (!videoRef.current) return;
      const dur = videoRef.current.duration || 1;
      const t = videoRef.current.currentTime;
      const progress = t / dur;
      let rate: number = playbackSpeed;
      switch (speedRamp.preset) {
        case 'ramp-up':
          rate = 0.5 + 1.5 * progress; // 0.5→2.0
          break;
        case 'ramp-down':
          rate = 2.0 - 1.5 * progress; // 2.0→0.5
          break;
        case 'slow-mo-burst':
          if (progress < 0.33) rate = 1.0;
          else if (progress < 0.66) rate = 0.3;
          else rate = 1.0;
          break;
      }
      videoRef.current.playbackRate = Math.max(0.1, Math.min(4, rate));
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [speedRamp, isPlaying, playbackSpeed]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = audio.muted;
      videoRef.current.volume = audio.volume;
    }
  }, [audio.muted, audio.volume]);

  const activeFilters = showOriginal ? defaultFilters : filters;
  const tempIntensity = Math.abs(activeFilters.temperature) / 100;
  const tempSepia = activeFilters.temperature !== 0 ? `sepia(${(tempIntensity * 40).toFixed(0)}%)` : '';
  const tempHueShift = activeFilters.temperature < 0 ? 'hue-rotate(180deg)' : '';
  const filterStyle = {
    filter: [
      `brightness(${activeFilters.brightness}%)`,
      `contrast(${activeFilters.contrast}%)`,
      `grayscale(${activeFilters.grayscale}%)`,
      `saturate(${activeFilters.saturation}%)`,
      `hue-rotate(${activeFilters.hueRotate}deg)`,
      tempSepia,
      tempHueShift,
    ].filter(Boolean).join(' '),
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

    // Determine if dragging a text overlay or a sticker
    const isTextOverlay = textOverlays.some((o) => o.id === draggingOverlay);
    const isSticker = stickerOverlays.some((s) => s.id === draggingOverlay);

    const handleMouseMove = (e: MouseEvent) => {
      if (!videoAreaRef.current) return;
      const rect = videoAreaRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      if (isTextOverlay && onTextOverlayMove) {
        onTextOverlayMove(draggingOverlay, Math.round(x), Math.round(y));
      } else if (isSticker && onStickerMove) {
        onStickerMove(draggingOverlay, Math.round(x), Math.round(y));
      }
    };

    const handleMouseUp = () => setDraggingOverlay(null);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingOverlay, textOverlays, stickerOverlays, onTextOverlayMove, onStickerMove]);

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
                textShadow: `${overlay.shadowOffsetX ?? 2}px ${overlay.shadowOffsetY ?? 2}px ${overlay.shadowBlur ?? 4}px ${overlay.shadowColor ?? 'rgba(0,0,0,0.8)'}`,
                WebkitTextStroke: overlay.strokeWidth ? `${overlay.strokeWidth}px ${overlay.strokeColor ?? '#000000'}` : undefined,
                backgroundColor: overlay.backgroundColor || undefined,
                padding: overlay.backgroundColor ? `${overlay.backgroundPadding ?? 4}px` : undefined,
                letterSpacing: overlay.letterSpacing ? `${overlay.letterSpacing}px` : undefined,
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
              transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg) scale(${sticker.scale})`,
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

        {/* Chroma key badge */}
        {chromaKey?.enabled && (
          <div
            className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium"
            style={{ background: 'rgba(0,255,0,0.2)', color: '#00ff88', border: '1px solid rgba(0,255,0,0.3)' }}
          >
            <div className="w-2 h-2 rounded-full" style={{ background: chromaKey.color }} />
            Chroma Key
          </div>
        )}

        {/* Speed ramp badge */}
        {speedRamp && speedRamp.preset !== 'none' && (
          <div
            className="absolute top-2 right-2 px-2 py-1 rounded text-[10px] font-medium"
            style={{ background: 'rgba(255,200,0,0.2)', color: '#ffcc00', border: '1px solid rgba(255,200,0,0.3)' }}
          >
            {speedRamp.preset === 'ramp-up' ? 'Ramp Up' : speedRamp.preset === 'ramp-down' ? 'Ramp Down' : 'Slow-Mo Burst'}
          </div>
        )}

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
