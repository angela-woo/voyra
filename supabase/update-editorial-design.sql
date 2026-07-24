-- Kiravoy Editorial Redesign — MUJI/Kinfolk-inspired premium travel magazine tone.
-- Run this in Supabase SQL editor to push the new design tokens to the live site.
INSERT INTO site_settings (key, value) VALUES
  ('primary_color', '#FF5722'),
  ('background_color', '#FAF9F7'),
  ('border_radius', '2'),
  ('font_heading', 'Noto Sans KR'),
  ('font_body', 'Noto Sans KR'),
  ('site_name', 'Kiravoy'),
  ('site_description', 'Discover the world with Kiravoy')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
