#!/usr/bin/env npx tsx
/**
 * 전체 아티클 중복 커버 이미지 수정
 * Usage: env $(cat .env.local | grep -v '^#' | xargs) npx tsx scripts/fix-duplicate-images.ts
 */
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)
const UNSPLASH_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY!

// slug 키워드 → Unsplash 검색어 매핑
const SLUG_KEYWORD_MAP: Record<string, string> = {
  shinjuku: 'Shinjuku Tokyo neon nightlife',
  shibuya: 'Shibuya crossing Tokyo',
  asakusa: 'Asakusa Senso-ji Temple Tokyo',
  harajuku: 'Harajuku street fashion Tokyo',
  ginza: 'Ginza luxury shopping Tokyo',
  'cherry-blossom': 'Tokyo cherry blossom sakura',
  'cherry': 'sakura cherry blossom Japan',
  'day-trip': 'Mount Fuji Tokyo day trip',
  'travel-guide': 'Tokyo Tower skyline',
  local: 'Tokyo hidden gems local',
  shopping: 'Tokyo shopping street market',
  restaurant: 'Tokyo ramen sushi Japanese food',
  food: 'Japanese cuisine street food',
  usj: 'Universal Studios Japan Osaka',
  dotonbori: 'Dotonbori Osaka neon',
  kyoto: 'Kyoto bamboo forest temple',
  'snow-festival': 'Sapporo snow festival',
  winter: 'Sapporo winter snow Japan',
  beach: 'tropical beach ocean',
  temple: 'ancient temple shrine Asia',
  museum: 'museum gallery art',
  night: 'city night lights skyline',
  cafe: 'cozy coffee cafe interior',
  market: 'street market bazaar',
  hiking: 'hiking mountain trail nature',
  okinawa: 'Okinawa tropical beach coral',
  bali: 'Bali rice terrace temple',
  bangkok: 'Bangkok temple grand palace',
  paris: 'Paris Eiffel Tower cityscape',
  london: 'London Big Ben Thames',
  rome: 'Rome Colosseum ancient',
  barcelona: 'Barcelona Sagrada Familia',
  singapore: 'Singapore skyline Marina Bay',
  vietnam: 'Vietnam boat Ha Long Bay',
  danang: 'Da Nang beach Vietnam bridge',
  hanoi: 'Hanoi Old Quarter Vietnam',
  cebu: 'Cebu beach Philippines island',
  boracay: 'Boracay white beach Philippines',
  taipei: 'Taipei 101 night market',
  dubai: 'Dubai Burj Khalifa skyline',
  istanbul: 'Istanbul Blue Mosque Bosphorus',
  sydney: 'Sydney Opera House Harbour Bridge',
  melbourne: 'Melbourne coffee culture street art',
  newyork: 'New York Manhattan skyline',
  lasvegas: 'Las Vegas Strip neon night',
}

// 도시명 → 기본 검색어
const CITY_QUERY_MAP: Record<string, string> = {
  '도쿄': 'Tokyo Japan cityscape',
  '오사카': 'Osaka Japan castle',
  '교토': 'Kyoto Japan bamboo temple',
  '후쿠오카': 'Fukuoka Japan city',
  '삿포로': 'Sapporo Hokkaido Japan',
  '오키나와': 'Okinawa Japan tropical',
  '나고야': 'Nagoya Japan castle',
  '방콕': 'Bangkok Thailand temple',
  '치앙마이': 'Chiang Mai Thailand',
  '발리': 'Bali Indonesia temple rice',
  '싱가포르': 'Singapore skyline garden',
  '다낭': 'Da Nang Vietnam beach',
  '하노이': 'Hanoi Vietnam street',
  '호치민': 'Ho Chi Minh City Vietnam',
  '나트랑': 'Nha Trang Vietnam ocean',
  '세부': 'Cebu Philippines beach',
  '보라카이': 'Boracay Philippines tropical',
  '타이베이': 'Taipei Taiwan night market',
  '홍콩': 'Hong Kong skyline harbour',
  '파리': 'Paris France Eiffel',
  '런던': 'London UK Big Ben',
  '로마': 'Rome Italy Colosseum',
  '바르셀로나': 'Barcelona Spain Gaudi',
  '두바이': 'Dubai UAE modern skyline',
  '시드니': 'Sydney Australia Opera',
  '멜버른': 'Melbourne Australia street',
  '뉴욕': 'New York City Manhattan',
}

