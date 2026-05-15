ALTER TABLE articles ADD COLUMN IF NOT EXISTS section_images jsonb DEFAULT '{}';
