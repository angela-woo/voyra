#!/usr/bin/env npx tsx
/**
 * Backfill image_url for places that have none.
 * Groups places by city+category and fetches a batch per group,
 * minimizing Unsplash API calls (free tier: 50 req/hour).
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
  교토: 'Kyoto', 오사카: 'Osaka', 도쿄: 'Tokyo', 서울: 'Seoul', 나라: 'Nara',
  나고야: 'Nagoya', 후쿠오카: 'Fukuoka', 삿포로: 'Sapporo', 오키나와: 'Okinawa',
  발리: 'Bali', 싱가포르: 'Singapore', 방콕: 'Bangkok', 하노이: 'Hanoi',
  치앙마이: 'Chiang Mai', 푸켓: 'Phuket', 다낭: 'Da Nang', 호치민: 'Ho Chi Minh City',
  나트랑: 'Nha Trang', 마닐라: 'Manila', 세부: 'Cebu', 보라카이: 'Boracay',
  홍콩: 'Hong Kong', 상하이: 'Shanghai', 베이징: 'Beijing', 타이베이: 'Taipei', 타이중: 'Taichung',
  두바이: 'Dubai', 이스탄불: 'Istanbul',
  런던: 'London', 파리: 'Paris', 로마: 'Rome', 암스테르담: 'Amsterdam',
  프라하: 'Prague', 비엔나: 'Vienna', 베를린: 'Berlin', 바르셀로나: 'Barcelona',
  마드리드: 'Madrid', 리스본: 'Lisbon', 부다페스트: 'Budapest',
  뮌헨: 'Munich', 밀라노: 'Milan', 피렌체: 'Florence', 베네치아: 'Venice',
  아테네: 'Athens', 스톡홀름: 'Stockholm', 오슬로: 'Oslo',
  브뤼셀: 'Brussels', 바르샤바: 'Warsaw',
  시드니: 'Sydney', 멜버른: 'Melbourne',
  뉴욕: 'New York', 로스앤젤레스: 'Los Angeles', 라스베이거스: 'Las Vegas',
  밴쿠버: 'Vancouver', 토론토: 'Toronto',
  쿠알라룸푸르: 'Kuala Lumpur', 뭄바이: 'Mumbai', 델리: 'New Delhi',
  괌: 'Guam', 사이판: 'Saipan',
}

const CATEGORY_QUERIES: Record<string, string> = {
  hotel: 'luxury hotel interior',
  restaurant: 'restaurant dining food',
  attraction: 'tourist landmark sightseeing',
  cafe: 'cafe coffee shop',
}

function toEn(city: string): string {
  return CITY_MAP[city] ?? city
}

async function fetchBatchPhotos(query: string, count: number): Promise<string[]> {
  const per = Math.min(count + 3, 30)
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${per}&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } },
    )
    if (!res.ok) {
      console.log(`  ⚠️  Unsplash ${res.status} for "${query}"`)
      return []
    }
    const data = await res.json()
    return (data.results ?? []).map((p: { urls: { regular: string } }) => p.urls.regular)
  } catch {
    return []
  }
}

interface PlaceRow {
  id: string
  name: string
  category: string | null
  image_url: string | null
  articles: { city: string | null } | { city: string | null }[] | null
}

async function main() {
  if (!UNSPLASH_KEY) { console.error('Missing NEXT_PUBLIC_UNSPLASH_ACCESS_KEY'); process.exit(1) }

  const { data: places, error } = await supabase
    .from('places')
    .select('id, name, category, image_url, article_id, articles(city)')
    .is('image_url', null)

  if (error) { console.error('Fetch error:', error); process.exit(1) }
  if (!places || places.length === 0) { console.log('All places already have images.'); return }

  // Group by city + category to minimize API calls
  type Group = { city: string; cityEn: string; category: string; places: PlaceRow[] }
  const groups = new Map<string, Group>()

  for (const p of places as PlaceRow[]) {
    const art = Array.isArray(p.articles) ? p.articles[0] : p.articles
    const city = (art as { city?: string | null } | null)?.city ?? ''
    const cityEn = toEn(city)
    const cat = p.category?.toLowerCase() ?? 'attraction'
    const key = `${cityEn}::${cat}`
    if (!groups.has(key)) groups.set(key, { city, cityEn, category: cat, places: [] })
    groups.get(key)!.places.push(p)
  }

  console.log(`📋 ${places.length}개 장소 | ${groups.size}개 그룹 → Unsplash API ${groups.size}회 호출\n`)

  let fixed = 0
  let apiCalls = 0

  for (const group of Array.from(groups.values())) {
    const catQ = CATEGORY_QUERIES[group.category] ?? 'travel destination'
    const query = group.cityEn ? `${group.cityEn} ${catQ}` : catQ
    const photos = await fetchBatchPhotos(query, group.places.length)
    apiCalls++

    if (photos.length === 0) {
      console.log(`  ⚠️  no photos for "${query}" (${group.places.length}개 건너뜀)`)
      await new Promise(r => setTimeout(r, 500))
      continue
    }

    console.log(`  🌍 ${group.cityEn || '(unknown)'} / ${group.category} → ${photos.length}장 수신`)

    for (let i = 0; i < group.places.length; i++) {
      const place = group.places[i]
      const url = photos[i % photos.length]
      const { error: e } = await supabase
        .from('places')
        .update({ image_url: url })
        .eq('id', place.id)

      if (e) console.error(`    error ${place.name}:`, e)
      else { console.log(`    ✅ ${place.name}`); fixed++ }
    }

    // Rate limit: 50 req/hour → ~1.2s minimum between calls, use 1.5s to be safe
    await new Promise(r => setTimeout(r, 1500))
  }

  console.log(`\n✨ 완료! ${fixed} / ${places.length} 업데이트 (API ${apiCalls}회 호출)`)
}

main()