// slug에서 검색 키워드 추출
function slugToQuery(slug: string, city: string): string {
  const lower = slug.toLowerCase()

  // slug 키워드 우선 매칭 (긴 것 먼저)
  const sortedKeys = Object.keys(SLUG_KEYWORD_MAP).sort((a, b) => b.length - a.length)
  for (const key of sortedKeys) {
    if (lower.includes(key)) return SLUG_KEYWORD_MAP[key]
  }

  // 도시 기본 쿼리
  return CITY_QUERY_MAP[city] ?? `${city} travel destination`
}

async function fetchUnsplashPhoto(query: string, page = 1): Promise<{ url: string; author: string } | null> {
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&page=${page}&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } },
    )
    if (!res.ok) return null
    const data = await res.json()
    const results = data.results ?? []
    if (results.length === 0) return null
    const photo = results[Math.floor(Math.random() * Math.min(results.length, 3))]
    return {
      url: photo.urls.regular,
      author: photo.user.name,
    }
  } catch {
    return null
  }
}

async function main() {
  console.log('🔍 전체 아티클 중복 이미지 확인 중...\n')

  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, slug, city, cover_image_url')
    .eq('published', true)

  if (error || !articles) { console.error('조회 실패:', error); return }

  // 중복 URL 찾기
  const urlCount = new Map<string, typeof articles>()
  for (const a of articles) {
    if (!a.cover_image_url) continue
    const photoId = a.cover_image_url.split('/photo-')[1]?.split('?')[0]
    const key = photoId ?? a.cover_image_url
    if (!urlCount.has(key)) urlCount.set(key, [])
    urlCount.get(key)!.push(a)
  }

  const dupGroups = [...urlCount.entries()].filter(([, group]) => group.length > 1)
  console.log(`중복 이미지 그룹: ${dupGroups.length}개`)
  const totalDupes = dupGroups.reduce((acc, [, g]) => acc + g.length - 1, 0)
  console.log(`교체 대상: ${totalDupes}개 아티클\n`)

  const usedUrls = new Set(articles.map(a => {
    const photoId = a.cover_image_url?.split('/photo-')[1]?.split('?')[0]
    return photoId ?? a.cover_image_url
  }).filter(Boolean))

  let success = 0
  let fail = 0

  for (const [dupKey, group] of dupGroups) {
    console.log(`📦 중복 그룹 (x${group.length}): ...${dupKey.slice(-20)}`)

    // 첫 번째 아티클은 현재 이미지 유지, 나머지만 교체
    const toFix = group.slice(1)

    for (let i = 0; i < toFix.length; i++) {
      const article = toFix[i]
      const query = slugToQuery(article.slug, article.city ?? '')
      process.stdout.write(`  → [${article.slug}] "${query}" p${i + 2} ... `)

      let photo: { url: string; author: string } | null = null
      // 페이지를 달리해서 유니크한 이미지 찾기
      for (let page = i + 2; page <= i + 6; page++) {
        const candidate = await fetchUnsplashPhoto(query, page)
        if (!candidate) continue
        const candidateId = candidate.url.split('/photo-')[1]?.split('?')[0]
        if (!usedUrls.has(candidateId)) {
          photo = candidate
          if (candidateId) usedUrls.add(candidateId)
          break
        }
      }

      if (!photo) {
        // 쿼리 변형으로 재시도
        const altQuery = `${query} scenic photography`
        const candidate = await fetchUnsplashPhoto(altQuery, 1)
        if (candidate) {
          const candidateId = candidate.url.split('/photo-')[1]?.split('?')[0]
          if (!usedUrls.has(candidateId)) {
            photo = candidate
            if (candidateId) usedUrls.add(candidateId)
          }
        }
      }

      if (photo) {
        const { error: updateErr } = await supabase
          .from('articles')
          .update({
            cover_image_url: photo.url,
            cover_image_attribution: `Photo by ${photo.author} on Unsplash`,
          })
          .eq('id', article.id)

        if (updateErr) {
          console.log(`❌ ${updateErr.message}`)
          fail++
        } else {
          console.log(`✅`)
          success++
        }
      } else {
        console.log(`⚠️ 이미지 없음 (스킵)`)
        fail++
      }

      await new Promise(r => setTimeout(r, 1000))
    }
  }

  console.log(`\n✅ 완료: 성공 ${success}개, 실패/스킵 ${fail}개`)
}

main().catch(console.error)
