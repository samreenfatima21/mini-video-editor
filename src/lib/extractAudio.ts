import { getFFmpeg } from "./ffmpeg";
import { fetchFile } from "@ffmpeg/util";

/**
 * Extract audio from a video File as a 16kHz mono MP3 Blob.
 * Uses the existing FFmpeg.wasm singleton instance.
 */
export async function extractAudio(videoFile: File): Promise<Blob> {
  const ffmpeg = await getFFmpeg();

  const inputName = "input_video";
  const outputName = "audio.mp3";

  // Write the video file into FFmpeg's virtual filesystem
  await ffmpeg.writeFile(inputName, await fetchFile(videoFile));

  // Extract audio: no video, MP3 codec, 16kHz sample rate, mono channel
  await ffmpeg.exec([
    "-i", inputName,
    "-vn",
    "-acodec", "libmp3lame",
    "-ar", "16000",
    "-ac", "1",
    outputName,
  ]);

  // Read the output file
  const data = await ffmpeg.readFile(outputName);

  // Clean up virtual filesystem
  await ffmpeg.deleteFile(inputName);
  await ffmpeg.deleteFile(outputName);

  // Convert to Blob — copy into a standard ArrayBuffer to satisfy strict TS
  const raw = data as Uint8Array;
  const buf = new Uint8Array(raw.length);
  buf.set(raw);
  return new Blob([buf], { type: "audio/mpeg" });
}
