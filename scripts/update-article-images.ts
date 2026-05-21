#!/usr/bin/env npx tsx
/**
 * articles 테이블의 cover_image_url / cover_image_attribution 백필
 * 도시별로 그룹화해서 API 호출 최소화 (50/hour rate limit 절약)
 *
 * 선행 조건 (Supabase SQL 에디터에서 실행):
 *   ALTER TABLE articles ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
 *   ALTER TABLE articles ADD COLUMN IF NOT EXISTS cover_image_attribution TEXT;
 *
 * 실행:
 *   env $(cat .env.local | grep -v '^#' | xargs) npx tsx scripts/update-article-images.ts
 * 강제 덮어쓰기:
 *   ... npx tsx scripts/update-article-images.ts --force
 */
import { createClient } from '@supabase/supabase-js'
import { fetchUnsplashPhotos, toEnglishCity } from '../src/lib/unsplash'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const force = process.argv.includes('--force')

async function main() {
  const filter = supabase
    .from('articles')
    .select('id, title, city, country, cover_image_url')
    .eq('published', true)

  const { data: articles, error } = force
    ? await filter
    : await filter.is('cover_image_url', null)

  if (error) {
    console.error('❌ 조회 실패:', error.message)
    console.error('   → Supabase SQL 에디터에서 아래 실행 후 다시 시도하세요:')
    console.error('   ALTER TABLE articles ADD COLUMN IF NOT EXISTS cover_image_url TEXT;')
    console.error('   ALTER TABLE articles ADD COLUMN IF NOT EXISTS cover_image_attribution TEXT;')
    process.exit(1)
  }

  if (!articles?.length) {
    console.log('✅ 백필할 아티클 없음 (이미 모두 이미지 있음)')
    return
  }

  console.log(`\n📋 처리 대상 ${articles.length}개 아티클\n`)

  // 도시별 그룹화 → API 호출 최소화
  const cityGroups: Record<string, typeof articles> = {}
  for (const a of articles) {
    const key = a.city ?? a.title ?? 'unknown'
    ;(cityGroups[key] ??= []).push(a)
  }

  const uniqueCities = Object.keys(cityGroups)
  console.log(`🗺  고유 도시 ${uniqueCities.length}개 → Unsplash API ${uniqueCities.length}회 호출\n`)

  let success = 0, failed = 0

  for (const city of uniqueCities) {
    const group = cityGroups[city]
    const englishCity = toEnglishCity(city)
    const query = `${englishCity} travel landscape`

    process.stdout.write(`  📸 ${city} (${group.length}개)... `)

    const photos = await fetchUnsplashPhotos(query, Math.max(group.length, 3))

    if (!photos.length) {
      console.log('❌ 사진 없음')
      failed += group.length
      continue
    }

    for (let i = 0; i < group.length; i++) {
      const photo = photos[i % photos.length]
      const { error: updateError } = await supabase
        .from('articles')
        .update({
          cover_image_url: photo.url,
          cover_image_attribution: `Photo by ${photo.authorName} on Unsplash`,
        })
        .eq('id', group[i].id)

      if (updateError) {
        failed++
      } else {
        success++
      }
    }

    console.log(`✅ ${group.length}개`)
    await new Promise(r => setTimeout(r, 500))
  }

  console.log(`\n✨ 완료! 성공 ${success}개 / 실패 ${failed}개`)
}

main().catch(console.error)
