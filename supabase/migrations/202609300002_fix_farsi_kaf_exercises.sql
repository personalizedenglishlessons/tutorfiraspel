-- Fix Farsi kaf (U+06A9) → Arabic kaf (U+0643) in exercise prompt.tr fields
-- Found in exercises 2341 and 2391 (a0hw-15, a0hw-19)
UPDATE lesson_exercises 
SET payload = jsonb_set(payload, '{prompt,tr}', to_jsonb(replace(payload#>>'{prompt,tr}', 'ک', 'ك')))
WHERE id IN (2341, 2391) AND payload#>>'{prompt,tr}' LIKE '%ک%';
