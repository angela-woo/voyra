#!/usr/bin/env npx tsx
/**
 * 기존 articles + places에 Unsplash 이미지 URL 백필
 * Usage: npx tsx scripts/fetch-unsplash-images.ts
 */
import { createClient } from '@supabase/supabase-js'
import { fetchUnsplashPhoto, categoryFallbackQuery } from '../src/lib/unsplash'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function backfillArticles() {
  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, city, country, cover_image_url')
    .eq('published', true)
    .is('cover_image_url', null)

  if (!articles?.length) {
    console.log('  아티클: 백필할 항목 없음')
    return
  }
  console.log(`  아티클 ${articles.length}개 처리 중...\n`)

  for (const article of articles) {
    const query = `${article.city ?? article.title} travel`
    process.stdout.write(`    📸 ${article.city ?? article.title}... `)
    const photo = await fetchUnsplashPhoto(query)
    if (!photo) {
      console.log('❌ 사진 없음')
    } else {
      const { error } = await supabase
        .from('articles')
        .update({
          cover_image_url: photo.url,
          cover_image_attribution: `Photo by ${photo.authorName} on Unsplash`,
        })
        .eq('id', article.id)
      console.log(error ? `❌ ${error.message}` : `✅`)
    }
    await new Promise(r => setTimeout(r, 300))
  }
}

async function backfillPlaces() {
  const { data: places } = await supabase
    .from('places')
    .select('id, name, category, image_url')
    .is('image_url', null)

  if (!places?.length) {
    console.log('  장소: 백필할 항목 없음')
    return
  }
  console.log(`\n  장소 ${places.length}개 처리 중...\n`)

  for (const place of places) {
    const query = place.name || categoryFallbackQuery(place.category)
    process.stdout.write(`    📸 ${place.name}... `)
    const photo = await fetchUnsplashPhoto(query)
    if (!photo) {
      console.log('❌ 사진 없음')
    } else {
      const { error } = await supabase
        .from('places')
        .update({
          image_url: photo.url,
          image_attribution: `Photo by ${photo.authorName} on Unsplash`,
        })
        .eq('id', place.id)
      console.log(error ? `❌ ${error.message}` : `✅`)
    }
    await new Promise(r => setTimeout(r, 300))
  }
}

async function main() {
  console.log('🚀 Unsplash 이미지 백필 시작\n')
  await backfillArticles()
  await backfillPlaces()
  console.log('\n✨ 완료!')
}

main().catch(console.error)
