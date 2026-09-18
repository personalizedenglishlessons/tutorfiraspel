// supabase/functions/rate-limited-login/index.ts
// Edge Function: per-IP rate limiting for login, no external imports needed
// Uses plain fetch() calls instead of the Supabase JS client to avoid
// import issues. Public values (URL, anon key) are safe to hardcode here.
//
// Frontend contract:
//   request:  { email: string, password: string, hp?: string }
//   response: { session: {...} } | { error: string }
//
// Env (auto-injected by Supabase runtime, not needed as secrets):
//   SUPABASE_URL, SUPABASE_ANON_KEY (hardcoded as fallback below)

const SUPABASE_URL = "https://lewoochehpiycocvfwtz.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxld29vY2hlaHBpeWNvY3Zmd3R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNzQ3MzcsImV4cCI6MjA5OTY1MDczN30.sIWK6jwX7PW70fH0yPUuhOb25N1lBw2-Cvb3dtwDb9Y";
const MAX_ATTEMPTS = 5;

const cors = {
  "Access-Control-Allow-Origin": "https://personalizedenglishlessons.github.io",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResp(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...cors },
  });
}

function clientIp(req) {
  return req.headers.get("cf-connecting-ip")
      || (req.headers.get("x-forwarded-for") || "").split(",")[0].trim()
      || "unknown";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return jsonResp({ error: "method_not_allowed" }, 405);

  let body;
  try { body = await req.json(); } catch { return jsonResp({ error: "bad_body" }, 400); }

  // Honeypot: real clients send hp="" (hidden field); bots fill it
  if (body.hp) return jsonResp({ ok: true }, 200);

  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!email.includes("@") || !email.includes(".")) return jsonResp({ error: "invalid_email" }, 400);
  if (password.length < 6) return jsonResp({ error: "invalid_password" }, 400);

  const ip = clientIp(req);

  // Check rate limit via RPC (security-definer function, bypasses RLS)
  const rateRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/check_auth_rate_limit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": ANON_KEY,
    },
    body: JSON.stringify({ p_ip: ip }),
  });
  const rateData = await rateRes.json();
  if (rateData >= MAX_ATTEMPTS) {
    return jsonResp({ error: "too_many_attempts", retry_after_minutes: 15 }, 429);
  }

  // Attempt login via Supabase Auth API
  const authRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": ANON_KEY,
    },
    body: JSON.stringify({ email, password }),
  });
  const authData = await authRes.json();

  // Log the attempt (RLS allows anon INSERT into auth_attempts)
  await fetch(`${SUPABASE_URL}/rest/v1/auth_attempts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": ANON_KEY,
    },
    body: JSON.stringify({ ip, email, ok: authRes.ok }),
  });

  if (!authRes.ok) {
    return jsonResp({ error: "auth_failed" }, 401);
  }

  return jsonResp({ session: authData }, 200);
});
