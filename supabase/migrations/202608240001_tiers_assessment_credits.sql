-- ============================================================
-- PEL migration 202608240001 — Tiers, Assessment, Credits, Index config
-- ------------------------------------------------------------
-- Additive + safe. No DROP/RESTRUCTURE of existing tables.
-- Adds: profile tier/credit/assessment columns, assessment_questions
-- table + seed, plan_pricing matrix (tier x duration) + seed,
-- credit_ledger, public-read RLS for index pricing + questions,
-- and a FIX for the student_state RLS policy that blocked
-- new/expired students from saving progress.
-- Apply via Supabase Management API /database/query (one stmt per call)
-- or: psql -f against the project database.
-- ============================================================

-- ---------- 0. PROFILES: tier / credits / assessment ----------
alter table public.profiles
  add column if not exists subscription_tier   text        ,  -- 'start_from_zero' | 'exam_prep'
  add column if not exists plan_duration_months int         ,
  add column if not exists live_class_credits  int not null default 0,
  add column if not exists assessed_cefr_level text        ,  -- 'A1','A2','B1','B2','C1'
  add column if not exists assessed_track      text        ,  -- 'start_from_zero' | 'exam_prep'
  add column if not exists assessed_at         timestamptz ,
  add column if not exists plan_activated_at   timestamptz ;


-- ---------- 1. ASSESSMENT QUESTIONS POOL ----------
create table if not exists public.assessment_questions (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique,
  tier            text not null,           -- 'beginner' | 'exam_prep'  (maps to start_from_zero / exam_prep)
  level           text not null,           -- CEFR the item probes: 'A1'..'C1'
  difficulty_rating int not null default 3,-- 1 (easiest) .. 5 (hardest), drives adaptive routing
  skill_type      text not null,           -- 'grammar','vocab','reading','listening'
  question_en     text not null,
  question_ar     text not null,
  options         jsonb not null,          -- [{en,ar}] length 4
  correct_index   int not null,            -- 0..3
  explanation_en  text,
  explanation_ar  text,
  active          boolean not null default true,
  sort_order      int not null default 0,
  created_at      timestamptz not null default now()
);

alter table public.assessment_questions enable row level security;
-- Students read active questions to take the test; admins manage the pool.
drop policy if exists "aq_public_read" on public.assessment_questions;
create policy "aq_public_read" on public.assessment_questions
  for select to anon, authenticated
  using (active = true);
drop policy if exists "aq_admin_write" on public.assessment_questions;
create policy "aq_admin_write" on public.assessment_questions
  for all to authenticated
  using (has_permission('learning.manage'::text))
  with check (has_permission('learning.manage'::text));


-- ---------- 2. PLAN PRICING MATRIX (tier x duration) ----------
create table if not exists public.plan_pricing (
  id                  uuid primary key default gen_random_uuid(),
  tier                text not null,           -- 'start_from_zero' | 'exam_prep'
  duration_months     int not null,            -- 1, 2, 3
  price               int not null,            -- SAR
  weekly_live_classes int not null default 0,  -- included group classes / week
  featured            boolean not null default false,
  active              boolean not null default true,
  sort_order          int not null default 0,
  created_at          timestamptz not null default now(),
  unique (tier, duration_months)
);

alter table public.plan_pricing enable row level security;
-- Public reads only active, display-safe rows. No catalog leakage.
drop policy if exists "pp_public_read" on public.plan_pricing;
create policy "pp_public_read" on public.plan_pricing
  for select to anon, authenticated
  using (active = true);
drop policy if exists "pp_admin_write" on public.plan_pricing;
create policy "pp_admin_write" on public.plan_pricing
  for all to authenticated
  using (has_permission('subscriptions.manage'::text))
  with check (has_permission('subscriptions.manage'::text));


-- ---------- 3. LIVE-CLASS CREDIT LEDGER ----------
create table if not exists public.credit_ledger (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null,
  delta         int not null,             -- +credit / -debit
  balance_after int not null,
  reason        text,
  created_by    uuid,
  created_at    timestamptz not null default now()
);
create index if not exists credit_ledger_user_idx on public.credit_ledger (user_id, created_at desc);

alter table public.credit_ledger enable row level security;
drop policy if exists "cl_owner_read" on public.credit_ledger;
create policy "cl_owner_read" on public.credit_ledger
  for select to authenticated
  using (auth.uid() = user_id);
drop policy if exists "cl_admin_all" on public.credit_ledger;
create policy "cl_admin_all" on public.credit_ledger
  for all to authenticated
  using (has_permission('students.write'::text))
  with check (has_permission('students.write'::text));


