"use client";

import { useState, useCallback } from "react";
import { getFFmpeg } from "@/lib/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import type {
  TimelineClip,
  CropSettings,
  WatermarkSettings,
  ExportQuality,
  BackgroundMusic,
  CaptionSettings,
  TextOverlay,
  PanZoomSettings,
  StickerOverlay,
} from "@/types/editor";
import { getEffectiveDuration } from "@/types/editor";

interface ExportButtonProps {
  clips: TimelineClip[];
  crop: CropSettings;
  watermark: WatermarkSettings;
  exportQuality: ExportQuality;
  globalFadeIn: number;
  globalFadeOut: number;
  isProcessing: boolean;
  onProcessingChange: (processing: boolean) => void;
  onExportQualityChange: (quality: ExportQuality) => void;
  onGlobalFadeInChange: (fadeIn: number) => void;
  onGlobalFadeOutChange: (fadeOut: number) => void;
  backgroundMusic?: BackgroundMusic | null;
  captionSettings?: CaptionSettings;
  addToast?: (message: string, type: "success" | "error" | "info") => void;
}

const QUALITY_OPTIONS: { label: string; value: ExportQuality }[] = [
  { label: "720p", value: "720p" },
  { label: "1080p", value: "1080p" },
  { label: "Original", value: "original" },
];

// ─── Helpers ────────────────────────────────────────────────

async function probeVideoInfo(url: string): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = url;
    video.onloadedmetadata = () => {
      resolve({ duration: video.duration, width: video.videoWidth, height: video.videoHeight });
      video.src = "";
    };
    video.onerror = () => { resolve({ duration: 0, width: 1920, height: 1080 }); video.src = ""; };
  });
}

function buildAtempoChain(speed: number): string[] {
  const filters: string[] = [];
  let s = speed;
  while (s > 2) { filters.push("atempo=2.0"); s /= 2; }
  while (s < 0.5) { filters.push("atempo=0.5"); s *= 2; }
  filters.push(`atempo=${s}`);
  return filters;
}

function buildCropFilter(preset: string): string | null {
  const ratioMap: Record<string, string> = {
    "16:9": "min(iw\\,ih*16/9):min(ih\\,iw*9/16)",
    "9:16": "min(iw\\,ih*9/16):min(ih\\,iw*16/9)",
    "1:1": "min(iw\\,ih):min(iw\\,ih)",
    "4:5": "min(iw\\,ih*4/5):min(ih\\,iw*5/4)",
    "4:3": "min(iw\\,ih*4/3):min(ih\\,iw*3/4)",
  };
  return ratioMap[preset] ? `crop=${ratioMap[preset]}` : null;
}

function buildTransformFilters(clip: TimelineClip): string[] {
  const filters: string[] = [];
  const { rotation, flipH, flipV } = clip.transform;
  if (rotation === 90) filters.push("transpose=1");
  else if (rotation === 180) filters.push("transpose=1,transpose=1");
  else if (rotation === 270) filters.push("transpose=2");
  if (flipH) filters.push("hflip");
  if (flipV) filters.push("vflip");
  return filters;
}

