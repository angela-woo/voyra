-- Entity-Based Image System Schema
-- Supabase SQL Editor에서 실행

-- 엔티티 마스터 테이블
CREATE TABLE IF NOT EXISTS destination_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_ko TEXT,
  type TEXT NOT NULL,
  city TEXT,
  city_ko TEXT,
  country TEXT,
  country_ko TEXT,
  importance INTEGER DEFAULT 50,
  google_place_id TEXT,
  lat NUMERIC,
  lng NUMERIC,
  search_queries TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, city)
);

-- 엔티티별 이미지 캐시
CREATE TABLE IF NOT EXISTS entity_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES destination_entities(id) ON DELETE CASCADE,
  entity_name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  thumb_url TEXT,
  source TEXT NOT NULL,
  source_id TEXT,
  width INTEGER,
  height INTEGER,
  quality_score NUMERIC DEFAULT 0,
  alt_text TEXT,
  photographer TEXT,
  photographer_url TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_name, image_url)
);

-- 아티클-엔티티 매핑
CREATE TABLE IF NOT EXISTS article_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_slug TEXT NOT NULL,
  entity_id UUID REFERENCES destination_entities(id),
  entity_name TEXT NOT NULL,
  importance INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_slug, entity_name)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_destination_entities_city ON destination_entities(city);
CREATE INDEX IF NOT EXISTS idx_destination_entities_name ON destination_entities(name);
CREATE INDEX IF NOT EXISTS idx_entity_images_entity_name ON entity_images(entity_name);
CREATE INDEX IF NOT EXISTS idx_entity_images_quality ON entity_images(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_article_entities_slug ON article_entities(article_slug);

-- RLS
ALTER TABLE destination_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_entities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read destination_entities" ON destination_entities FOR SELECT USING (true);
CREATE POLICY "public read entity_images" ON entity_images FOR SELECT USING (true);
CREATE POLICY "public read article_entities" ON article_entities FOR SELECT USING (true);

-- Service role write policies (for scripts)
CREATE POLICY "service write destination_entities" ON destination_entities
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service write entity_images" ON entity_images
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service write article_entities" ON article_entities
  FOR ALL USING (auth.role() = 'service_role');
