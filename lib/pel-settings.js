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
  var SB_URL = (window.PEL_CONFIG && PEL_CONFIG.SUPABASE_URL) || '';
  var SB_KEY = (window.PEL_CONFIG && PEL_CONFIG.SUPABASE_ANON_KEY) || '';

  function buildSite(rows){
    var raw = {};
    (Array.isArray(rows) ? rows : []).forEach(function(row){
      if(row && row.key) raw[row.key] = row.value;
    });
    var banner = null;
    if(raw.banner){
      banner = (typeof raw.banner === 'object') ? raw.banner : null;
      if(!banner && typeof raw.banner === 'string'){
        try{ banner = JSON.parse(raw.banner); }catch(e){ banner = null; }
      }
    }
    /* Admin stores hero/pricing as separate _ar/_en keys; normalize into objects */
    function langPair(arKey, enKey){
      var ar = raw[arKey], en = raw[enKey];
      if(!ar && !en) return null;
      return { ar: ar || null, en: en || null };
    }
    return {
      banner: banner,
      plan6mAvailable: raw.plan_6m_available === true,
      maintenanceMode: raw.maintenance_mode === true,
      whatsapp: (typeof raw.whatsapp_contact === 'string' && raw.whatsapp_contact) || null,
      faqs: Array.isArray(raw.faqs) ? raw.faqs : (function(){
        if(typeof raw.faqs === 'string'){ try{ var p = JSON.parse(raw.faqs); if(Array.isArray(p)) return p; }catch(e){} }
        return null;
      })(),
      /* admin-editable index copy (falls back to built-in copy if absent) */
      heroHeadline: langPair('hero_headline_ar','hero_headline_en'),
      heroSub: langPair('hero_sub_ar','hero_sub_en'),
      pricingNote: langPair('pricing_note_ar','pricing_note_en')
    };
  }

  window.PEL_SITE = null;
  /* Plan pricing matrix + assessment questions come from the public_index_plans
     view and assessment_questions table (public-read, active rows only).
     PEL_PLANS (static) stays as a fallback for offline/first-paint. */
  window.PEL_PLANS_DB = null;
  window.PEL_QUESTIONS = null;
  function loadPlansAndQuestions(){
    if(!SB_URL || !SB_KEY) return Promise.resolve();
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
    if(!SB_URL || !SB_KEY) return Promise.resolve(null);
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
    }).catch(function(){
      window.PEL_SITE = null;
      try{ window.dispatchEvent(new CustomEvent('pel-site-settings')); }catch(e){}
      return null;
    });
  };

  window.PEL_SETTINGS_LOAD();
})();
