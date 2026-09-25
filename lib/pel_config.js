/* ============================================================
   PEL CONFIG - Single source of truth for Supabase credentials
   Loaded before all other scripts in app.html and admin.html

   Also provides pelAuth() and pelApi() helpers for the httpOnly
   cookie-based session system. These call the pel-auth and pel-api
   Edge Functions. The existing Supabase JS client (window.supabase)
   remains available for backward compatibility and anon reads.
   ============================================================ */
(function(){
  window.PEL_CONFIG = {
    SUPABASE_URL: 'https://lewoochehpiycocvfwtz.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxld29vY2hlaHBpeWNvY3Zmd3R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNzQ3MzcsImV4cCI6MjA5OTY1MDczN30.sIWK6jwX7PW70fH0yPUuhOb25N1lBw2-Cvb3dtwDb9Y'
  };

  // Edge Function URLs (deployed as v1 by Supabase CLI 2.78)
  var AUTH_URL = PEL_CONFIG.SUPABASE_URL + '/functions/v1/pel-auth';
  var API_URL  = PEL_CONFIG.SUPABASE_URL + '/functions/v1/pel-api';

  // Cached session (so we don't hit the Edge Function on every call)
  var _session = null;
  var _sessionPromise = null;
  var _csrfToken = null; // cached from pel-auth response (cross-domain cookies can't be read by JS)

  /* ---- CSRF token: use cached value from pelAuth response ---- */
  function getCsrf(){
    // First try cached value from pelAuth response
    if(_csrfToken) return _csrfToken;
    // Fallback: try reading from cookie (same-domain only)
    var header = document.cookie || '';
    var parts = header.split(';');
    for(var i=0;i<parts.length;i++){
      var p = parts[i].trim().split('=');
      if(p[0] === 'pel-csrf') return decodeURIComponent(p.slice(1).join('='));
    }
    return null;
  }

  /* ---- pelAuth: login, session check, logout via Edge Function ---- */
  // action: 'login' | 'session' | 'logout'
  // data: { email, password, hp } for login; {} for session/logout
  // Returns: { user, expiresAt } | { user: null } | { ok: true }
  window.pelAuth = async function(action, data){
    data = data || {};
    try{
      var res = await fetch(AUTH_URL, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({ action: action }, data))
      });
      var result = await res.json();
      // Cache CSRF token from response (cross-domain cookies can't be read by JS)
      if(result && result.csrf){
        _csrfToken = result.csrf;
      }
      if(action === 'session'){
        _session = result;
      }
      if(action === 'logout'){
        _session = null;
        _sessionPromise = null;
        _csrfToken = null;
      }
      return result;
    }catch(e){
      if(action === 'session') return { user: null };
      return { error: 'network_error' };
    }
  };

  /* ---- pelApi: call allowlisted RPC/table ops via Edge Function ---- */
  // op: operation name (must be in the allowlist)
  // payload: { ... } passed to the RPC or table operation
  // Returns: { ok: true, data: ... } | { ok: false, error: ... }
  window.pelApi = async function(op, payload){
    payload = payload || {};
    var csrf = getCsrf();
    if(!csrf){
      return { ok: false, error: 'no_csrf' };
    }
    try{
      var res = await fetch(API_URL, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-pel-csrf': csrf
        },
        body: JSON.stringify({ op: op, payload: payload })
      });
      return await res.json();
    }catch(e){
      return { ok: false, error: 'network_error' };
    }
  };

  /* ---- Session cache helper (avoids repeated Edge Function calls) ---- */
  // Returns cached session or fetches fresh if not cached
  window.pelSession = async function(){
    if(_session) return _session;
    if(_sessionPromise) return _sessionPromise;
    _sessionPromise = pelAuth('session').then(function(s){
      _session = s;
      _sessionPromise = null;
      return s;
    }).catch(function(){
      _sessionPromise = null;
      return { user: null };
    });
    return _sessionPromise;
  };

  // Clear session cache (call after any auth change)
  window.pelClearSession = function(){
    _session = null;
    _sessionPromise = null;
  };

  /* ---- pelRpc: wrapper for RPC calls ---- */
  // When PEL_COOKIE_AUTH is true, routes through pelApi (cookie-based).
  // Otherwise, falls back to the Supabase JS client (legacy).
  // Usage: pelRpc('rpc_name', { p_arg: value }) → { data, error }
  window.pelRpc = async function(name, args){
    if(window.PEL_COOKIE_AUTH && typeof window.pelApi === 'function'){
      var r = await pelApi(name, args || {});
      if(r && r.ok) return { data: r.data, error: null };
      return { data: null, error: (r && r.error) || 'rpc_failed' };
    }
    // Legacy: use Supabase JS client
    var c = window.pelSupabaseClient ? window.pelSupabaseClient() : null;
    if(!c) return { data: null, error: 'no_client' };
    return c.rpc(name, args || {});
  };

  /* ---- pelTableSelect: wrapper for table SELECT ---- */
  // When PEL_COOKIE_AUTH is true, routes through pelApi.
  // Otherwise, falls back to the Supabase JS client.
  // Usage: pelTableSelect('student_data', 'key,value', { eq: { user_id: uid } }) → { data, error }
  window.pelTableSelect = async function(table, columns, filters){
    if(window.PEL_COOKIE_AUTH && typeof window.pelApi === 'function'){
      // Map to pelApi table_select operation
      // The op name must be in the allowlist in pel-api/index.ts
      var opName = table + '_get'; // e.g. student_data_get
      var payload = {};
      if(filters && filters.eq) payload.eq = filters.eq;
      if(filters && filters.in) payload.in = filters.in;
      if(filters && filters.order) payload.order = filters.order;
      if(filters && filters.limit) payload.limit = filters.limit;
      var r = await pelApi(opName, payload);
      if(r && r.ok) return { data: r.data, error: null };
      return { data: null, error: (r && r.error) || 'select_failed' };
    }
    // Legacy: use Supabase JS client
    var cl = window.pelSupabaseClient ? window.pelSupabaseClient() : null;
    if(!cl) return { data: null, error: 'no_client' };
    var q = cl.from(table).select(columns || '*');
    if(filters){
      if(filters.eq){
        for(var k in filters.eq){ q = q.eq(k, filters.eq[k]); }
      }
      if(filters.in){
        for(var k2 in filters.in){ q = q.in(k2, filters.in[k2]); }
      }
      if(filters.order){
        // Support comma-separated orders like 'sort_order,id' or 'created_at.desc'
        var orders = String(filters.order).split(',');
        for(var i=0;i<orders.length;i++){
          var o = orders[i].trim();
          if(o.indexOf('.') !== -1){
            var parts = o.split('.');
            q = q.order(parts[0], { ascending: parts[1] !== 'desc' });
          } else {
            q = q.order(o, { ascending: true });
          }
        }
      }
      if(filters.limit){ q = q.limit(filters.limit); }
    }
    return q;
  };

  /* ---- pelTableUpsert: wrapper for table UPSERT ---- */
  window.pelTableUpsert = async function(table, row, conflict){
    if(window.PEL_COOKIE_AUTH && typeof window.pelApi === 'function'){
      var opName = table + '_set'; // e.g. student_state_set
      var r = await pelApi(opName, row);
      if(r && r.ok) return { data: r.data, error: null };
      return { data: null, error: (r && r.error) || 'upsert_failed' };
    }
    // Legacy: use Supabase JS client
    var cl = window.pelSupabaseClient ? window.pelSupabaseClient() : null;
    if(!cl) return { data: null, error: 'no_client' };
    var opts = {};
    if(conflict) opts.onConflict = conflict;
    return cl.from(table).upsert(row, opts);
  };

  // Initialize cookie auth flag
  window.PEL_COOKIE_AUTH = false;
})();
