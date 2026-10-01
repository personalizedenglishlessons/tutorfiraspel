-- Fix malformed exercise payloads: options stored as JSON strings instead of objects
-- and question stored as JSON string instead of object.
-- This affects 70 choose exercises where the options array contains string-encoded
-- JSON objects like "{\"t\": "...", "ok": true, "tr": "..."}" instead of actual objects.
-- The renderer expects objects with .t, .ok, .tr properties.

DO $$
DECLARE
  r RECORD;
  new_payload JSONB;
  new_options JSONB;
  opt JSONB;
  new_question JSONB;
  i INT;
BEGIN
  FOR r IN SELECT id, payload FROM lesson_exercises WHERE type = 'choose' ORDER BY id LOOP
    new_payload := r.payload;
    
    -- Fix options: if any element is a string, try to parse it as JSON
    IF new_payload ? 'options' AND jsonb_typeof(new_payload->'options') = 'array' THEN
      new_options := '[]'::jsonb;
      i := 0;
      WHILE i < jsonb_array_length(new_payload->'options') LOOP
        opt := new_payload->'options'->i;
        IF jsonb_typeof(opt) = 'string' THEN
          -- Try to parse the string as JSON
          BEGIN
            new_options := new_options || jsonb_build_array(opt::text::jsonb);
          EXCEPTION WHEN OTHERS THEN
            -- If it can't be parsed, keep the string as-is
            new_options := new_options || jsonb_build_array(opt);
          END;
        ELSE
          new_options := new_options || jsonb_build_array(opt);
        END IF;
        i := i + 1;
      END LOOP;
      new_payload := jsonb_set(new_payload, '{options}', new_options);
    END IF;
    
    -- Fix question: if it's a string, try to parse it as JSON
    IF new_payload ? 'question' AND jsonb_typeof(new_payload->'question') = 'string' THEN
      BEGIN
        new_question := (new_payload->'question')::text::jsonb;
        new_payload := jsonb_set(new_payload, '{question}', new_question);
      EXCEPTION WHEN OTHERS THEN
        -- If it can't be parsed, leave it as-is
        NULL;
      END;
    END IF;
    
    -- Only update if something changed
    IF new_payload != r.payload THEN
      UPDATE lesson_exercises SET payload = new_payload WHERE id = r.id;
    END IF;
  END LOOP;
END $$;
