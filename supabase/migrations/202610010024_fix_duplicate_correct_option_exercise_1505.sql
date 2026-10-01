-- Fix exercise 1505 (lesson=c1-pack2-01): two options marked as correct.
-- "make a decision" (ok=true) and "take a decision" (ok=true) both marked correct.
-- The renderer only accepts the first correct option (findIndex), so clicking
-- "take a decision" would be marked wrong. Fix: set "take a decision" to ok=false
-- since "make a decision" is the standard American English collocation.

UPDATE lesson_exercises 
SET payload = jsonb_set(
  payload,
  '{options,2,ok}',
  'false'::jsonb
)
WHERE id = 1505 AND type = 'choose';
