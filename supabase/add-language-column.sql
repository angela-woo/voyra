ALTER TABLE articles ADD COLUMN IF NOT EXISTS language text DEFAULT 'ko';
ALTER TABLE travel_plans ADD COLUMN IF NOT EXISTS language text DEFAULT 'ko';

UPDATE articles SET language = 'ko' WHERE language IS NULL;
UPDATE travel_plans SET language = 'ko' WHERE language IS NULL;
