import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured on the server" },
      { status: 500 }
    );
  }

  const openai = new OpenAI({ apiKey });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("audio");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json(
      { error: "No audio file provided" },
      { status: 400 }
    );
  }

  // Convert Blob to a File object that OpenAI SDK expects
  const audioFile = new File([file], "audio.mp3", { type: "audio/mpeg" });

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["segment"],
    });

    // Extract segments with timestamps
    const segments = (
      (transcription as unknown as { segments?: { start: number; end: number; text: string }[] })
        .segments ?? []
    ).map((seg) => ({
      start: seg.start,
      end: seg.end,
      text: seg.text.trim(),
    }));

    return NextResponse.json({ segments });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Transcription failed";
    console.error("Whisper API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
