// FFmpeg.wasm setup — this lets us process video right in the browser!
// Normally video editing needs a server, but FFmpeg.wasm runs FFmpeg
// (a powerful video tool) directly in your browser using WebAssembly.

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

// We keep ONE instance of FFmpeg and reuse it (singleton pattern)
let ffmpeg: FFmpeg | null = null;

export async function getFFmpeg(): Promise<FFmpeg> {
  // If we already created FFmpeg, just return it
  if (ffmpeg) return ffmpeg;

  // Create a new FFmpeg instance
  ffmpeg = new FFmpeg();

  // Log FFmpeg messages to the browser console (helps with debugging)
  ffmpeg.on("log", ({ message }) => {
    console.log("[FFmpeg]", message);
  });

  // Load the FFmpeg core files from a CDN
  // Using the single-threaded version — more compatible across browsers
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";

  try {
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });
    console.log("FFmpeg loaded successfully!");
  } catch (error) {
    console.error("FFmpeg failed to load:", error);
    ffmpeg = null;
    throw error;
  }

  return ffmpeg;
}
