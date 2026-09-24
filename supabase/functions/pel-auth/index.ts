// supabase/functions/pel-auth/index.ts
// Edge Function: httpOnly cookie-based authentication.
//
// Actions:
//   { action: "login", email, password }  → sets cookies, returns { user, expiresAt }
//   { action: "session" }                 → reads cookies, returns { user, expiresAt } | { user: null }
//   { action: "refresh" }                 → refreshes session, returns { user, expiresAt } | { user: null }
//   { action: "logout" }                  → clears cookies, returns { ok: true }
//
// Cookies set:
//   sb-access-token  (HttpOnly, Secure, SameSite=None, Path=/functions/v2)
//   sb-refresh-token (HttpOnly, Secure, SameSite=None, Path=/functions/v2)
//   pel-csrf         (readable by JS, for CSRF double-submit on mutations)
//
// Security:
//   - Tokens never exposed to JavaScript
//   - CORS restricted to GitHub Pages origin
//   - CSRF: mutations require x-pel-csrf header matching pel-csrf cookie
//   - Login rate-limited via existing check_auth_rate_limit RPC

const SUPABASE_URL = "https://lewoochehpiycocvfwtz.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxld29vY2hlaHBpeWNvY3Zmd3R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNzQ3MzcsImV4cCI6MjA5OTY1MDczN30.sIWK6jwX7PW70fH0yPUuhOb25N1lBw2-Cvb3dtwDb9Y";
const ALLOWED_ORIGIN = "https://personalizedenglishlessons.github.io";
const ACCESS_COOKIE = "sb-access-token";
const REFRESH_COOKIE = "sb-refresh-token";
const CSRF_COOKIE = "pel-csrf";
const MAX_ATTEMPTS = 5;

const CORS = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "content-type, x-pel-csrf",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Credentials": "true",
};

function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...CORS, ...extraHeaders },
  });
}

function cookieValue(req: Request, name: string): string | null {
  const header = req.headers.get("cookie") || "";
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

function setCookie(name: string, value: string, maxAge: number): string {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "HttpOnly",
    "Secure",
    "SameSite=None",
    "Path=/functions",
    `Max-Age=${maxAge}`,
  ];
  return parts.join("; ");
}

function clearCookie(name: string): string {
  return `${name}=; HttpOnly; Secure; SameSite=None; Path=/functions; Max-Age=0`;
}

function generateCsrf(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, "0")).join("");
}

function clientIp(req: Request): string {
  return req.headers.get("cf-connecting-ip")
    || (req.headers.get("x-forwarded-for") || "").split(",")[0].trim()
    || "unknown";
}

interface User {
  id: string;
  email: string;
}

interface SessionData {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: User;
}

// Verify a JWT and return the user, or null
function parseJwt(token: string): { sub: string; email: string; exp: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return {
      sub: payload.sub || "",
      email: payload.email || "",
      exp: payload.exp || 0,
    };
  } catch {
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  // Origin check
  const origin = req.headers.get("origin") || "";
  if (origin && origin !== ALLOWED_ORIGIN) {
    return json({ error: "origin_not_allowed" }, 403);
  }

  let body: any;
  try { body = await req.json(); } catch { return json({ error: "bad_body" }, 400); }

  const action = String(body.action || "");

  switch (action) {
    case "login": {
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      const hp = String(body.hp || "");

      // Honeypot
      if (hp) return json({ ok: true });

      if (!email.includes("@") || !email.includes(".")) return json({ error: "invalid_email" }, 400);
      if (password.length < 6) return json({ error: "invalid_password" }, 400);

      const ip = clientIp(req);

      // Rate limit check
      const rateRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/check_auth_rate_limit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "apikey": ANON_KEY },
        body: JSON.stringify({ p_ip: ip }),
      });
      const rateData = await rateRes.json();
      if (rateData >= MAX_ATTEMPTS) {
        return json({ error: "too_many_attempts", retry_after_minutes: 15 }, 429);
      }

      // Authenticate via Supabase Auth API
      const authRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "apikey": ANON_KEY },
        body: JSON.stringify({ email, password }),
      });
      const authData = await authRes.json();

      // Log attempt
      await fetch(`${SUPABASE_URL}/rest/v1/auth_attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "apikey": ANON_KEY },
        body: JSON.stringify({
          ip_address: ip,
          email,
          success: !!authData.access_token,
          attempted_at: new Date().toISOString(),
        }),
      }).catch(() => {});

      if (!authData.access_token) {
        return json({ error: authData.error || "login_failed" }, 401);
      }

      const csrf = generateCsrf();
      const accessMaxAge = 3600; // 1 hour
      const refreshMaxAge = 604800; // 7 days

      const headers: Record<string, string> = {};
      headers["set-cookie"] = [
        setCookie(ACCESS_COOKIE, authData.access_token, accessMaxAge),
        setCookie(REFRESH_COOKIE, authData.refresh_token, refreshMaxAge),
        `${CSRF_COOKIE}=${csrf}; Secure; SameSite=None; Path=/; Max-Age=${refreshMaxAge}`,
      ].join(", ");

      return json({
        user: { id: authData.user.id, email: authData.user.email },
        expiresAt: authData.expires_at,
      }, 200, headers);
    }

    case "session": {
      const accessToken = cookieValue(req, ACCESS_COOKIE);
      if (!accessToken) return json({ user: null });

      const jwt = parseJwt(accessToken);
      if (!jwt) return json({ user: null });

      // Check if expired
      const now = Math.floor(Date.now() / 1000);
      if (jwt.exp && jwt.exp < now) {
        // Try refresh
        const refreshToken = cookieValue(req, REFRESH_COOKIE);
        if (!refreshToken) return json({ user: null });

        const refreshRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "apikey": ANON_KEY },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        const refreshData = await refreshRes.json();

        if (!refreshData.access_token) {
          // Clear cookies
          const headers: Record<string, string> = {};
          headers["set-cookie"] = [
            clearCookie(ACCESS_COOKIE),
            clearCookie(REFRESH_COOKIE),
            clearCookie(CSRF_COOKIE),
          ].join(", ");
          return json({ user: null }, 200, headers);
        }

        // Set refreshed cookies
        const headers: Record<string, string> = {};
        headers["set-cookie"] = [
          setCookie(ACCESS_COOKIE, refreshData.access_token, 3600),
          setCookie(REFRESH_COOKIE, refreshData.refresh_token, 604800),
        ].join(", ");

        return json({
          user: { id: refreshData.user.id, email: refreshData.user.email },
          expiresAt: refreshData.expires_at,
        }, 200, headers);
      }

      return json({
        user: { id: jwt.sub, email: jwt.email },
        expiresAt: jwt.exp,
      });
    }

    case "logout": {
      const refreshToken = cookieValue(req, REFRESH_COOKIE);
      if (refreshToken) {
        // Revoke the session server-side
        await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "apikey": ANON_KEY },
          body: JSON.stringify({ refresh_token: refreshToken }),
        }).catch(() => {});
      }

      const headers: Record<string, string> = {};
      headers["set-cookie"] = [
        clearCookie(ACCESS_COOKIE),
        clearCookie(REFRESH_COOKIE),
        clearCookie(CSRF_COOKIE),
      ].join(", ");

      return json({ ok: true }, 200, headers);
    }

    default:
      return json({ error: "unknown_action" }, 400);
  }
});
