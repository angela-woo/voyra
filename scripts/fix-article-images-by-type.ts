#!/usr/bin/env npx tsx
/**
 * 같은 도시 아티클들의 중복 커버 이미지를 타입별 키워드로 교체
 * Usage: env $(cat .env.local | grep -v '^#' | xargs) npx tsx scripts/fix-article-images-by-type.ts
 */
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)
const UNSPLASH_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY!

// slug 키워드 → Unsplash 검색어 (긴 것 먼저 매칭)
const TYPE_KEYWORD_MAP: Array<[string, string]> = [
  ['cherry-blossom', 'cherry blossom sakura spring'],
  ['snow-festival', 'snow festival winter lights'],
  ['hoi-an', 'Hoi An lantern ancient town'],
  ['kyoto-day-trip', 'Kyoto bamboo forest fushimi'],
  ['day-trip', 'scenic day trip nature landscape'],
  ['street-food', 'street food market night stalls'],
  ['best-restaurants', 'restaurant dining gourmet food'],
  ['shopping-guide', 'shopping street mall market'],
  ['complete-guide', 'famous landmark city skyline'],
  ['travel-guide', 'city travel iconic landmark'],
  ['temples-guide', 'temple shrine ancient architecture'],
  ['kimono-experience', 'kimono traditional Japan culture'],
  ['dotonbori', 'Dotonbori neon canal Osaka'],
  ['usj-guide', 'Universal Studios theme park'],
  ['shinjuku', 'Shinjuku Tokyo neon nightlife'],
  ['shibuya', 'Shibuya crossing Tokyo crowd'],
  ['asakusa', 'Asakusa Senso-ji temple traditional'],
  ['harajuku', 'Harajuku street fashion colorful'],
  ['ginza', 'Ginza luxury shopping boutique'],
  ['beach-guide', 'beach ocean tropical sunset'],
  ['beach', 'beach ocean tropical paradise'],
  ['winter-guide', 'winter snow cold mountain'],
  ['winter', 'winter snow cold cozy'],
  ['resort-guide', 'luxury resort pool ocean'],
  ['golf-guide', 'golf course tropical green'],
  ['night-guide', 'city night lights skyline glow'],
  ['night', 'night city lights skyline'],
  ['cafe', 'cafe coffee shop cozy interior'],
  ['museum', 'museum art culture gallery'],
  ['hiking', 'hiking mountain trail nature'],
  ['nature', 'nature landscape scenic outdoors'],
  ['budget', 'backpacker hostel budget travel'],
  ['luxury', 'luxury hotel resort elegant'],
  ['couple', 'couple romantic travel destination'],
  ['family', 'family vacation fun travel'],
  ['solo', 'solo travel adventure explore'],
  ['food', 'food cuisine restaurant dish'],
  ['restaurant', 'restaurant dining food plate'],
  ['shopping', 'shopping street market district'],
  ['temple', 'temple shrine ancient peaceful'],
  ['guide', 'city landmark famous attraction'],
]

// 도시명(한) → 영어 검색어 기본값
const CITY_QUERY_MAP: Record<string, string> = {
  '도쿄': 'Tokyo Japan tower skyline',
  '오사카': 'Osaka Japan castle river',
  '교토': 'Kyoto Japan bamboo geisha',
  '후쿠오카': 'Fukuoka Japan hakata street',
  '삿포로': 'Sapporo Hokkaido Japan snow',
  '오키나와': 'Okinawa Japan tropical turquoise',
  '나고야': 'Nagoya Japan castle traditional',
  '나라': 'Nara Japan deer park temple',
  '방콕': 'Bangkok Thailand temple palace',
  '치앙마이': 'Chiang Mai Thailand lotus market',
  '푸켓': 'Phuket Thailand beach island',
  '발리': 'Bali Indonesia rice terrace',
  '싱가포르': 'Singapore skyline Marina Bay',
  '다낭': 'Da Nang Vietnam beach bridge',
  '하노이': 'Hanoi Vietnam old quarter',
  '호치민': 'Ho Chi Minh Vietnam street',
  '나트랑': 'Nha Trang Vietnam ocean resort',
  '세부': 'Cebu Philippines island beach',
  '타이베이': 'Taipei Taiwan 101 night market',
  '홍콩': 'Hong Kong skyline harbour',
  '두바이': 'Dubai UAE Burj Khalifa modern',
  '이스탄불': 'Istanbul Turkey mosque Bosphorus',
  '파리': 'Paris France Eiffel Tower',
  '런던': 'London UK Big Ben Thames',
  '로마': 'Rome Italy Colosseum ancient',
  '바르셀로나': 'Barcelona Spain Gaudi',
  '암스테르담': 'Amsterdam Netherlands canal bike',
  '프라하': 'Prague Czech Republic old town',
  '시드니': 'Sydney Australia Opera House',
  '멜버른': 'Melbourne Australia street art',
  '뉴욕': 'New York Manhattan skyline',
  '라스베이거스': 'Las Vegas Strip night neon',
}

