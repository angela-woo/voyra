-- Run this in Supabase Dashboard → SQL Editor
ALTER TABLE places ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE places ADD COLUMN IF NOT EXISTS image_attribution TEXT;
