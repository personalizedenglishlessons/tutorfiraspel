// supabase/functions/tutor-ai/index.ts
//
// ARCHIVED — deleted from Supabase on 2026-09-18.
// This function was deployed (v11) but NEVER called from the app frontend,
// and referenced tables (student_plans, tutor_usage, learning_history) that
// did not exist in the database. It required a GROQ_API_KEY (paid third-party
// API). The app's built-in teaching content (Saudi Mistake Coach, Teaching
// Content, Pronunciation Hints, Grammar Rules, SRS) provides a complete,
// free, unlimited learning experience without any external API calls.
//
// Original source preserved below for reference only. Do NOT redeploy.
//
// ---
//
// Secure AI proxy for Tutor Firas / Speaking Studio / Writing Workshop /
// Quick Translate, with per-student daily usage limits, basic abuse
// protection, and a learning_history log. GROQ_API_KEY never reaches the
// browser. Errors returned to the frontend are always generic codes —
// never Groq/API/token/quota/model names, per product requirement.
//
// Frontend contract (unchanged):
//   request:  { system: string, messages: [{role, content}, ...], mode?: string }
//   response: { content: [{ type: "text", text: "..." }], usage: {used, limit, planName} }
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// ---- single configuration point -------------------------------------
const AI_CONFIG = {
  provider: 'groq',
  endpoint: 'https://api.groq.com/openai/v1/chat/completions',
  model: 'llama-3.1-8b-instant',
  fallbackModel: 'llama-3.3-70b-versatile',
  maxTokens: 700,
  timeoutMs: 20000
};
const LIMITS = {
  defaultDailyLimit: 50,
  cooldownMs: 3000,
  duplicateWindowMs: 15000,
  maxMessageLength: 2000
};
// -----------------------------------------------------------------------
const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
// Only these generic codes ever leave this function — no provider name,
// model name, token count, or raw error text is ever shown to a student.
function jsonError(errorCode, status, detail) {
  return new Response(JSON.stringify({
    error: errorCode,
    detail
  }), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}
async function callGroq(model, system, messages) {
  const controller = new AbortController();
  const timer = setTimeout(()=>controller.abort(), AI_CONFIG.timeoutMs);
  try {
    return await fetch(AI_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model,
        max_tokens: AI_CONFIG.maxTokens,
        messages: [
          {
            role: 'system',
            content: system
          },
          ...messages
        ]
      }),
      signal: controller.signal
    });
  } finally{
    clearTimeout(timer);
  }
}
Deno.serve(async (req)=>{
  if (req.method === 'OPTIONS') return new Response('ok', {
    headers: corsHeaders
  });
  if (!GROQ_API_KEY) return jsonError('invalid_key', 500, 'GROQ_API_KEY is not set on the server.');
  // 1. Require a logged-in student. All DB calls below run AS this
  //    student (their JWT is forwarded), so RLS applies throughout —
  //    this function has no elevated access beyond what the student has.
  let userId;
  let db;
  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    });
    const { data, error: authError } = await db.auth.getUser();
    if (authError || !data.user) return jsonError('auth', 401, 'Not authenticated');
    userId = data.user.id;
  } catch (e) {
    return jsonError('auth', 401, 'Could not verify session');
  }
  // 2. Parse the request body.
  let system, messages, mode;
  try {
    const body = await req.json();
    system = body.system || '';
    messages = body.messages;
    mode = body.mode || 'tutor';
    if (!Array.isArray(messages) || messages.length === 0) return jsonError('bad_request', 400, 'messages required');
  } catch (e) {
    return jsonError('bad_request', 400, 'Invalid JSON body');
  }
  const lastUserMessage = String(messages[messages.length - 1]?.content ?? '');
  if (lastUserMessage.length > LIMITS.maxMessageLength) {
    return jsonError('bad_request', 400, `Message exceeds ${LIMITS.maxMessageLength} characters`);
  }
  // 3. Load the student's plan (default to the free plan if they have no row).
  const { data: planRow } = await db.from('student_plans').select('plan_name, daily_question_limit').eq('user_id', userId).maybeSingle();
  const dailyLimit = planRow?.daily_question_limit ?? LIMITS.defaultDailyLimit;
  const planName = planRow?.plan_name ?? 'free';
  const isUnlimited = dailyLimit < 0;
  // 4. Load today's usage.
  const today = new Date().toISOString().slice(0, 10);
  const { data: usageRow } = await db.from('tutor_usage').select('questions_used, last_question_at').eq('user_id', userId).eq('usage_date', today).maybeSingle();
  const questionsUsed = usageRow?.questions_used ?? 0;
  if (!isUnlimited && questionsUsed >= dailyLimit) {
    return jsonError('daily_limit_reached', 429, {
      used: questionsUsed,
      limit: dailyLimit
    });
  }
  // 5. Cooldown between requests.
  if (usageRow?.last_question_at) {
    const elapsed = Date.now() - new Date(usageRow.last_question_at).getTime();
    if (elapsed < LIMITS.cooldownMs) return jsonError('cooldown', 429, `Wait ${LIMITS.cooldownMs - elapsed}ms`);
  }
  // 6. Duplicate question detection (same question sent again within the window).
  const { data: lastHistoryRow } = await db.from('learning_history').select('question, created_at').eq('user_id', userId).order('created_at', {
    ascending: false
  }).limit(1).maybeSingle();
  if (lastHistoryRow && lastHistoryRow.question?.trim().toLowerCase() === lastUserMessage.trim().toLowerCase()) {
    const elapsed = Date.now() - new Date(lastHistoryRow.created_at).getTime();
    if (elapsed < LIMITS.duplicateWindowMs) return jsonError('duplicate', 429, 'Duplicate question, please wait');
  }
  // 7. Call Groq, falling back to a second model on 400/404/429 from the primary.
  let res;
  try {
    res = await callGroq(AI_CONFIG.model, system, messages);
    if (res.status === 400 || res.status === 404 || res.status === 429) {
      const fallbackRes = await callGroq(AI_CONFIG.fallbackModel, system, messages);
      if (fallbackRes.ok) res = fallbackRes;
    }
  } catch (e) {
    if (e?.name === 'AbortError') return jsonError('timeout', 504, 'Request timed out');
    return jsonError('network', 502, String(e));
  }
  if (res.status === 401 || res.status === 403) return jsonError('invalid_key', 500, 'Provider rejected the credentials');
  if (res.status === 429) return jsonError('rate_limit', 429, 'Provider rate limit reached');
  if (!res.ok) return jsonError('provider_error', 502, await res.text());
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) return jsonError('empty', 502, 'Empty response from model');
  // 8. Only now — after a successful response — record usage and history.
  const nowIso = new Date().toISOString();
  const newCount = questionsUsed + 1;
  await db.from('tutor_usage').upsert({
    user_id: userId,
    usage_date: today,
    questions_used: newCount,
    last_question_at: nowIso,
    updated_at: nowIso
  }, {
    onConflict: 'user_id,usage_date'
  });
  await db.from('learning_history').insert({
    user_id: userId,
    mode,
    question: lastUserMessage.slice(0, 500),
    response_summary: text.slice(0, 500)
  });
  // Normalize to the same response shape regardless of provider, plus
  // usage info so the frontend can show a live counter.
  return new Response(JSON.stringify({
    content: [
      {
        type: 'text',
        text
      }
    ],
    usage: {
      used: newCount,
      limit: isUnlimited ? -1 : dailyLimit,
      planName
    }
  }), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
