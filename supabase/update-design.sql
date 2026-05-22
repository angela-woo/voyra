-- Kiravoy Design System Update (Klook Style)
INSERT INTO site_settings (key, value) VALUES
  ('primary_color', '#FF5722'),
  ('background_color', '#FFFFFF'),
  ('border_radius', '12'),
  ('font_heading', 'Noto Sans KR'),
  ('font_body', 'Noto Sans KR'),
  ('site_name', 'Kiravoy'),
  ('site_description', 'Discover the world with Kiravoy')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
