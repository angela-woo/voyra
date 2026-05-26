#!/usr/bin/env npx tsx
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const SLUG_STOP_WORDS = new Set([
  'travel', 'guide', 'tips', 'ultimate', 'best', 'things', 'what', 'how',
  'for', 'korean', 'travelers', 'to', 'in', 'the', 'a', 'an', 'top',
  'complete', 'perfect', 'must', 'see', 'do', 'visit',
])

function slugToSearchQuery(slug: string): string {
  const words = slug.split('-')
  const locationWords: string[] = []
  for (const word of words) {
    if (SLUG_STOP_WORDS.has(word)) break
    locationWords.push(word)
  }
  if (locationWords.length === 0) return slug.split('-').slice(0, 2).join(' ') + ' travel'
  return locationWords.join(' ') + ' travel'
}

let rateLimitHit = false

async function fetchUnsplashPhoto(query: string): Promise<{ url: string; attribution: string } | null> {
  const key = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY
  if (!key) { console.error('UNSPLASH_ACCESS_KEY missing'); return null }
  if (rateLimitHit) return null
  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
    { headers: { Authorization: `Client-ID ${key}` } },
  )
  if (!res.ok) {
    const remaining = res.headers.get('X-Ratelimit-Remaining')
    if (res.status === 403 || res.status === 429) {
      rateLimitHit = true
      process.stdout.write(`\n⚠️  Rate limit hit (HTTP ${res.status}, remaining=${remaining}). Re-run after 1 hour.\n`)
    }
    return null
  }
  const data = await res.json()
  const photo = data.results?.[0]
  if (!photo) return null
  return {
    url: photo.urls.regular,
    attribution: `Photo by ${photo.user.name} on Unsplash`,
  }
}

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

function cityToSearchQuery(city: string, slug: string): string {
  if (!city) return slugToSearchQuery(slug)
  // Normalize Korean city names to English for Unsplash
  const koToEn: Record<string, string> = {
    '사이판': 'saipan island beach',
    '도쿄': 'tokyo japan',
    '오사카': 'osaka japan',
    '교토': 'kyoto japan temple',
    '파리': 'paris france',
    '발리': 'bali indonesia',
    '방콕': 'bangkok thailand',
    '싱가포르': 'singapore city',
    '런던': 'london uk',
    '바르셀로나': 'barcelona spain',
    '로마': 'rome italy',
    '암스테르담': 'amsterdam netherlands',
    '뉴욕': 'new york city',
    '서울': 'seoul south korea',
    '부산': 'busan south korea',
    '제주도': 'jeju island korea',
    '경주': 'gyeongju korea',
    '인천': 'incheon korea',
    '전주': 'jeonju korea',
    '속초': 'sokcho seoraksan korea',
    '나미섬': 'nami island korea',
  }
  if (koToEn[city]) return koToEn[city]
  return `${city} travel`
}

async function main() {
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, slug, city, cover_image_url')
    .eq('published', true)
    .is('cover_image_url', null)
    .order('created_at', { ascending: false })

  if (error || !articles) { console.error('fetch error:', error); return }
  console.log(`Found ${articles.length} articles with missing cover images\n`)

  let updated = 0, skipped = 0, failed = 0

  for (const article of articles) {
    const query = cityToSearchQuery(article.city, article.slug)
    process.stdout.write(`[${article.city || article.slug}]\n  query: "${query}" ... `)

    const photo = await fetchUnsplashPhoto(query)
    if (!photo) {
      if (rateLimitHit) break
      console.log('✗ no result')
      failed++
      continue
    }

    {
      const { error: updateErr } = await supabase
        .from('articles')
        .update({ cover_image_url: photo.url, cover_image_attribution: photo.attribution })
        .eq('id', article.id)
      if (updateErr) {
        console.log(`✗ update failed: ${updateErr.message}`)
        failed++
      } else {
        console.log('✓ updated')
        updated++
      }
    }

    await sleep(500)
  }

  console.log(`\nDone. updated=${updated}, failed=${failed}`)
}

main().catch(console.error)
