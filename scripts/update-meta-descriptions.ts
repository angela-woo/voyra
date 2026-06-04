#!/usr/bin/env npx tsx
/**
 * DB에서 meta_description이 없거나 50자 미만인 아티클을 찾아
 * generateMetaDescription 로직으로 업데이트
 * 실행: env $(cat .env.local | grep -v '^#' | xargs) npx tsx scripts/update-meta-descriptions.ts
 */
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

function stripMarkdown(content: string): string {
  return content
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\n+/g, ' ')
    .trim()
}

function extractFirstSentence(text: string): string {
  const sentences = text.split(/[.!?。]/)
  return sentences.find(s => s.trim().length > 20)?.trim() ?? ''
}

function pickIndex(seed: string, max: number): number {
  return seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % max
}

function generateMetaDescription(
  content: string,
  city: string,
  country: string,
  slug: string,
  locale: 'ko' | 'en',
): string {
  const plain = stripMarkdown(content)
  const first = extractFirstSentence(plain)

  if (locale === 'ko') {
    const templates = [
      `${city} 여행의 모든 것! ${first.slice(0, 40)}... ${city} 여행 가이드와 추천 코스를 확인하세요.`,
      `${city}(${country}) 완벽 여행 가이드. ${first.slice(0, 35)}... 맛집, 관광지, 교통 정보 총정리.`,
      `${city} 여행 준비 중이라면? ${first.slice(0, 35)}... 현지인이 추천하는 ${city} 핵심 정보.`,
    ]
    return templates[pickIndex(slug, templates.length)].slice(0, 160)
  } else {
    const templates = [
      `Complete ${city} travel guide! ${first.slice(0, 40)}... Tips on attractions, food & transportation.`,
      `Planning a trip to ${city}, ${country}? ${first.slice(0, 35)}... Essential travel tips and recommendations.`,
      `Discover the best of ${city}! ${first.slice(0, 40)}... Top attractions, restaurants & travel tips.`,
    ]
    return templates[pickIndex(slug, templates.length)].slice(0, 160)
  }
}

async function main() {
  console.log('Fetching articles with missing or short meta_description...')

  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, slug, title, city, country, content, meta_description, language')
    .eq('published', true)

  if (error || !articles) {
    console.error('Failed to fetch articles:', error)
    process.exit(1)
  }

  const needsUpdate = articles.filter(a =>
    !a.meta_description || a.meta_description.trim().length < 50,
  )

  console.log(`Found ${needsUpdate.length} articles needing meta_description updates (out of ${articles.length} total)`)

  let updated = 0
  let skipped = 0

  for (const article of needsUpdate) {
    if (!article.content || article.content.trim().length < 50) {
      console.log(`  SKIP [${article.slug}] — no content`)
      skipped++
      continue
    }

    const locale = (article.language === 'en' ? 'en' : 'ko') as 'ko' | 'en'
    const description = generateMetaDescription(
      article.content,
      article.city ?? '',
      article.country ?? '',
      article.slug ?? '',
      locale,
    )

    const { error: updateError } = await supabase
      .from('articles')
      .update({ meta_description: description })
      .eq('id', article.id)

    if (updateError) {
      console.error(`  ERROR [${article.slug}]:`, updateError.message)
    } else {
      console.log(`  OK [${article.slug}] → "${description.slice(0, 60)}..."`)
      updated++
    }

    await new Promise(r => setTimeout(r, 100))
  }

  console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}`)
}

main().catch(console.error)