function slugToQuery(slug: string, city: string): string {
  const lower = slug.toLowerCase()
  for (const [key, query] of TYPE_KEYWORD_MAP) {
    if (lower.includes(key)) {
      const cityEn = CITY_QUERY_MAP[city]?.split(' ')[0] ?? ''
      return cityEn ? `${cityEn} ${query}` : query
    }
  }
  return CITY_QUERY_MAP[city] ?? `${city} travel destination`
}

function extractPhotoId(url: string): string {
  return url.split('/photo-')[1]?.split('?')[0] ?? url
}

async function fetchPhoto(query: string, page: number): Promise<{ url: string; author: string; photoId: string } | null> {
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&page=${page}&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } },
    )
    if (!res.ok) return null
    const data = await res.json()
    const results = data.results ?? []
    if (results.length === 0) return null
    // 여러 결과 중 랜덤 선택으로 다양성 확보
    const photo = results[Math.floor(Math.random() * Math.min(results.length, 3))]
    return {
      url: photo.urls.regular,
      author: photo.user.name,
      photoId: extractPhotoId(photo.urls.regular),
    }
  } catch {
    return null
  }
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  console.log('🔍 아티클 조회 중...\n')

  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, slug, city, cover_image_url')
    .eq('published', true)
    .order('city')

  if (error || !articles) { console.error('조회 실패:', error); return }

  // 이미 사용된 photo ID 수집
  const usedPhotoIds = new Set<string>()
  for (const a of articles) {
    if (a.cover_image_url) usedPhotoIds.add(extractPhotoId(a.cover_image_url))
  }

  // 도시별로 그룹화
  const byCity = new Map<string, typeof articles>()
  for (const a of articles) {
    const city = a.city ?? '__unknown__'
    if (!byCity.has(city)) byCity.set(city, [])
    byCity.get(city)!.push(a)
  }

  const multiCities = Array.from(byCity.entries()).filter(([, group]) => group.length > 1)
  console.log(`도시 수: ${byCity.size} | 중복 위험 도시: ${multiCities.length}개\n`)

  let success = 0
  let fail = 0
  let skip = 0

  for (const [city, group] of multiCities) {
    console.log(`\n🏙️  ${city} (${group.length}개 아티클)`)

    // 각 아티클에 타입별 고유 이미지 할당
    for (let i = 0; i < group.length; i++) {
      const article = group[i]
      const query = slugToQuery(article.slug, city)
      process.stdout.write(`  [${i + 1}/${group.length}] ${article.slug.substring(0, 40)} → "${query}" ... `)

      let found: { url: string; author: string; photoId: string } | null = null

      // 페이지를 달리해서 유니크한 이미지 찾기
      for (let page = 1; page <= 8; page++) {
        const candidate = await fetchPhoto(query, page)
        if (!candidate) break
        if (!usedPhotoIds.has(candidate.photoId)) {
          found = candidate
          break
        }
      }

      // 찾지 못하면 " scenic photography" suffix로 재시도
      if (!found) {
        for (let page = 1; page <= 5; page++) {
          const candidate = await fetchPhoto(`${query} scenic photography`, page)
          if (!candidate) break
          if (!usedPhotoIds.has(candidate.photoId)) {
            found = candidate
            break
          }
        }
      }

      if (!found) {
        console.log('⚠️  스킵 (유니크 이미지 없음)')
        skip++
        continue
      }

      const { error: updateError } = await supabase
        .from('articles')
        .update({
          cover_image_url: found.url,
          cover_image_attribution: found.author,
        })
        .eq('id', article.id)

      if (updateError) {
        console.log(`❌ 업데이트 실패: ${updateError.message}`)
        fail++
      } else {
        usedPhotoIds.add(found.photoId)
        console.log(`✅ ${found.author}`)
        success++
      }

      await sleep(1000)
    }
  }

  console.log(`\n📊 결과: 성공 ${success} | 실패 ${fail} | 스킵 ${skip}`)
}

main()
