#!/usr/bin/env npx tsx
/**
 * Backfill image_url for places that have none.
 * Prerequisite: run supabase/add-place-image-columns.sql first.
 *
 * Usage: env $(cat .env.local | grep -v '^#' | xargs) npx tsx scripts/update-place-images.ts
 */
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)
const UNSPLASH_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY!

const CITY_MAP: Record<string, string> = {
  교토: 'Kyoto', 오사카: 'Osaka', 도쿄: 'Tokyo', 발리: 'Bali', 싱가포르: 'Singapore',
  방콕: 'Bangkok', 치앙마이: 'Chiang Mai', 파리: 'Paris', 로마: 'Rome',
  런던: 'London', 바르셀로나: 'Barcelona', 암스테르담: 'Amsterdam', 프라하: 'Prague',
  비엔나: 'Vienna', 베를린: 'Berlin', 시드니: 'Sydney', 홍콩: 'Hong Kong',
  두바이: 'Dubai', 이스탄불: 'Istanbul', 괌: 'Guam', 사이판: 'Saipan',
}

const CATEGORY_KEYWORDS: Record<string, string> = {
  hotel: 'luxury hotel lobby',
  restaurant: 'restaurant food dining',
  attraction: 'tourist landmark attraction',
  cafe: 'cafe coffee interior',
}

function toEn(city: string | null): string {
  if (!city) return ''
  return CITY_MAP[city] ?? city
}

async function fetchPhoto(query: string): Promise<{ url: string; attribution: string } | null> {
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } },
    )
    if (!res.ok) return null
    const data = await res.json()
    const photo = data.results?.[0]
    if (!photo) return null
    return { url: photo.urls.regular, attribution: photo.user.name }
  } catch {
    return null
  }
}

async function main() {
  if (!UNSPLASH_KEY) { console.error('Missing NEXT_PUBLIC_UNSPLASH_ACCESS_KEY'); process.exit(1) }

  // Join with articles to get city
  const { data: places, error } = await supabase
    .from('places')
    .select('id, name, category, image_url, article_id, articles(city)')
    .is('image_url', null)

  if (error) { console.error('Fetch error:', error); process.exit(1) }
  if (!places || places.length === 0) { console.log('All places already have images.'); return }

  console.log(`Updating ${places.length} places...\n`)
  let fixed = 0

  for (const place of places) {
    const article = Array.isArray(place.articles) ? place.articles[0] : place.articles
    const city = (article as { city?: string | null } | null)?.city ?? null
    const cityEn = toEn(city)
    const catKw = CATEGORY_KEYWORDS[place.category?.toLowerCase() ?? ''] ?? 'travel destination'
    const query = [place.name, cityEn, catKw].filter(Boolean).join(' ')

    const photo = await fetchPhoto(query)
    if (!photo) {
      console.log(`  skip (no photo): ${place.name}`)
      await new Promise(r => setTimeout(r, 1000))
      continue
    }

    const { error: e } = await supabase
      .from('places')
      .update({ image_url: photo.url, image_attribution: photo.attribution })
      .eq('id', place.id)

    if (e) console.error(`  error ${place.name}:`, e)
    else { console.log(`  ok: ${place.name} (${cityEn})`); fixed++ }

    await new Promise(r => setTimeout(r, 1000))
  }

  console.log(`\nDone. ${fixed} / ${places.length} updated.`)
}

main()
