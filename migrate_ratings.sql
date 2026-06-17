-- ==========================================
-- Migrate Ratings to New System
-- Run this in the Supabase SQL Editor
-- ==========================================

-- Begin Transaction
BEGIN;

-- Update 'decent' to 'timepass'
UPDATE reviews
SET rating = 'timepass'
WHERE rating = 'decent';

-- Update 'fire' to 'go_for_it'
UPDATE reviews
SET rating = 'go_for_it'
WHERE rating = 'fire';

-- Update 'banger' to 'perfection'
UPDATE reviews
SET rating = 'perfection'
WHERE rating = 'banger';

-- Note: 'skip' remains 'skip'

COMMIT;