-- ---------- 4. INDEX DISPLAY-SAFE PLANS VIEW ----------
create or replace view public.public_index_plans as
  select tier, duration_months, price, weekly_live_classes, featured, sort_order
  from public.plan_pricing
  where active = true
  order by sort_order, tier, duration_months;

-- (Views inherit base-table RLS; also expose explicitly for anon.)
drop policy if exists "public_index_plans_read" on public.public_index_plans;
-- Note: RLS on a view follows the underlying table; no separate policy needed.


-- ---------- 5. STUDENT_STATE RLS FIX (progress-save bug) ----------
-- Old policy gated read+write on can_access_pel(), which returns false for
-- students with no active subscription (new / expired / future-dated). That
-- silently blocked persisting progress. Owners must always access their own
-- state; subscription gating belongs at lesson delivery, not persistence.
drop policy if exists "student_state_own_all" on public.student_state;
drop policy if exists "student_state_owner_all" on public.student_state;
create policy "student_state_owner_all" on public.student_state
  for all to authenticated
  using (auth.uid() = user_id or has_permission('students.read'::text))
  with check (auth.uid() = user_id or has_permission('students.write'::text));


-- ---------- 6. RPC: student saves assessment result (bypasses RLS safely) ----------
create or replace function public.student_save_assessment(
  p_track text, p_level text
) returns void language plpgsql security definer set search_path = 'public' as $$
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  update public.profiles
     set assessed_track = p_track,
         assessed_cefr_level = p_level,
         subscription_tier = coalesce(subscription_tier, p_track),
         assessed_at = now(),
         updated_at = now()
   where user_id = auth.uid();
end;
$$;


-- ---------- 7. RPC: admin adjusts live-class credits (manual WA payment) ----------
create or replace function public.admin_adjust_credits(
  p_user_id uuid, p_delta int, p_reason text
) returns int language plpgsql security definer set search_path = 'public' as $$
declare
  v_new int;
begin
  if not has_permission('students.write'::text) then
    raise exception 'Insufficient permission: students.write';
  end if;
  update public.profiles
     set live_class_credits = greatest(0, live_class_credits + p_delta),
         updated_at = now()
   where user_id = p_user_id
   returning live_class_credits into v_new;
  insert into public.credit_ledger (user_id, delta, balance_after, reason, created_by)
  values (p_user_id, p_delta, v_new, p_reason, auth.uid());
  return v_new;
end;
$$;


-- ---------- 8. RPC: admin billing & credit snapshot for Student 360 ----------
create or replace function public.admin_student_billing(
  p_user_id uuid
) returns jsonb language plpgsql security definer set search_path = 'public' as $$
declare
  v_scope uuid[] := public._visible_student_ids();
  v_out   jsonb;
begin
  if not has_permission('students.read'::text) then
    raise exception 'Insufficient permission: students.read';
  end if;
  if v_scope is not null and not (p_user_id = any(v_scope)) then
    raise exception 'Student is outside your assigned scope.';
  end if;

  select jsonb_build_object(
    'tier', p.subscription_tier,
    'plan_duration_months', p.plan_duration_months,
    'live_class_credits', coalesce(p.live_class_credits, 0),
    'assessed_cefr_level', p.assessed_cefr_level,
    'assessed_track', p.assessed_track,
    'assessed_at', p.assessed_at,
    'plan_activated_at', p.plan_activated_at
  ) into v_out
  from public.profiles p where p.user_id = p_user_id;

  return jsonb_build_object(
    'billing', v_out,
    'ledger', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', l.id, 'delta', l.delta, 'balance_after', l.balance_after,
        'reason', l.reason, 'created_by', l.created_by, 'created_at', l.created_at
      ) order by l.created_at desc)
      from public.credit_ledger l where l.user_id = p_user_id
    ), '[]'::jsonb)
  );
end;
$$;


-- ---------- 9. INDEX CONTENT KEYS (admin-editable copy on /index) ----------
-- Reuses the existing site_settings (key/value jsonb) table which already
-- has a public read policy. Keys are read by pel-settings.js and applied on
-- index.html with built-in fallbacks.
insert into public.site_settings (key, value) values
  ('hero_headline_ar', to_jsonb('انجليزي يشبه حياتك، مو جمل تحفظها.'::text)),
  ('hero_headline_en', to_jsonb('English that sounds like your life, not a textbook.'::text)),
  ('hero_sub_ar', to_jsonb('قل لنا وش تبي الانجليزي لاجله، شغلك سفرك سوالفك اليومية، ونبني لك بداية على مقاسك بدروس من مواقف حقيقية وشرح واضح بالعربي'::text)),
  ('hero_sub_en', to_jsonb('Tell us what you need English for - work travel everyday talk. We build your starting point from real situations, with clear Arabic support.'::text)),
  ('pricing_note_ar', to_jsonb('الدفع عبر واتساب - التنشيط خلال دقايق. كل الباقات تشمل وصول كامل للمنصة.'::text)),
  ('pricing_note_en', to_jsonb('Pay via WhatsApp, activated in minutes. Every plan includes full platform access.'::text))
