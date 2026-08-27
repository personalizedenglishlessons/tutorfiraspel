// supabase/functions/rate-limited-login/index.ts
// Edge Function: wraps auth.signInWithPassword with per-IP rate limiting,
// input validation, and a honeypot check. Implements security items 3, 4
// (rate limit + bot protection, server-side) for the login endpoint.
//
// NOT yet wired into the live frontend (to protect the live auth flow).
// See README.md for deploy + integration steps.
//
// Env (set in Dashboard > Edge Functions > Secrets):
//   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const URL_ = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SVC_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const MAX_ATTEMPTS = 5;       // per IP per window
const WINDOW_MINUTES = 15;

const cors = {
  "Access-Control-Allow-Origin": "*", // tighten to your pages origin in prod
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function clientIp(req: Request): string {
  return req.headers.get("cf-connecting-ip")
      || (req.headers.get("x-forwarded-for") || "").split(",")[0].trim()
      || "unknown";
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...cors },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let body: { email?: string; password?: string; hp?: string };
  try { body = await req.json(); } catch { return json({ error: "bad_body" }, 400); }

  // honeypot: real clients send hp="" (hidden field); bots fill it.
  if (body.hp) return json({ ok: true } as unknown, 200); // silently accept bots

  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: "invalid_email" }, 400);
  if (password.length < 6) return json({ error: "invalid_password" }, 400);

  const ip = clientIp(req);
  const auth = createClient(URL_, ANON_KEY);          // public auth call
  const admin = createClient(URL_, SVC_KEY);          // service role: count+log attempts

  const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();
  const { count, error: cErr } = await admin
    .from("auth_attempts")
    .select("*", { count: "exact", head: true })
    .eq("ip", ip).gte("created_at", since);
  if (cErr) return json({ error: "rate_check_failed" }, 500);
  if ((count ?? 0) >= MAX_ATTEMPTS)
    return json({ error: "too_many_attempts", retry_after_minutes: WINDOW_MINUTES }, 429);

  const { data, error } = await auth.auth.signInWithPassword({ email, password });
  await admin.from("auth_attempts").insert({ ip, email, ok: !error });
  if (error) return json({ error: "auth_failed" }, 401);
  return json({ session: data.session }, 200);
});
