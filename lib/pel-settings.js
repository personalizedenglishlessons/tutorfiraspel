/* ============================================================
   PEL shared site-settings loader
   ------------------------------------------------------------
   Fetches public configuration from Supabase once per page and
   exposes it as window.PEL_SITE, then dispatches
   'pel-site-settings' so consumers can re-render.

   Consumers:
     - index.html  : banner text/link, plan-6m availability,
                     homepage FAQs, WhatsApp number rewrite
     - login.html  : maintenance notice
     - app.html    : WhatsApp support number override
     - admin.js    : Site Settings editor

   Silent no-op on any failure - pages keep their built-in
   defaults. Loaded before consumer scripts.
   ============================================================ */
(function(){
  var SB_URL = 'https://lewoochehpiycocvfwtz.supabase.co';
  var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxld29vY2hlaHBpeWNvY3Zmd3R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNzQ3MzcsImV4cCI6MjA5OTY1MDczN30.sIWK6jwX7PW70fH0yPUuhOb25N1lBw2-Cvb3dtwDb9Y';

  function buildSite(rows){
    var raw = {};
    (Array.isArray(rows) ? rows : []).forEach(function(row){
      if(row && row.key) raw[row.key] = row.value;
    });
    var banner = (raw.banner && typeof raw.banner === 'object') ? raw.banner : null;
    return {
      banner: banner,
      plan6mAvailable: raw.plan_6m_available === true,
      maintenanceMode: raw.maintenance_mode === true,
      whatsapp: (typeof raw.whatsapp_contact === 'string' && raw.whatsapp_contact) || null,
      faqs: Array.isArray(raw.faqs) ? raw.faqs : null,
      /* admin-editable index copy (falls back to built-in copy if absent) */
      heroHeadline: raw.hero_headline || null,
      heroSub: raw.hero_sub || null,
      pricingNote: raw.pricing_note || null
    };
  }

  window.PEL_SITE = null;
  /* Plan pricing matrix + assessment questions come from the public_index_plans
     view and assessment_questions table (public-read, active rows only).
     PEL_PLANS (static) stays as a fallback for offline/first-paint. */
  window.PEL_PLANS_DB = null;
  window.PEL_QUESTIONS = null;
  function loadPlansAndQuestions(){
    var p = fetch(SB_URL + '/rest/v1/public_index_plans?order=sort_order,tier,duration_months', {
      headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY }
    }).then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; });
    var q = fetch(SB_URL + '/rest/v1/assessment_questions?select=*&order=sort_order&limit=30', {
      headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY }
    }).then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; });
    return Promise.all([p, q]).then(function(res){
      var rows = Array.isArray(res[0]) ? res[0] : null;
      var qs   = Array.isArray(res[1]) ? res[1] : null;
      window.PEL_PLANS_DB = rows;
      window.PEL_QUESTIONS = qs;
      try{ window.dispatchEvent(new CustomEvent('pel-db-plans')); }catch(e){}
    });
  }
  window.PEL_SETTINGS_LOAD = function(){
    return fetch(SB_URL + '/rest/v1/site_settings?select=key,value', {
      headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY }
    }).then(function(r){ return r.ok ? r.json() : null; }).then(function(rows){
      var site = buildSite(rows);
      /* Keep PEL_PLANS contact in sync so waLink() builders everywhere
         (pricing cards, app support buttons, onboarding) use the live number. */
      try{
        if(site.whatsapp && window.PEL_PLANS){
          PEL_PLANS.contact = site.whatsapp;
          if(PEL_PLANS.waBase !== undefined) PEL_PLANS.waBase = site.whatsapp;
        }
      }catch(e){}
      window.PEL_SITE = site;
      try{ window.dispatchEvent(new CustomEvent('pel-site-settings')); }catch(e){}
      /* fire-and-forget: plans + questions load in parallel after settings */
      loadPlansAndQuestions();
      return site;
    }).catch(function(){ return null; });
  };

  window.PEL_SETTINGS_LOAD();
})();
