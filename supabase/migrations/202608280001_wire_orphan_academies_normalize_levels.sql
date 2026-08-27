-- ============================================================
-- PEL Migration 202608280001
-- Wire 30 orphan academies into their CEFR track + normalize lesson.level to CEFR codes
-- Arabic/Abha dialect; no hamza; no em/en dashes.
-- Reversible: see DOWN section at bottom.
-- ============================================================

-- 1) WIRE ORPHAN ACADEMIES INTO TRACKS BY THEIR ACADEMY LEVEL
--    Each orphan academy (active, not yet in any track_academies) is added to the
--    track whose level matches the academy's own level.
--    english-foundations (A1, 45 foundational lessons) is placed FIRST in the A1 track;
--    all other orphans are appended after existing academies in their track.

INSERT INTO track_academies (track_id, academy_id, sort_order)
SELECT t.id, a.id,
  CASE
    WHEN a.id = 'english-foundations'
      THEN coalesce((SELECT min(ta.sort_order) FROM track_academies ta WHERE ta.track_id = t.id), 1) - 1
    ELSE coalesce((SELECT max(ta.sort_order) FROM track_academies ta WHERE ta.track_id = t.id), 0)
         + row_number() OVER (PARTITION BY a.level ORDER BY a.sort_order)
  END
FROM academies a
JOIN tracks t ON t.level = a.level AND t.active
WHERE a.active
  AND a.id NOT IN (SELECT academy_id FROM track_academies)
ORDER BY a.level, a.sort_order;

-- 2) NORMALIZE lesson.level FROM COARSE LABELS TO CEFR CODES
--    lesson.level is display metadata only (routing uses academy.level + track_academies).
--    Beginner -> A1, Intermediate -> B1, Advanced -> C1, All Levels -> B2
UPDATE lessons SET level = 'A1'  WHERE level = 'Beginner';
UPDATE lessons SET level = 'B1'  WHERE level = 'Intermediate';
UPDATE lessons SET level = 'C1'  WHERE level = 'Advanced';
UPDATE lessons SET level = 'B2'  WHERE level = 'All Levels';

-- ============================================================
-- DOWN (manual rollback if needed):
-- DELETE FROM track_academies WHERE academy_id IN (
--   'english-foundations','everyday-english','vocabulary-vault','grammar-academy',
--   'airport-english','restaurant-english','coffee-shop-english','hotel-english',
--   'shopping-english','driving-english','american-conversations','speaking-studio',
--   'american-accent-lab','listening-lounge','reading-corner','travel-english',
--   'hospital-english','emergency-english','music-english','writing-workshop',
--   'business-english','workplace-communication','job-interview-academy',
--   'american-slang','idioms-library','phrasal-verbs-lab','movie-english',
--   'tv-series-english','english-mastery','fluency-journey');
-- (lesson.level normalization is not reversed; coarse labels are deprecated.)
-- ============================================================
