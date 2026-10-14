-- Remove the oath "والله" from live lesson content.
-- Owner requirement: the app must never display والله anywhere.
-- Source (app.html, lib/pel-personalization.js) was fixed in the same
-- change; these rows were seeded earlier and still carry the old word.
-- Each update is guarded by the exact previous value so it is idempotent.

update lesson_items set ar_meaning = 'وانا بعد، عرقت وانا بس امشي.'
  where id = 663  and ar_meaning = 'والله العظم. انا تعرقت وانا ماشي.';

update lesson_items set ar_meaning = 'حلو. بتطلع بسيارتك؟'
  where id = 684  and ar_meaning = 'حلو والله. بتطلع بسيارتك؟';

update lesson_items set ar_meaning = 'هلا، من زمان! وش اخبارك؟'
  where id = 712  and ar_meaning = 'هلا والله، من زمان! وش اخبارك؟';

update lesson_items set ar_meaning = 'اكيد. نطلع هالويكند؟'
  where id = 1252 and ar_meaning = 'والله. نطلع هالويكند؟';

update lesson_items set ar_meaning = 'اي، اكيد.'
  where id = 1328 and ar_meaning = 'اي والله.';

update lesson_exercises
  set payload = jsonb_set(payload, '{prompt,ar}', to_jsonb('اكيد. نطلع هالويكند؟'::text))
  where id = 569 and payload->'prompt'->>'ar' = 'والله. نطلع هالويكند؟';

-- Safety net: fail loudly if any oath remains in the two content tables.
do $$
declare n int;
begin
  select count(*) into n from lesson_items    where ar_meaning ~ 'والله([^ء-ي]|$)';
  if n > 0 then raise exception 'remaining والله in lesson_items: %', n; end if;
  select count(*) into n from lesson_exercises where payload::text ~ 'والله([^ء-ي]|$)';
  if n > 0 then raise exception 'remaining والله in lesson_exercises: %', n; end if;
end $$;
