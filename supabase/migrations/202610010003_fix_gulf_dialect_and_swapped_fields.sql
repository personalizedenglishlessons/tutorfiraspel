-- Migration: 202610010003_fix_gulf_dialect_and_swapped_fields.sql
-- Fixes: Gulf "ماي"(water)→Saudi "مويه", doubled alif in choose question,
-- wrong word, swapped EN/AR fields in exercise #363

-- 1. Fix "ماي" (Gulf for water) → "مويه" (Saudi) in lesson_items
-- ONLY where ماي means water, NOT where it's transliteration of my/mine/may
UPDATE lesson_items SET ar_meaning = 'مويه' WHERE id = 1593 AND ar_meaning = 'ماي';
UPDATE lesson_items SET ar_meaning = 'مويه' WHERE id = 1759 AND ar_meaning = 'ماي';
UPDATE lesson_items SET ar_meaning = 'مويه' WHERE id = 2119 AND ar_meaning = 'ماي';
UPDATE lesson_items SET ar_meaning = 'مويه' WHERE id = 2136 AND ar_meaning = 'ماي';
UPDATE lesson_items SET ar_meaning = 'مويه' WHERE id = 2889 AND ar_meaning = 'ماي';
UPDATE lesson_items SET ar_meaning = 'اشرب مويه.' WHERE id = 1800 AND ar_meaning = 'اشرب ماي.';
UPDATE lesson_items SET ar_meaning = 'مع مويه؟' WHERE id = 1764 AND ar_meaning = 'مع ماي؟';
UPDATE lesson_items SET ar_meaning = 'ابغى شويه مويه.' WHERE id = 1683 AND ar_meaning = 'ابغى شويه ماي.';
UPDATE lesson_items SET ar_meaning = 'ابغى شوي مويه.' WHERE id = 2121 AND ar_meaning = 'ابغى شوي ماي.';
UPDATE lesson_items SET ar_meaning = 'ابغى شوي مويه.' WHERE id = 2146 AND ar_meaning = 'ابغى شوي ماي.';
UPDATE lesson_items SET ar_meaning = 'قهوه ومويهين.' WHERE id = 1597 AND ar_meaning = 'قهوه ومايين.';
UPDATE lesson_items SET ar_meaning = 'تحب مويه؟' WHERE id = 2771 AND ar_meaning = 'تحب ماي؟';
UPDATE lesson_items SET ar_meaning = 'اشرب مويه.' WHERE id = 2891 AND ar_meaning = 'اشرب ماي.';
UPDATE lesson_items SET ar_meaning = 'عطهم مويه.' WHERE id = 3779 AND ar_meaning = 'عطهم ماي.';
UPDATE lesson_items SET ar_meaning = 'ابغى مويه.' WHERE id = 3920 AND ar_meaning = 'ابغى ماي.';
-- id=3916: long text with "ابغى ماي" → "ابغى مويه"
UPDATE lesson_items SET ar_meaning = replace(ar_meaning, 'ابغى ماي', 'ابغى مويه') WHERE id = 3916 AND ar_meaning LIKE '%ابغى ماي%';
-- id=3779: example_ar too
UPDATE lesson_items SET example_ar = replace(example_ar, 'ماي', 'مويه') WHERE id = 3779 AND example_ar LIKE '%ماي%';

-- 2. Fix "ماي" in exercise source (ar->en direction)
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{source}', to_jsonb(replace(payload->>'source', 'ماي', 'مويه'))) WHERE id = 2262 AND payload->>'source' LIKE '%ماي%';

-- 3. Fix doubled alif in choose question (ex#327)
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{question,ar}', to_jsonb(replace(payload#>>'{question,ar}', 'ساال', 'سوال'))) WHERE id = 327;

-- 4. Fix wrong word "للعشاو" → "للعشا" (ex#347)
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{question,ar}', to_jsonb(replace(payload#>>'{question,ar}', 'للعشاو', 'للعشا'))) WHERE id = 347;
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{question,tr}', to_jsonb(replace(payload#>>'{question,tr}', 'للعشاو', 'للعشا'))) WHERE id = 347;

-- 5. Fix swapped EN/AR in ex#363
-- Current: en="وش تقول؟" (Arabic), ar="احد فهمك غلط" (Arabic)
-- Should be: en="Someone misunderstood you." ar="احد فهمك غلط. وش تقول؟"
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{question,en}', to_jsonb('Someone misunderstood you.'::text)) WHERE id = 363;
UPDATE lesson_exercises SET payload = jsonb_set(payload, '{question,ar}', to_jsonb('احد فهمك غلط. وش تقول؟'::text)) WHERE id = 363;
