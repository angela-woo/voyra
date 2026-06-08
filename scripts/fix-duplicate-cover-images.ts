#!/usr/bin/env npx tsx
/**
 * 기존 아티클 커버 이미지 중복 수정
 * 실행: env $(cat .env.local | grep -v '^#' | xargs) npx tsx scripts/fix-duplicate-cover-images.ts
 */
import { createClient } from '@supabase/supabase-js'
import { getKeywordsFromSlug, fetchUniqueUnsplashImage } from '../src/lib/images/smartImageSearch'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  console.log('📋 아티클 이미지 중복 분석 중...\n')

  const { data: articles } = await supabase
    .from('articles')
    .select('slug, title, city, cover_image_url')
    .eq('published', true)
    .not('cover_image_url', 'is', null)
    .order('created_at', { ascending: false })

  if (!articles || articles.length === 0) {
    console.log('아티클 없음')
    return
  }

  // URL 빈도 분석
  const urlCount = new Map<string, string[]>()
  for (const a of articles) {
    if (!a.cover_image_url) continue
    const existing = urlCount.get(a.cover_image_url) ?? []
    existing.push(a.slug)
    urlCount.set(a.cover_image_url, existing)
  }

  const duplicates = Array.from(urlCount.entries()).filter(([, slugs]) => slugs.length > 1)
  console.log(`🔍 중복 이미지 그룹: ${duplicates.length}개`)

  if (duplicates.length === 0) {
    console.log('✅ 중복 없음!')
    return
  }

  // 전체 사용 중인 URL 추적
  const usedUrls = new Set<string>(
    articles.map(a => a.cover_image_url).filter(Boolean) as string[],
  )

  let fixed = 0, skipped = 0

  for (const [dupUrl, slugs] of duplicates) {
    console.log(`\n📌 중복 URL (${slugs.length}개 사용):`)
    console.log(`   ${dupUrl.slice(0, 80)}...`)

    // 첫 번째 슬러그는 유지, 나머지 교체
    for (let i = 1; i < slugs.length; i++) {
      const slug = slugs[i]
      const article = articles.find(a => a.slug === slug)
      if (!article) continue

      // slug에서 도시명 추출 (예: tokyo-shibuya-guide-ko → tokyo)
      const cityPart = slug.split('-')[0] ?? 'travel'
      const queries = getKeywordsFromSlug(slug, cityPart)

      const newUrl = await fetchUniqueUnsplashImage(queries, usedUrls)
      if (newUrl) {
        const { error } = await supabase
          .from('articles')
          .update({ cover_image_url: newUrl })
          .eq('slug', slug)

        if (error) {
          console.log(`   ❌ [${slug}] DB 업데이트 실패: ${error.message}`)
          skipped++
        } else {
          usedUrls.add(newUrl)
          fixed++
          console.log(`   ✅ [${fixed}] ${slug}`)
          console.log(`        → ${newUrl.slice(0, 70)}...`)
        }
      } else {
        console.log(`   ⚠️ [${slug}] 대체 이미지 없음`)
        skipped++
      }

      await sleep(1000)
    }
  }

  console.log(`\n✨ 완료! 교체: ${fixed}개 | 스킵: ${skipped}개`)
}

main().catch(console.error)
