-- Fix malformed exercise payloads: options stored as JSON strings instead of objects
-- and question stored as JSON string instead of object.
-- This affects 70 choose exercises where the options array contains string-encoded
-- JSON objects like "{\"t\": "...", "ok": true, "tr": "..."}" instead of actual objects.
-- The renderer expects objects with .t, .ok, .tr properties.
--
-- Key insight: jsonb->>i returns the TEXT content of a string element (without quotes),
-- then we cast that text to jsonb to get the actual object.

DO $$
DECLARE
  r RECORD;
  new_payload JSONB;
  new_options JSONB;
  opt_text TEXT;
  opt_jsonb JSONB;
  new_question JSONB;
  question_text TEXT;
  i INT;
  changed BOOLEAN;
BEGIN
  FOR r IN SELECT id, payload FROM lesson_exercises WHERE type = 'choose' ORDER BY id LOOP
    new_payload := r.payload;
    changed := FALSE;
    
    -- Fix options: if any element is a string, parse it as JSON
    IF new_payload ? 'options' AND jsonb_typeof(new_payload->'options') = 'array' THEN
      new_options := '[]'::jsonb;
      i := 0;
      WHILE i < jsonb_array_length(new_payload->'options') LOOP
        IF jsonb_typeof(new_payload->'options'->i) = 'string' THEN
          -- Get the text content (without outer quotes) using ->>
          opt_text := new_payload->'options'->>i;
          BEGIN
            opt_jsonb := opt_text::jsonb;
            new_options := new_options || jsonb_build_array(opt_jsonb);
            changed := TRUE;
          EXCEPTION WHEN OTHERS THEN
            -- Can't parse, keep original
            new_options := new_options || jsonb_build_array(new_payload->'options'->i);
          END;
        ELSE
          new_options := new_options || jsonb_build_array(new_payload->'options'->i);
        END IF;
        i := i + 1;
      END LOOP;
      new_payload := jsonb_set(new_payload, '{options}', new_options);
    END IF;
    
    -- Fix question: if it's a string, parse it as JSON
    IF new_payload ? 'question' AND jsonb_typeof(new_payload->'question') = 'string' THEN
      question_text := new_payload->>'question';
      BEGIN
        new_question := question_text::jsonb;
        new_payload := jsonb_set(new_payload, '{question}', new_question);
        changed := TRUE;
      EXCEPTION WHEN OTHERS THEN
        NULL;
      END;
    END IF;
    
    -- Only update if something changed
    IF changed THEN
      UPDATE lesson_exercises SET payload = new_payload WHERE id = r.id;
    END IF;
  END LOOP;
END $$;
