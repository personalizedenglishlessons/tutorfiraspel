// supabase/functions/transcribe/index.ts
// Edge Function: speech-to-text for browsers that have no SpeechRecognition
// API (e.g. iOS Safari). The frontend records audio with MediaRecorder and
// POSTs it here; this function transcribes it and returns { text }.
// The frontend then scores that transcript locally with the same
// wordMatchScore / pronFeedback engine used for Android/desktop.
//
// Transcription provider: OpenAI Whisper (audio.transcriptions.create).
// Set OPENAI_API_KEY in Dashboard > Edge Functions > Secrets to enable it.
// If the key is missing, the function returns a clear error so the frontend
// can fall back gracefully (typed input) instead of looking broken.
//
// Deploy:
//   supabase functions deploy transcribe
//   supabase secrets set OPENAI_API_KEY=sk-...
//
// Env:
//   OPENAI_API_KEY  (required for transcription)

const OPENAI_KEY = Deno.env.get("OPENAI_API_KEY") || "";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...cors },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  if (!OPENAI_KEY) return json({ error: "transcription_not_configured", message: "OPENAI_API_KEY not set" }, 503);

  // Accept either multipart/form-data (audio file) or JSON { audio: base64, mime }.
  let audioBlob: Blob | null = null;
  const ct = req.headers.get("content-type") || "";
  try {
    if (ct.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("audio") || form.get("file");
      if (file instanceof Blob) audioBlob = file;
    } else {
      const body = await req.json();
      const b64 = body.audio || body.data;
      const mime = body.mime || "audio/webm";
      if (b64) audioBlob = new Blob([Uint8Array.from(atob(b64), c => c.charCodeAt(0))], { type: mime });
    }
  } catch { return json({ error: "bad_body" }, 400); }

  if (!audioBlob || audioBlob.size === 0) return json({ error: "no_audio" }, 400);
  if (audioBlob.size > 25 * 1024 * 1024) return json({ error: "audio_too_large" }, 413);

  // Whisper accepts webm/opus (MediaRecorder default), m4a, wav, mp3...
  const ext = (audioBlob.type.includes("webm") ? "webm"
    : audioBlob.type.includes("mp4") || audioBlob.type.includes("m4a") ? "m4a"
    : audioBlob.type.includes("wav") ? "wav" : "webm");

  try {
    const fd = new FormData();
    fd.append("file", audioBlob, "speech." + ext);
    fd.append("model", "whisper-1");
    fd.append("language", "en");
    fd.append("response_format", "text");
    const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: "Bearer " + OPENAI_KEY },
      body: fd,
      signal: AbortSignal.timeout(30_000),
    });
    if (!r.ok) {
      const t = await r.text();
      return json({ error: "whisper_failed", status: r.status, message: t.slice(0, 300) }, 502);
    }
    const text = (await r.text()).trim();
    return json({ text }, 200);
  } catch (e) {
    return json({ error: "transcription_error", message: String(e) }, 500);
  }
});
