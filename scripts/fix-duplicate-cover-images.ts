#!/usr/bin/env npx tsx
/**
 * 기존 아티클 커버 이미지 중복 수정 + 이미지 없는 아티클 보충
 * 실행: env $(cat .env.local | grep -v '^#' | xargs) npx tsx scripts/fix-duplicate-cover-images.ts
 */
import { createClient } from '@supabase/supabase-js'
import { getKeywordsFromSlug, fetchUniqueUnsplashImage } from '../src/lib/images/smartImageSearch'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function fixDuplicates() {
  console.log('📋 아티클 이미지 분석 중...\n')

  const { data: articles } = await supabase
    .from('articles')
    .select('id, slug, title, city, city_en, cover_image_url, language')
    .eq('published', true)
    .order('created_at', { ascending: true }) // 오래된 것 유지, 새것 교체

  if (!articles || articles.length === 0) {
    console.log('아티클 없음')
    return
  }

  // 전체 사용 중인 URL 추적 (이미지 없는 아티클 제외)
  const usedUrls = new Set<string>(
    articles.map(a => a.cover_image_url).filter(Boolean) as string[],
  )

  // ─── 1. URL 중복 감지 ───────────────────────────────────────
  const urlMap = new Map<string, string[]>()
  for (const a of articles) {
    if (!a.cover_image_url) continue
    const slugs = urlMap.get(a.cover_image_url) ?? []
    slugs.push(a.slug)
    urlMap.set(a.cover_image_url, slugs)
  }

  const duplicates = Array.from(urlMap.entries()).filter(([, slugs]) => slugs.length > 1)
  console.log(`🔍 중복 이미지 그룹: ${duplicates.length}개`)

  let fixed = 0

  for (const [url, slugs] of duplicates) {
    console.log(`\n📌 중복 URL (${slugs.length}개 사용):`)
    console.log(`   ${url.slice(0, 80)}...`)

    // 첫 번째 제외하고 모두 교체
    for (let i = 1; i < slugs.length; i++) {
      const article = articles.find(a => a.slug === slugs[i])
      if (!article) continue

      const cityEn = (article.city_en as string | null) || (article.city as string) || 'travel'
      const queries = getKeywordsFromSlug(article.slug, cityEn.toLowerCase().replace(/\s+/g, '-'))

      console.log(`  교체 중: ${article.slug}`)
      console.log(`  키워드: ${queries[0]}`)

      const newUrl = await fetchUniqueUnsplashImage(queries, usedUrls)
      if (newUrl) {
        const { error } = await supabase
          .from('articles')
          .update({ cover_image_url: newUrl })
          .eq('slug', article.slug)

        if (error) {
          console.log(`  ❌ DB 업데이트 실패: ${error.message}`)
        } else {
          usedUrls.add(newUrl)
          fixed++
          console.log(`  ✅ 교체 완료 → ${newUrl.slice(0, 70)}...`)
        }
      } else {
        console.log(`  ⚠️ 대체 이미지 없음`)
      }

      await new Promise(r => setTimeout(r, 1500))
    }
  }

  // ─── 2. 이미지 없는 아티클 보충 ────────────────────────────
  const noImageArticles = articles.filter(a => !a.cover_image_url)
  console.log(`\n🖼️  이미지 없는 아티클: ${noImageArticles.length}개`)

  for (const article of noImageArticles) {
    const cityEn = (article.city_en as string | null) || (article.city as string) || 'travel'
    const queries = getKeywordsFromSlug(article.slug, cityEn.toLowerCase().replace(/\s+/g, '-'))
    const newUrl = await fetchUniqueUnsplashImage(queries, usedUrls)

    if (newUrl) {
      const { error } = await supabase
        .from('articles')
        .update({ cover_image_url: newUrl })
        .eq('slug', article.slug)

      if (!error) {
        usedUrls.add(newUrl)
        fixed++
        console.log(`  ✅ ${article.slug} 이미지 추가`)
      }
    } else {
      console.log(`  ⚠️ ${article.slug} 이미지 없음`)
    }

    await new Promise(r => setTimeout(r, 1500))
  }

  console.log(`\n🎉 완료! 총 ${fixed}개 이미지 수정/추가됨`)
}

fixDuplicates().catch(console.error)