function buildCaptionFilters(captions: CaptionSettings): string[] {
  if (!captions.enabled || captions.captions.length === 0) return [];
  return captions.captions.map((cap) => {
    const text = cap.text.replace(/'/g, "\\'").replace(/:/g, "\\:");
    const pos = captions.style.position === 'top' ? 'y=30' : 'y=h-th-30';
    return `drawtext=text='${text}':fontsize=${captions.style.fontSize}:fontcolor=${captions.style.fontColor}:x=(w-tw)/2:${pos}:box=1:boxcolor=black@0.6:boxborderw=8:enable='between(t\\,${cap.startTime}\\,${cap.endTime})'`;
  });
}

function buildWatermarkFilter(wm: WatermarkSettings): string | null {
  if (!wm.enabled || !wm.text.trim()) return null;
  const posMap: Record<string, { x: string; y: string }> = {
    "top-left": { x: "10", y: "10" },
    "top-right": { x: "w-tw-10", y: "10" },
    "bottom-left": { x: "10", y: "h-th-10" },
    "bottom-right": { x: "w-tw-10", y: "h-th-10" },
  };
  const pos = posMap[wm.position];
  const text = wm.text.replace(/'/g, "\\'").replace(/:/g, "\\:");
  const alpha = wm.opacity / 100;
  return `drawtext=text='${text}':fontsize=${wm.fontSize}:fontcolor=${wm.color}@${alpha}:x=${pos.x}:y=${pos.y}:shadowcolor=black@0.3:shadowx=1:shadowy=1`;
}

// ─── FIX 1+2: Text overlay with font + animation support ───

function buildTextDrawFilter(o: TextOverlay, clipDuration: number): string {
  const escaped = o.text.replace(/'/g, "\\'").replace(/:/g, "\\:");

  let fontSizeParam = `${o.fontSize}`;
  let xParam = `(w*${o.x / 100})-(tw/2)`;
  let alphaParam: string | null = null;
  let enableParam: string | null = null;

  // Animation overrides
  if (o.animation && o.animation !== 'none') {
    const st = o.animationStartTime ?? 0;
    const dur = o.animationDuration ?? clipDuration;
    const end = st + dur;
    enableParam = `between(t\\,${st}\\,${end})`;

    switch (o.animation) {
      case 'fade-in':
        alphaParam = `if(lt(t-${st}\\,0.5)\\,(t-${st})/0.5\\,1)`;
        break;
      case 'slide-in':
        xParam = `if(lt(t-${st}\\,0.4)\\,(-tw)+(tw+(w*${o.x / 100 / 100})-(tw/2))*((t-${st})/0.4)\\,(w*${o.x / 100})-(tw/2))`;
        break;
      case 'pop': {
        const fs = o.fontSize;
        fontSizeParam = `if(lt(t-${st}\\,0.3)\\,trunc(${fs}*((t-${st})/0.3)*1.2)\\,if(lt(t-${st}\\,0.5)\\,trunc(${fs}*(1.2-0.2*((t-${st}-0.3)/0.2)))\\,${fs}))`;
        break;
      }
      // typewriter: just enable timing, text appears at startTime
    }
  }

  const parts = [
    `text='${escaped}'`,
    `fontsize=${fontSizeParam}`,
    `fontcolor=${o.color}`,
    `x=${xParam}`,
    `y=(h*${o.y / 100})-(th/2)`,
    'shadowcolor=black',
    'shadowx=2',
    'shadowy=2',
  ];

  if (alphaParam) parts.push(`alpha=${alphaParam}`);
  if (enableParam) parts.push(`enable='${enableParam}'`);

  return 'drawtext=' + parts.join(':');
}

// ─── FIX 3: Pan & Zoom export (zoompan filter) ─────────────

function buildPanZoomFilter(
  pz: PanZoomSettings,
  duration: number,
  videoW: number,
  videoH: number
): string | null {
  if (!pz.enabled) return null;

  const fps = 30;
  const totalFrames = Math.max(1, Math.round(duration * fps));
  const { startKeyframe: sk, endKeyframe: ek } = pz;

  // Zoom interpolation
  const z = sk.scale === ek.scale
    ? `${sk.scale}`
    : `${sk.scale}+((${ek.scale}-${sk.scale})*on/${totalFrames})`;

  // X position (percentage 0-100 → pixel offset in zoomed frame)
  const xS = sk.x / 100, xE = ek.x / 100;
  const x = xS === xE
    ? `${xS}*iw*(zoom-1)`
    : `(${xS}+((${xE}-${xS})*on/${totalFrames}))*iw*(zoom-1)`;

  // Y position
  const yS = sk.y / 100, yE = ek.y / 100;
  const y = yS === yE
    ? `${yS}*ih*(zoom-1)`
    : `(${yS}+((${yE}-${yS})*on/${totalFrames}))*ih*(zoom-1)`;

  return `zoompan=z='${z}':x='${x}':y='${y}':d=1:s=${videoW}x${videoH}:fps=${fps}`;
}

// ─── FIX 4: Sticker rendering for export ────────────────────

function getShapeSVG(shape: string, size: number): string {
  const color = '#7c5cfc';
  const svgShapes: Record<string, string> = {
    circle: `<circle cx="50" cy="50" r="45" fill="${color}"/>`,
    square: `<rect x="5" y="5" width="90" height="90" fill="${color}" rx="4"/>`,
    star: `<polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill="${color}"/>`,
    arrow: `<polygon points="10,50 60,10 60,35 90,35 90,65 60,65 60,90" fill="${color}"/>`,
    heart: `<path d="M50 88 C25 65 5 50 5 30 C5 15 15 5 30 5 C40 5 48 12 50 18 C52 12 60 5 70 5 C85 5 95 15 95 30 C95 50 75 65 50 88Z" fill="${color}"/>`,
    triangle: `<polygon points="50,10 90,90 10,90" fill="${color}"/>`,
    diamond: `<polygon points="50,5 95,50 50,95 5,50" fill="${color}"/>`,
    checkmark: `<path d="M20 55 L40 75 L80 25" fill="none" stroke="${color}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`,
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">${svgShapes[shape] || ''}</svg>`;
}

async function renderStickerToPNG(sticker: StickerOverlay): Promise<Uint8Array> {
  const baseSize = 96;
  const size = Math.round(baseSize * sticker.scale);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.globalAlpha = sticker.opacity;

  if (sticker.rotation !== 0) {
    ctx.translate(size / 2, size / 2);
    ctx.rotate((sticker.rotation * Math.PI) / 180);
    ctx.translate(-size / 2, -size / 2);
  }

  if (sticker.type === 'emoji') {
    ctx.font = `${Math.round(size * 0.75)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sticker.value, size / 2, size / 2);
  } else if (sticker.type === 'shape') {
    const svgContent = getShapeSVG(sticker.value, size);
    const img = new Image();
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
    const svgUrl = URL.createObjectURL(svgBlob);
    await new Promise<void>((resolve) => {
      img.onload = () => { ctx.drawImage(img, 0, 0, size, size); resolve(); };
      img.onerror = () => resolve();
      img.src = svgUrl;
    });
    URL.revokeObjectURL(svgUrl);
  } else if (sticker.type === 'image') {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise<void>((resolve) => {
      img.onload = () => { ctx.drawImage(img, 0, 0, size, size); resolve(); };
      img.onerror = () => resolve();
      img.src = sticker.value;
    });
  }

  const blob = await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b!), 'image/png')
  );
  return new Uint8Array(await blob.arrayBuffer());
}

// ─── Component ──────────────────────────────────────────────

export default function ExportButton({
  clips,
  crop,
  watermark,
  exportQuality,
  globalFadeIn,
  globalFadeOut,
  isProcessing,
  onProcessingChange,
  onExportQualityChange,
  onGlobalFadeInChange,
  onGlobalFadeOutChange,
  backgroundMusic,
  captionSettings,
  addToast,
}: ExportButtonProps) {
  const [statusMessage, setStatusMessage] = useState("");
  const [progress, setProgress] = useState(0);

  const handleExport = useCallback(async () => {
    if (clips.length === 0) return;
    onProcessingChange(true);
    setProgress(0);
    setStatusMessage("Loading FFmpeg...");

    try {
      const ffmpeg = await getFFmpeg();
      setProgress(5);

      // Write clips to virtual FS and resolve durations + dimensions
      const clipDurations: number[] = [];
      const clipDimensions: { w: number; h: number }[] = [];
      for (let i = 0; i < clips.length; i++) {
        setStatusMessage(`Reading clip ${i + 1} of ${clips.length}...`);
        const inputData = await fetchFile(clips[i].video.file);
        await ffmpeg.writeFile(`clip_${i}.mp4`, inputData);

        const info = await probeVideoInfo(clips[i].video.url);
        let dur = getEffectiveDuration(clips[i]);
        if (dur <= 0) dur = info.duration / clips[i].playbackSpeed;
        clipDurations.push(dur);
        clipDimensions.push({ w: info.width || 1920, h: info.height || 1080 });
        setProgress(5 + Math.round((15 * (i + 1)) / clips.length));
      }

      // Render sticker PNGs to virtual FS
      setStatusMessage("Preparing stickers...");
      const stickerInputFiles: string[] = [];
      for (let i = 0; i < clips.length; i++) {
        for (let j = 0; j < clips[i].stickerOverlays.length; j++) {
          const fname = `sticker_${i}_${j}.png`;
          try {
            const pngData = await renderStickerToPNG(clips[i].stickerOverlays[j]);
            await ffmpeg.writeFile(fname, pngData);
            stickerInputFiles.push(fname);
          } catch {
            // skip failed sticker renders
          }
        }
      }

      // Write background music
      if (backgroundMusic) {
        const bgData = await fetchFile(backgroundMusic.file);
        await ffmpeg.writeFile("bg_music.mp3", bgData);
      }

      setProgress(25);

      if (clips.length === 1) {
        await exportSingleClip(ffmpeg, clips[0], clipDurations[0], clipDimensions[0]);
      } else {
        await exportMultiClip(ffmpeg, clips, clipDurations, clipDimensions);
      }

      setProgress(80);
      setStatusMessage("Preparing download...");
      const outputData = await ffmpeg.readFile("output.mp4");
      setProgress(90);

      const blob = new Blob([new Uint8Array(outputData as Uint8Array)], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `edited_project.mp4`;
      link.click();
      URL.revokeObjectURL(url);

      // Cleanup virtual FS
      for (let i = 0; i < clips.length; i++) {
        try { await ffmpeg.deleteFile(`clip_${i}.mp4`); } catch { /* ignore */ }
      }
      for (const f of stickerInputFiles) {
        try { await ffmpeg.deleteFile(f); } catch { /* ignore */ }
      }
      try { await ffmpeg.deleteFile("output.mp4"); } catch { /* ignore */ }
      try { await ffmpeg.deleteFile("bg_music.mp3"); } catch { /* ignore */ }

      setProgress(100);
      setStatusMessage("Export complete!");
      addToast?.("Export complete! Check your downloads.", "success");
    } catch (error) {
      console.error("Export failed:", error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      setStatusMessage(`Export failed: ${errorMsg}`);
      addToast?.(`Export failed: ${errorMsg}`, "error");
    } finally {
      onProcessingChange(false);
    }
  }, [clips, crop, watermark, exportQuality, globalFadeIn, globalFadeOut, backgroundMusic, captionSettings, onProcessingChange, addToast]);

  // ─── Single-clip export ─────────────────────────────────

  const exportSingleClip = async (
    ffmpeg: Awaited<ReturnType<typeof getFFmpeg>>,
    clip: TimelineClip,
    dur: number,
    dim: { w: number; h: number }
  ) => {
    setStatusMessage("Exporting...");
    setProgress(30);

    const hasStickers = clip.stickerOverlays.length > 0;
    const hasBgMusic = !!backgroundMusic;

    // We need filter_complex when stickers or bgMusic are present (multiple inputs)
    const useFilterComplex = hasStickers || hasBgMusic;

    const vf: string[] = [];

    if (clip.playbackSpeed !== 1) vf.push(`setpts=${1 / clip.playbackSpeed}*PTS`);

    // Transform (rotate/flip)
    vf.push(...buildTransformFilters(clip));

    // Pan & Zoom
    const pzFilter = buildPanZoomFilter(clip.panZoom, dur, dim.w, dim.h);
    if (pzFilter) vf.push(pzFilter);

    // Color filters
    const b = (clip.filters.brightness - 100) / 100;
    const c = clip.filters.contrast / 100;
    if (b !== 0 || c !== 1) vf.push(`eq=brightness=${b}:contrast=${c}`);
    if (clip.filters.grayscale > 0) vf.push(`hue=s=${1 - clip.filters.grayscale / 100}`);

    const cropF = buildCropFilter(crop.preset);
    if (cropF) vf.push(cropF);

    if (exportQuality === "720p") vf.push("scale=-2:720");
    else if (exportQuality === "1080p") vf.push("scale=-2:1080");

    // Text overlays with animation support
    for (const o of clip.textOverlays) {
      if (o.text.trim()) {
        vf.push(buildTextDrawFilter(o, dur));
      }
    }

    // Captions
    if (captionSettings) vf.push(...buildCaptionFilters(captionSettings));

    // Watermark
    const wmF = buildWatermarkFilter(watermark);
    if (wmF) vf.push(wmF);

    // Fades
    if (globalFadeIn > 0) vf.push(`fade=t=in:st=0:d=${globalFadeIn}`);
    if (globalFadeOut > 0) vf.push(`fade=t=out:st=${Math.max(0, dur - globalFadeOut)}:d=${globalFadeOut}`);

    // Audio filters
    const af: string[] = [];
    if (clip.playbackSpeed !== 1 && !clip.audio.muted) af.push(...buildAtempoChain(clip.playbackSpeed));
    if (!clip.audio.muted && clip.audio.volume !== 1) af.push(`volume=${clip.audio.volume}`);
    if (!clip.audio.muted && clip.audio.fadeIn > 0) af.push(`afade=t=in:st=0:d=${clip.audio.fadeIn}`);
    if (!clip.audio.muted && clip.audio.fadeOut > 0) af.push(`afade=t=out:st=${Math.max(0, dur - clip.audio.fadeOut)}:d=${clip.audio.fadeOut}`);

    // ─── Build command ───
    const cmd: string[] = ["-i", "clip_0.mp4"];

    // Add sticker inputs
    const stickerInputOffset = 1 + (hasBgMusic ? 1 : 0);
    if (hasBgMusic) {
      if (backgroundMusic!.loop) cmd.push("-stream_loop", "-1");
      cmd.push("-i", "bg_music.mp3");
    }
    for (let j = 0; j < clip.stickerOverlays.length; j++) {
      cmd.push("-i", `sticker_0_${j}.png`);
    }

    if (useFilterComplex) {
      // Build filter_complex graph
      const fc: string[] = [];

      // Video chain
      let vLabel = "0:v";
      if (vf.length > 0) {
        fc.push(`[0:v]${vf.join(",")}[vbase]`);
        vLabel = "vbase";
      }

      // Sticker overlay chain
      for (let j = 0; j < clip.stickerOverlays.length; j++) {
        const s = clip.stickerOverlays[j];
        const inIdx = stickerInputOffset + j;
        const outLabel = `vs${j}`;
        fc.push(`[${vLabel}][${inIdx}:v]overlay=x=main_w*${s.x / 100}-overlay_w/2:y=main_h*${s.y / 100}-overlay_h/2:format=auto[${outLabel}]`);
        vLabel = outLabel;
      }

      // Audio chain
      if (hasBgMusic && !clip.audio.muted) {
        const clipAf = af.length > 0 ? af.join(",") : "anull";
        const bgVol = backgroundMusic!.volume;
        const bgFade: string[] = [];
        if (backgroundMusic!.fadeIn > 0) bgFade.push(`afade=t=in:st=0:d=${backgroundMusic!.fadeIn}`);
        if (backgroundMusic!.fadeOut > 0) bgFade.push(`afade=t=out:st=${Math.max(0, dur - backgroundMusic!.fadeOut)}:d=${backgroundMusic!.fadeOut}`);
        const bgChain = bgFade.length > 0 ? bgFade.join(",") + "," : "";
        fc.push(`[0:a]${clipAf}[ca]`);
        fc.push(`[1:a]${bgChain}volume=${bgVol}[ba]`);
        fc.push(`[ca][ba]amix=inputs=2:duration=first:dropout_transition=0[aout]`);
        cmd.push("-filter_complex", fc.join(";"));
        cmd.push("-map", `[${vLabel}]`, "-map", "[aout]");
      } else if (hasBgMusic && clip.audio.muted) {
        const bgVol = backgroundMusic!.volume;
        fc.push(`[1:a]volume=${bgVol}[aout]`);
        cmd.push("-filter_complex", fc.join(";"));
        cmd.push("-map", `[${vLabel}]`, "-map", "[aout]");
      } else if (clip.audio.muted) {
        cmd.push("-filter_complex", fc.join(";"));
        cmd.push("-map", `[${vLabel}]`, "-an");
      } else {
        if (af.length > 0) fc.push(`[0:a]${af.join(",")}[aout]`);
        cmd.push("-filter_complex", fc.join(";"));
        cmd.push("-map", `[${vLabel}]`);
        if (af.length > 0) cmd.push("-map", "[aout]");
      }
    } else {
      // Simple -vf/-af (no stickers, no bg music)
      if (vf.length > 0) cmd.push("-vf", vf.join(","));
      if (clip.audio.muted) cmd.push("-an");
      else if (af.length > 0) cmd.push("-af", af.join(","));
    }

    cmd.push("-c:v", "libx264", "-c:a", "aac", "-strict", "experimental", "-shortest", "output.mp4");

    setProgress(40);
    await ffmpeg.exec(cmd);
  };

  // ─── Multi-clip export with xfade ───────────────────────

  const exportMultiClip = async (
    ffmpeg: Awaited<ReturnType<typeof getFFmpeg>>,
    allClips: TimelineClip[],
    durations: number[],
    dimensions: { w: number; h: number }[]
  ) => {
    setStatusMessage("Building multi-clip export...");
    setProgress(30);

    const N = allClips.length;
    const parts: string[] = [];

    // Count sticker inputs needed
    let stickerCount = 0;
    const clipStickerOffset: number[] = []; // maps clip index → first sticker input index
    const bgMusicInputIdx = N + (backgroundMusic ? 0 : -1);
    const stickerBaseIdx = N + (backgroundMusic ? 1 : 0);

    for (let i = 0; i < N; i++) {
      clipStickerOffset.push(stickerBaseIdx + stickerCount);
      stickerCount += allClips[i].stickerOverlays.length;
    }

    // Per-clip video processing
    for (let i = 0; i < N; i++) {
      const clip = allClips[i];
      const vf: string[] = [];

      if (clip.trim.end > 0) {
        vf.push(`trim=start=${clip.trim.start}:end=${clip.trim.end}`, "setpts=PTS-STARTPTS");
      }
      if (clip.playbackSpeed !== 1) vf.push(`setpts=${1 / clip.playbackSpeed}*PTS`);

      // Transform (rotate/flip)
      vf.push(...buildTransformFilters(clip));

      // Pan & Zoom
      const pzFilter = buildPanZoomFilter(clip.panZoom, durations[i], dimensions[i].w, dimensions[i].h);
      if (pzFilter) vf.push(pzFilter);

      // Color filters
      const b = (clip.filters.brightness - 100) / 100;
      const c = clip.filters.contrast / 100;
      if (b !== 0 || c !== 1) vf.push(`eq=brightness=${b}:contrast=${c}`);
      if (clip.filters.grayscale > 0) vf.push(`hue=s=${1 - clip.filters.grayscale / 100}`);

      // Text overlays with animation
      for (const o of clip.textOverlays) {
        if (o.text.trim()) {
          vf.push(buildTextDrawFilter(o, durations[i]));
        }
      }

      // Base video label (before sticker overlays)
      const baseLabel = `pvb${i}`;
      parts.push(`[${i}:v]${vf.length > 0 ? vf.join(",") : "null"}[${baseLabel}]`);

      // Sticker overlays for this clip
      let currentLabel = baseLabel;
      for (let j = 0; j < clip.stickerOverlays.length; j++) {
        const s = clip.stickerOverlays[j];
        const stickerIdx = clipStickerOffset[i] + j;
        const outLabel = j === clip.stickerOverlays.length - 1 ? `pv${i}` : `pvs${i}_${j}`;
        parts.push(`[${currentLabel}][${stickerIdx}:v]overlay=x=main_w*${s.x / 100}-overlay_w/2:y=main_h*${s.y / 100}-overlay_h/2:format=auto[${outLabel}]`);
        currentLabel = outLabel;
      }

      // If no stickers, rename label to expected pv{i}
      if (clip.stickerOverlays.length === 0) {
        // Replace the baseLabel with pv{i} directly
        parts[parts.length - 1] = `[${i}:v]${vf.length > 0 ? vf.join(",") : "null"}[pv${i}]`;
      }
    }

    // Per-clip audio processing
    const allMuted = allClips.every((c) => c.audio.muted);
    if (!allMuted) {
      for (let i = 0; i < N; i++) {
        const clip = allClips[i];
        const af: string[] = [];

        if (clip.trim.end > 0) {
          af.push(`atrim=start=${clip.trim.start}:end=${clip.trim.end}`, "asetpts=PTS-STARTPTS");
        }
        if (clip.playbackSpeed !== 1) af.push(...buildAtempoChain(clip.playbackSpeed));
        if (clip.audio.muted) af.push("volume=0");
        else if (clip.audio.volume !== 1) af.push(`volume=${clip.audio.volume}`);

        parts.push(`[${i}:a]${af.length > 0 ? af.join(",") : "anull"}[pa${i}]`);
      }
    }

    // Video xfade chain
    let vLabel = "pv0";
    let cumDur = durations[0];

    for (let i = 1; i < N; i++) {
      const trans = allClips[i].transition;
      const tType = trans && trans.type !== "none" ? trans.type : "fade";
      const rawTDur = trans && trans.type !== "none" ? trans.duration : 0.01;
      const maxTDur = Math.min(durations[i - 1] / 2, durations[i] / 2, cumDur);
      const tDur = Math.max(0.01, Math.min(rawTDur, maxTDur));

      const offset = Math.max(0, cumDur - tDur);
      const out = `xv${i}`;
      parts.push(`[${vLabel}][pv${i}]xfade=transition=${tType}:duration=${tDur}:offset=${offset}[${out}]`);
      vLabel = out;
      cumDur = offset + durations[i];
    }

    // Global video effects
    const gv: string[] = [];
    const cropF = buildCropFilter(crop.preset);
    if (cropF) gv.push(cropF);
    if (exportQuality === "720p") gv.push("scale=-2:720");
    else if (exportQuality === "1080p") gv.push("scale=-2:1080");
    if (captionSettings) gv.push(...buildCaptionFilters(captionSettings));
    const wmF = buildWatermarkFilter(watermark);
    if (wmF) gv.push(wmF);
    if (globalFadeIn > 0) gv.push(`fade=t=in:st=0:d=${globalFadeIn}`);
    if (globalFadeOut > 0) gv.push(`fade=t=out:st=${Math.max(0, cumDur - globalFadeOut)}:d=${globalFadeOut}`);

    if (gv.length > 0) {
      parts.push(`[${vLabel}]${gv.join(",")}[vout]`);
      vLabel = "vout";
    }

    // Audio acrossfade chain
    let aLabel = "";
    if (!allMuted) {
      aLabel = "pa0";
      for (let i = 1; i < N; i++) {
        const trans = allClips[i].transition;
        const rawTDur = trans && trans.type !== "none" ? trans.duration : 0.01;
        const maxTDur = Math.min(durations[i - 1] / 2, durations[i] / 2);
        const tDur = Math.max(0.01, Math.min(rawTDur, maxTDur));

        const out = `xa${i}`;
        parts.push(`[${aLabel}][pa${i}]acrossfade=d=${tDur}:c1=tri:c2=tri[${out}]`);
        aLabel = out;
      }

      const ga: string[] = [];
      if (globalFadeIn > 0) ga.push(`afade=t=in:st=0:d=${globalFadeIn}`);
      if (globalFadeOut > 0) ga.push(`afade=t=out:st=${Math.max(0, cumDur - globalFadeOut)}:d=${globalFadeOut}`);
      if (ga.length > 0) {
        parts.push(`[${aLabel}]${ga.join(",")}[aout]`);
        aLabel = "aout";
      }
    }

    // Background music mixing
    if (backgroundMusic) {
      const bgVol = backgroundMusic.volume;
      const bgFade: string[] = [];
      if (backgroundMusic.fadeIn > 0) bgFade.push(`afade=t=in:st=0:d=${backgroundMusic.fadeIn}`);
      if (backgroundMusic.fadeOut > 0) bgFade.push(`afade=t=out:st=${Math.max(0, cumDur - backgroundMusic.fadeOut)}:d=${backgroundMusic.fadeOut}`);
      const bgChain = bgFade.length > 0 ? bgFade.join(",") + "," : "";

      if (!allMuted && aLabel) {
        parts.push(`[${bgMusicInputIdx}:a]${bgChain}volume=${bgVol}[bgm]`);
        parts.push(`[${aLabel}][bgm]amix=inputs=2:duration=first:dropout_transition=0[amixout]`);
        aLabel = "amixout";
      } else {
        parts.push(`[${bgMusicInputIdx}:a]${bgChain}volume=${bgVol}[bgm]`);
        aLabel = "bgm";
      }
    }

    // Build command
    const cmd: string[] = [];
    for (let i = 0; i < N; i++) cmd.push("-i", `clip_${i}.mp4`);
    if (backgroundMusic) {
      if (backgroundMusic.loop) cmd.push("-stream_loop", "-1");
      cmd.push("-i", "bg_music.mp3");
    }
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < allClips[i].stickerOverlays.length; j++) {
        cmd.push("-i", `sticker_${i}_${j}.png`);
      }
    }
    cmd.push("-filter_complex", parts.join(";"));
    cmd.push("-map", `[${vLabel}]`);
    if (aLabel) { cmd.push("-map", `[${aLabel}]`, "-c:a", "aac"); }
    else if (!allMuted) { cmd.push("-c:a", "aac"); }
    else { cmd.push("-an"); }
    cmd.push("-c:v", "libx264", "-strict", "experimental", "-shortest", "output.mp4");

    setStatusMessage("Processing multi-clip export...");
    setProgress(40);
    await ffmpeg.exec(cmd);
  };

  // ─── UI ─────────────────────────────────────────────────

  return (
    <div className="w-full">
      <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Export Settings</h3>

      {clips.length > 1 && (
        <div className="mb-3 px-3 py-2 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
          <div className="flex justify-between text-[11px]">
            <span style={{ color: 'var(--text-muted)' }}>Clips</span>
            <span style={{ color: 'var(--text-primary)' }}>{clips.length} clips</span>
          </div>
          <div className="flex justify-between text-[11px] mt-1">
            <span style={{ color: 'var(--text-muted)' }}>Transitions</span>
            <span style={{ color: 'var(--text-secondary)' }}>
              {clips.filter((c, i) => i > 0 && c.transition && c.transition.type !== "none").length} active
            </span>
          </div>
        </div>
      )}

      {/* Quality */}
      <div className="mb-3">
        <label className="text-[10px] uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-muted)' }}>Quality</label>
        <div className="flex gap-1.5">
          {QUALITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onExportQualityChange(opt.value)}
              className="flex-1 py-1.5 rounded-md text-[11px] font-medium transition-all"
              style={{
                background: exportQuality === opt.value ? 'var(--accent-success)' : 'var(--bg-elevated)',
                color: exportQuality === opt.value ? 'white' : 'var(--text-secondary)',
                border: `1px solid ${exportQuality === opt.value ? 'var(--accent-success)' : 'var(--border-subtle)'}`,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Global Fade */}
      <div className="mb-3">
        <label className="text-[10px] uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-muted)' }}>Intro/Outro Fade</label>
        <div className="flex gap-2">
          <div className="flex-1">
            <div className="flex justify-between text-[10px] mb-1">
              <span style={{ color: 'var(--text-muted)' }}>Fade In</span>
              <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{globalFadeIn}s</span>
            </div>
            <input type="range" min={0} max={3} step={0.5} value={globalFadeIn}
              onChange={(e) => onGlobalFadeInChange(parseFloat(e.target.value))} className="w-full" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-[10px] mb-1">
              <span style={{ color: 'var(--text-muted)' }}>Fade Out</span>
              <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{globalFadeOut}s</span>
            </div>
            <input type="range" min={0} max={3} step={0.5} value={globalFadeOut}
              onChange={(e) => onGlobalFadeOutChange(parseFloat(e.target.value))} className="w-full" />
          </div>
        </div>
      </div>

      {/* Progress */}
      {isProcessing && (
        <div className="mb-3">
          <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: 'var(--accent-success)' }} />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{statusMessage}</p>
            <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{progress}%</span>
          </div>
        </div>
      )}

      {/* Export button */}
      <button
        onClick={handleExport}
        disabled={isProcessing || clips.length === 0}
        className="w-full py-2 rounded-lg text-sm font-semibold transition-all"
        style={{
          background: isProcessing ? 'var(--bg-elevated)' : 'var(--accent-success)',
          color: isProcessing ? 'var(--text-muted)' : 'white',
          cursor: isProcessing ? 'not-allowed' : 'pointer',
        }}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Exporting...
          </span>
        ) : clips.length > 1 ? `Export ${clips.length} Clips` : "Export & Download"}
      </button>

      {!isProcessing && progress === 100 && (
        <div className="flex items-center justify-center gap-1.5 mt-2">
          <svg className="w-3.5 h-3.5" style={{ color: 'var(--accent-success)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <p className="text-[11px]" style={{ color: 'var(--accent-success)' }}>{statusMessage}</p>
        </div>
      )}
    </div>
  );
}
