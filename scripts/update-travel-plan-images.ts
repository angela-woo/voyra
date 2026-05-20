#!/usr/bin/env npx tsx
/**
 * travel_plans 각 카드에 고유 이미지 저장 (API 효율 최적화 버전)
 * 같은 도시 플랜들은 하나의 API 요청으로 여러 장 받아 순서대로 배분.
 *
 * 실행: env $(cat .env.local | grep -v '^#' | xargs) npx tsx scripts/update-travel-plan-images.ts
 * 덮어쓰기: ... npx tsx scripts/update-travel-plan-images.ts --force
 */
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)
const UNSPLASH_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY!
const FORCE = process.argv.includes('--force')

const CITY_MAP: Record<string, string> = {
  교토: 'Kyoto', 오사카: 'Osaka', 도쿄: 'Tokyo', 서울: 'Seoul', 나라: 'Nara',
  발리: 'Bali', 싱가포르: 'Singapore', 방콕: 'Bangkok', 하노이: 'Hanoi',
  치앙마이: 'Chiang Mai', 푸켓: 'Phuket', 다낭: 'Da Nang', 호치민: 'Ho Chi Minh City',
  홍콩: 'Hong Kong', 상하이: 'Shanghai', 베이징: 'Beijing', 타이베이: 'Taipei',
  두바이: 'Dubai', 이스탄불: 'Istanbul',
  런던: 'London', 파리: 'Paris', 로마: 'Rome', 암스테르담: 'Amsterdam',
  프라하: 'Prague', 비엔나: 'Vienna', 베를린: 'Berlin', 바르셀로나: 'Barcelona',
  마드리드: 'Madrid', 리스본: 'Lisbon', 부다페스트: 'Budapest',
  뮌헨: 'Munich', 밀라노: 'Milan', 피렌체: 'Florence',
  시드니: 'Sydney', 멜버른: 'Melbourne',
  뉴욕: 'New York', 로스앤젤레스: 'Los Angeles', 샌프란시스코: 'San Francisco',
  라스베이거스: 'Las Vegas', 밴쿠버: 'Vancouver',
}

function toEn(city: string): string {
  return CITY_MAP[city] ?? city
}

// 도시별 photos 일괄 fetch (한 번에 최대 30장)
async function fetchCityPhotos(city: string, count: number): Promise<string[]> {
  const per = Math.min(count + 2, 30)
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(toEn(city) + ' travel')}&per_page=${per}&orientation=landscape`
  try {
    const res = await fetch(url, { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } })
    if (!res.ok) {
      console.log(`  ⚠️  Unsplash ${res.status} for ${city}`)
      return []
    }
    const data = await res.json()
    return (data.results ?? []).map((p: { urls: { regular: string } }) => p.urls.regular)
  } catch {
    return []
  }
}

async function main() {
  if (!UNSPLASH_KEY) { console.error('❌ NEXT_PUBLIC_UNSPLASH_ACCESS_KEY 없음'); process.exit(1) }

  const { data: plans, error } = await supabase
    .from('travel_plans')
    .select('id, city, travel_type, days, cover_image_url')
    .order('city').order('travel_type')

  if (error) { console.error('❌ 조회 실패:', error.message); process.exit(1) }
  if (!plans?.length) { console.log('플랜 없음'); return }

  const toProcess = FORCE ? plans : plans.filter(p => !p.cover_image_url)
  const alreadyDone = plans.length - toProcess.length

  console.log(`\n📋 전체 ${plans.length}개 | 이미 완료 ${alreadyDone}개 | 업데이트 대상 ${toProcess.length}개\n`)
  if (!toProcess.length) { console.log('✅ 모두 완료 상태입니다. --force 옵션으로 재실행 가능.'); return }

  // 도시별 그룹핑
  const cityGroups: Record<string, typeof toProcess> = {}
  for (const plan of toProcess) {
    const c = plan.city ?? 'unknown'
    if (!cityGroups[c]) cityGroups[c] = []
    cityGroups[c].push(plan)
  }

  const uniqueCities = Object.keys(cityGroups)
  console.log(`📍 고유 도시 ${uniqueCities.length}개 → Unsplash API ${uniqueCities.length}회 호출\n`)

  let success = 0, failed = 0

  for (const city of uniqueCities) {
    const group = cityGroups[city]
    process.stdout.write(`  🌍 ${city} (${group.length}개 플랜) ... `)

    const photos = await fetchCityPhotos(city, group.length)

    if (!photos.length) {
      console.log('이미지 없음, 스킵')
      failed += group.length
      await new Promise(r => setTimeout(r, 500))
      continue
    }

    console.log(`사진 ${photos.length}장 수신`)

    for (let i = 0; i < group.length; i++) {
      const plan = group[i]
      // 사진 수보다 플랜 수가 많으면 순환
      const photoUrl = photos[i % photos.length]

      const { error: upErr } = await supabase
        .from('travel_plans')
        .update({ cover_image_url: photoUrl })
        .eq('id', plan.id)

      if (upErr) {
        console.log(`    ❌ [${plan.travel_type}] 저장 실패: ${upErr.message}`)
        failed++
      } else {
        console.log(`    ✅ [${plan.travel_type} · ${plan.days}일] 이미지 #${(i % photos.length) + 1} 저장`)
        success++
      }
    }

    // API 요청 간 딜레이 (rate limit 방지)
    await new Promise(r => setTimeout(r, 1500))
  }

  console.log(`\n✨ 완료! 성공 ${success}개 / 실패 ${failed}개`)
}

main().catch(console.error)
