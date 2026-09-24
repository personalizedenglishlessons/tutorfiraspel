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

  // Edge Function URLs
  var AUTH_URL = PEL_CONFIG.SUPABASE_URL + '/functions/v2/pel-auth';
  var API_URL  = PEL_CONFIG.SUPABASE_URL + '/functions/v2/pel-api';

  // Cached session (so we don't hit the Edge Function on every call)
  var _session = null;
  var _sessionPromise = null;

  /* ---- CSRF token (read from pel-csrf cookie set by pel-auth/login) ---- */
  function getCsrf(){
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
      if(action === 'session'){
        _session = result;
      }
      if(action === 'logout'){
        _session = null;
        _sessionPromise = null;
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
})();