on conflict (key) do nothing;


-- ---------- 10. SEED: PLAN PRICING MATRIX ----------
insert into public.plan_pricing (tier, duration_months, price, weekly_live_classes, featured, active, sort_order) values
  ('start_from_zero', 1, 89,  0, false, true, 1),
  ('start_from_zero', 2, 139, 0, false, true, 2),
  ('start_from_zero', 3, 169, 0, true,  true, 3),
  ('exam_prep',      1, 89,  0, false, true, 4),
  ('exam_prep',      2, 139, 0, false, true, 5),
  ('exam_prep',      3, 169, 1, true,  true, 6)   -- 3-Month Exam Prep = 1 live class / week
on conflict (tier, duration_months) do update
  set price = excluded.price,
      weekly_live_classes = excluded.weekly_live_classes,
      featured = excluded.featured,
      active = excluded.active,
      sort_order = excluded.sort_order;


-- ---------- 11. SEED: 15 BASELINE ASSESSMENT QUESTIONS ----------
-- (Bilingual EN/AR, tagged by tier (beginner vs exam_prep), level, skill.)
-- Tables created via raw SQL need explicit role grants (Supabase does not
-- auto-grant on tables created outside its migration runner).
GRANT SELECT ON public.plan_pricing TO anon, authenticated;
GRANT SELECT ON public.assessment_questions TO anon, authenticated;
GRANT SELECT ON public.public_index_plans TO anon, authenticated;
GRANT SELECT ON public.credit_ledger TO authenticated;
GRANT EXECUTE ON FUNCTION public.student_save_assessment(text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_adjust_credits(uuid,int,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_student_billing(uuid) TO authenticated;
-- Bilingual (EN/AR), tagged by tier (beginner vs exam_prep), level, skill.
insert into public.assessment_questions (code, tier, level, skill_type, question_en, question_ar, options, correct_index, explanation_en, explanation_ar, sort_order) values
  ('q01','beginner','A1','grammar',
   'Choose the correct verb: She ___ to school every day.',
   'اختار الفعل الصحيح: هي ___ للمدرسة كل يوم.',
   '[{"en":"go","ar":"go"},{"en":"goes","ar":"goes"},{"en":"going","ar":"going"},{"en":"gone","ar":"gone"}]', 1,
   'Third person singular present takes -s: she goes.','المضارع مع الضمير المفرد الغائب ياخذ s: she goes.', 1),
  ('q02','beginner','A1','vocab',
   'Which word means a place where you buy bread?',
   'اي كلمة معناها مكان تشتري منه الخبز؟',
   '[{"en":"Bakery","ar":"مخبز"},{"en":"Library","ar":"مكتبة"},{"en":"Pharmacy","ar":"صيدلية"},{"en":"Garage","ar":"كراج"}]', 0,
   'A bakery sells bread.','المخبز يبيع الخبز.', 2),
  ('q03','beginner','A1','grammar',
   '___ you a student? Yes, I am.',
   '___ انت طالب؟ اى، انا طالب.',
   '[{"en":"Am","ar":"Am"},{"en":"Is","ar":"Is"},{"en":"Are","ar":"Are"},{"en":"Be","ar":"Be"}]', 2,
   'With "you" we use are.','مع you نستخدم are.', 3),
  ('q04','beginner','A2','vocab',
   'I usually ___ up at 6 am.',
   'عادة اصحى الساعة 6 الصبح.',
   '[{"en":"wake","ar":"اصحى"},{"en":"wakes","ar":"تصحى"},{"en":"waking","ar":"تصحى"},{"en":"woke","ar":"صحيت"}]', 0,
   'After "I" the base form: wake up.','بعد I نستخدم الفعل المجرد: wake up.', 4),
  ('q05','beginner','A2','grammar',
   'Yesterday we ___ to the beach.',
   'امس رحنا البحر.',
   '[{"en":"go","ar":"روح"},{"en":"goed","ar":"روح"},{"en":"went","ar":"رحنا"},{"en":"going","ar":"نروح"}]', 2,
   'Past of go is went.','الماضي من go هو went.', 5),
  ('q06','beginner','A2','reading',
   'Read: "The shop opens at 9." When does it open?',
   'اقرا: "المحل يفتح الساعة 9." متى يفتح؟',
   '[{"en":"9 am","ar":"9 الصبح"},{"en":"9 pm","ar":"9 بالليل"},{"en":"Now","ar":"الحين"},{"en":"Never","ar":"ابدا"}]', 0,
   '9 means 9 am in a shop context.','الساعة 9 الصبح في سياق محل.', 6),
  ('q07','beginner','A1','vocab',
   'What color is the sky on a clear day?',
   'وش لون السماء يوم صافي؟',
   '[{"en":"Red","ar":"احمر"},{"en":"Blue","ar":"ازرق"},{"en":"Green","ar":"اخضر"},{"en":"Black","ar":"اسود"}]', 1,
   'The sky is blue.','السماء ازرق.', 7),
  ('q08','beginner','A1','grammar',
   'This is ___ book. It is mine.',
   'هذا ___ كتاب. هو مالي.',
   '[{"en":"a","ar":"a"},{"en":"an","ar":"an"},{"en":"the","ar":"the"},{"en":"-","ar":"-" }]', 0,
   'Use a before a consonant sound.','نستخدم a قبل صوت ساكن.', 8),
  ('q09','exam_prep','B1','grammar',
   'Choose the correct sentence:',
   'اختار الجملة الصحيحة:',
   '[{"en":"I have been to London last year.","ar":"I have been to London last year."},{"en":"I went to London last year.","ar":"I went to London last year."},{"en":"I go to London last year.","ar":"I go to London last year."},{"en":"I going London last year.","ar":"I going London last year."}]', 1,
   'Last year = simple past: went.','last year = ماضي بسيط: went.', 9),
  ('q10','exam_prep','B1','vocab',
   'The opposite of "increase" is:',
   'عكس كلمة increase:',
   '[{"en":"Grow","ar":"يكبر"},{"en":"Decrease","ar":"ينقص"},{"en":"Expand","ar":"يتوسع"},{"en":"Add","ar":"يضيف"}]', 1,
   'Increase vs decrease.','increase عكسها decrease.', 10),
  ('q11','exam_prep','B2','grammar',
   'If I ___ more time, I would travel.',
   'لو كان عندي وقت اكثر، كنت سافرت.',
   '[{"en":"have","ar":"have"},{"en":"had","ar":"had"},{"en":"will have","ar":"will have"},{"en":"having","ar":"having"}]', 1,
   'Second conditional uses past in the if-clause.','الشرط الثاني يستخدم الماضي.', 11),
  ('q12','exam_prep','B2','vocab',
   'A person who cannot hear is:',
   'الشخص اللي ما يقدر يسمع هو:',
   '[{"en":"Blind","ar":"اعمى"},{"en":"Deaf","ar":"اصم"},{"en":"Mute","ar":"ابكم"},{"en":"Lame","ar":"اعرج"}]', 1,
   'Deaf = cannot hear.','deaf معناها ما يسمع.', 12),
  ('q13','exam_prep','B2','reading',
   'Read: "Despite the rain, they played." What happened?',
   'اقرا: "بالرغم من المطر، لعبوا." وش صار؟',
   '[{"en":"They stayed home","ar":"بقوا بالبيت"},{"en":"They played in the rain","ar":"لعبوا تحت المطر"},{"en":"They cancelled","ar":"الغوا"},{"en":"It did not rain","ar":"ما مطرت"}]', 1,
   'Despite = they still played.','بالرغم من = لعبوا بعد.', 13),
  ('q14','exam_prep','C1','grammar',
   'Choose the most natural: ___ the report, I noticed several errors.',
   'اختار الانسب: ___ التقرير، لاحظت عدة اخطاء.',
   '[{"en":"While reading","ar":"While reading"},{"en":"Read","ar":"Read"},{"en":"To reading","ar":"To reading"},{"en":"Reads","ar":"Reads"}]', 0,
   'Reduced clause: while reading.','عبارة مختصرة: while reading.', 14),
  ('q15','exam_prep','C1','vocab',
   'A "comprehensive" review is one that is:',
   'المراجعة "الشاملة" هي اللي تكون:',
   '[{"en":"Brief","ar":"مختصرة"},{"en":"Complete","ar":"كاملة"},{"en":"Partial","ar":"جزئية"},{"en":"Late","ar":"متاخرة"}]', 1,
   'Comprehensive = complete.','comprehensive معناها شاملة.', 15)
on conflict (code) do nothing;
