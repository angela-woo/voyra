#!/usr/bin/env npx tsx
/**
 * 전체 아티클 중복 썸네일 일괄 수정
 * 실행: env $(cat .env.local | grep -v '^#' | xargs) npx tsx scripts/fix-all-duplicate-images.ts
 */
import { createClient } from '@supabase/supabase-js'
import { topicsKo } from './topics-ko'
import { topicsEn } from './topics-en'

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '')
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const UNSPLASH_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY ?? ''

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 필수 환경변수 누락')
  process.exit(1)
}
if (!UNSPLASH_KEY) {
  console.error('❌ NEXT_PUBLIC_UNSPLASH_ACCESS_KEY 누락')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// slug → English city name 매핑 (topics 데이터 기반)
const SLUG_TO_CITY_EN: Record<string, string> = {}

for (const t of topicsKo) {
  const slug = `${t.citySlug}-${t.type}-ko`
  const cityEn = t.citySlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  SLUG_TO_CITY_EN[slug] = cityEn
}

for (const t of topicsEn) {
  const citySlug = t.city.toLowerCase().replace(/\s+/g, '-')
  const slug = `${citySlug}-${t.type}-en`
  SLUG_TO_CITY_EN[slug] = t.city
}

// 한→영 city 이름 fallback 맵
const KO_CITY_EN: Record<string, string> = {
  '도쿄': 'Tokyo', '오사카': 'Osaka', '교토': 'Kyoto', '삿포로': 'Sapporo',
  '후쿠오카': 'Fukuoka', '파리': 'Paris', '방콕': 'Bangkok', '발리': 'Bali',
  '싱가포르': 'Singapore', '하노이': 'Hanoi', '다낭': 'Da Nang',
  '런던': 'London', '뉴욕': 'New York', '로마': 'Rome', '바르셀로나': 'Barcelona',
  '두바이': 'Dubai', '세부': 'Cebu', '치앙마이': 'Chiang Mai', '푸켓': 'Phuket',
  '이스탄불': 'Istanbul', '타이베이': 'Taipei', '홍콩': 'Hong Kong',
  '서울': 'Seoul', '제주': 'Jeju', '호치민': 'Ho Chi Minh City',
  '쿄토': 'Kyoto', '나고야': 'Nagoya', '나라': 'Nara',
}

const TYPE_KEYWORD_MAP: Array<[string, string]> = [
  ['cherry-blossom', 'cherry blossom sakura spring'],
  ['snow-festival', 'snow festival winter lights'],
  ['day-trip', 'scenic day trip landscape'],
  ['street-food', 'street food night market'],
  ['best-restaurants', 'restaurant dining gourmet food'],
  ['shopping-guide', 'shopping street mall market'],
  ['complete-guide', 'famous landmark city skyline'],
  ['travel-guide', 'city travel iconic landmark'],
  ['temples-guide', 'temple shrine ancient architecture'],
  ['kimono', 'kimono traditional Japan culture'],
  ['dotonbori', 'Dotonbori neon canal'],
  ['usj', 'Universal Studios theme park'],
  ['shinjuku', 'Shinjuku neon nightlife'],
  ['shibuya', 'Shibuya crossing crowd'],
  ['asakusa', 'Asakusa temple traditional'],
  ['harajuku', 'Harajuku street fashion colorful'],
  ['ginza', 'Ginza luxury shopping'],
  ['beach', 'beach ocean tropical sunset'],
  ['winter', 'winter snow cold mountain'],
  ['resort', 'luxury resort pool infinity'],
  ['night', 'city night lights skyline'],
  ['cafe', 'cafe coffee cozy interior'],
  ['museum', 'museum art culture gallery'],
  ['hiking', 'hiking mountain trail'],
  ['food', 'food cuisine restaurant'],
  ['restaurant', 'restaurant dining food'],
  ['shopping', 'shopping street market'],
  ['temple', 'temple shrine ancient'],
  ['guide', 'city landmark famous attraction'],
]

function getCityEn(slug: string, cityKo: string): string {
  // 1. slug 기반 정확한 매핑
  if (SLUG_TO_CITY_EN[slug]) return SLUG_TO_CITY_EN[slug]

  // 2. 한국어 도시명 → 영어
  if (KO_CITY_EN[cityKo]) return KO_CITY_EN[cityKo]

  // 3. slug 앞부분에서 추출 (예: tokyo-street-food-ko → Tokyo)
  const prefix = slug.replace(/-(ko|en)$/, '').split('-')[0]
  return prefix.charAt(0).toUpperCase() + prefix.slice(1)
}

async function getUniqueImage(
  slug: string,
  cityEn: string,
  usedUrls: Set<string>,
): Promise<{ url: string; author: string } | null> {
  const lower = slug.toLowerCase()
  let query = `${cityEn} travel`
  for (const [key, kw] of TYPE_KEYWORD_MAP) {
    if (lower.includes(key)) { query = `${cityEn} ${kw}`; break }
  }

  for (let page = 1; page <= 10; page++) {
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=10&page=${page}&orientation=landscape`,
        { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } },
      )
      if (!res.ok) break
      const data = await res.json()
      for (const photo of (data.results ?? [])) {
        if (!usedUrls.has(photo.urls.regular)) {
          usedUrls.add(photo.urls.regular)
          return { url: photo.urls.regular, author: photo.user.name }
        }
      }
    } catch {
      break
    }
    await new Promise(r => setTimeout(r, 300))
  }

  // Fallback: scenic photography
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(cityEn + ' scenic photography')}&per_page=10&page=1&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } },
    )
    if (res.ok) {
      const data = await res.json()
      for (const photo of (data.results ?? [])) {
        if (!usedUrls.has(photo.urls.regular)) {
          usedUrls.add(photo.urls.regular)
          return { url: photo.urls.regular, author: photo.user.name }
        }
      }
    }
  } catch {}

  return null
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  console.log('🔍 전체 아티클 썸네일 중복 검사 시작...\n')

  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, slug, city, cover_image_url')
    .not('cover_image_url', 'is', null)
    .order('created_at', { ascending: true })

  if (error || !articles) {
    console.error('❌ DB 조회 실패:', error?.message)
    process.exit(1)
  }

  console.log(`📊 총 아티클 수: ${articles.length}개`)

  // URL → 아티클 목록 그룹핑
  const urlGroups = new Map<string, typeof articles>()
  for (const a of articles) {
    const url = a.cover_image_url as string
    if (!urlGroups.has(url)) urlGroups.set(url, [])
    urlGroups.get(url)!.push(a)
  }

  const dupGroups = [...urlGroups.entries()].filter(([, g]) => g.length > 1)
  console.log(`🔴 중복 이미지 URL: ${dupGroups.length}개`)

  const totalDups = dupGroups.reduce((sum, [, g]) => sum + g.length - 1, 0)
  console.log(`📌 교체 필요 아티클: ${totalDups}개\n`)

  if (totalDups === 0) {
    console.log('✅ 중복 없음. 종료합니다.')
    return
  }

  // 현재 사용 중인 모든 URL을 usedUrls에 등록
  const usedUrls = new Set<string>(articles.map(a => a.cover_image_url as string))

  let fixed = 0, skipped = 0, failed = 0

  for (const [dupUrl, group] of dupGroups) {
    console.log(`\n🔄 중복 URL (${group.length}개): ${dupUrl.slice(0, 60)}...`)

    // 첫 번째 아티클은 유지, 나머지 교체
    for (const article of group.slice(1)) {
      const cityEn = getCityEn(article.slug, article.city ?? '')
      process.stdout.write(`  → ${article.slug} (${cityEn})... `)

      const newImage = await getUniqueImage(article.slug, cityEn, usedUrls)

      if (!newImage) {
        console.log('❌ 고유 이미지 없음 (rate limit 가능)')
        skipped++
        await sleep(1000)
        continue
      }

      const { error: updateErr } = await supabase
        .from('articles')
        .update({
          cover_image_url: newImage.url,
          cover_image_attribution: newImage.author,
        })
        .eq('id', article.id)

      if (updateErr) {
        console.log(`❌ 업데이트 실패: ${updateErr.message}`)
        failed++
      } else {
        console.log(`✅ → ${newImage.url.slice(0, 50)}...`)
        fixed++
      }

      await sleep(1000)
    }
  }

  console.log(`\n✨ 완료!`)
  console.log(`  ✅ 교체 성공: ${fixed}개`)
  console.log(`  ⏭  스킵 (이미지 없음): ${skipped}개`)
  console.log(`  ❌ 실패: ${failed}개`)

  if (skipped > 0) {
    console.log('\n⚠️  스킵된 항목은 Unsplash rate limit (50 req/hr) 때문일 수 있습니다.')
    console.log('   1시간 후 다시 실행하면 추가 수정됩니다.')
  }
}

main().catch(console.error)
