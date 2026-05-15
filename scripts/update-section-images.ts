#!/usr/bin/env npx tsx
/**
 * 기존 아티클의 section_images 컬럼을 자동으로 채우는 스크립트
 * 마크다운의 ## 헤딩을 파싱해 Unsplash 검색어를 자동 생성합니다.
 *
 * 실행: env $(cat .env.local | grep -v '^#' | xargs) npx tsx scripts/update-section-images.ts
 */
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const CITY_NAME_MAP: Record<string, string> = {
  교토: 'Kyoto', 오사카: 'Osaka', 도쿄: 'Tokyo', 서울: 'Seoul',
  발리: 'Bali', 싱가포르: 'Singapore', 방콕: 'Bangkok', 하노이: 'Hanoi',
  홍콩: 'Hong Kong', 상하이: 'Shanghai', 베이징: 'Beijing',
  두바이: 'Dubai', 이스탄불: 'Istanbul',
  런던: 'London', 파리: 'Paris', 로마: 'Rome', 암스테르담: 'Amsterdam',
  프라하: 'Prague', 비엔나: 'Vienna', 베를린: 'Berlin', 취리히: 'Zurich',
  코펜하겐: 'Copenhagen', 헬싱키: 'Helsinki', 바르셀로나: 'Barcelona',
  마드리드: 'Madrid', 리스본: 'Lisbon', 시드니: 'Sydney', 멜버른: 'Melbourne',
  뉴욕: 'New York', 로스앤젤레스: 'Los Angeles', 샌프란시스코: 'San Francisco',
}

function toEnglishCity(city: string): string {
  return CITY_NAME_MAP[city] ?? city
}

function sectionToSearchQuery(heading: string, cityEnglish: string): string {
  const h = heading.toLowerCase()
  if (/attraction|landmark|sightseeing|명소|관광|볼거리|여행지/.test(h)) return `${cityEnglish} attractions`
  if (/food|restaurant|dining|맛집|음식|먹거리|레스토랑|맛/.test(h)) return `${cityEnglish} food`
  if (/transport|getting around|교통|이동|지하철/.test(h)) return `${cityEnglish} transportation`
  if (/shopping|market|쇼핑|시장/.test(h)) return `${cityEnglish} shopping`
  if (/tip|advice|guide|팁|여행 정보|주의사항/.test(h)) return `${cityEnglish} travel`
  if (/hotel|accommodation|숙박|호텔/.test(h)) return `${cityEnglish} hotel`
  if (/cafe|coffee|카페|커피/.test(h)) return `${cityEnglish} cafe`
  if (/nature|park|자연|공원|hiking/.test(h)) return `${cityEnglish} nature landscape`
  if (/night|nightlife|bar|밤|야경|클럽/.test(h)) return `${cityEnglish} nightlife`
  if (/culture|history|art|문화|역사|예술/.test(h)) return `${cityEnglish} culture`
  return `${cityEnglish} travel`
}

function extractSectionImages(content: string, cityEnglish: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const line of content.split('\n')) {
    if (line.startsWith('## ')) {
      const heading = line.slice(3).trim()
      result[heading] = sectionToSearchQuery(heading, cityEnglish)
    }
  }
  return result
}

async function main() {
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, city, content, section_images')

  if (error) { console.error('❌ 아티클 조회 실패:', error.message); process.exit(1) }
  if (!articles?.length) { console.log('아티클 없음'); return }

  console.log(`🚀 ${articles.length}개 아티클 section_images 업데이트 시작...\n`)

  let updated = 0, skipped = 0

  for (const article of articles) {
    const cityEnglish = toEnglishCity(article.city ?? '')
    const sections = extractSectionImages(article.content ?? '', cityEnglish)
    const sectionCount = Object.keys(sections).length

    if (sectionCount === 0) {
      console.log(`  ⏭  ${article.city} — ## 섹션 없음, 스킵`)
      skipped++
      continue
    }

    const { error: updateError } = await supabase
      .from('articles')
      .update({ section_images: sections })
      .eq('id', article.id)

    if (updateError) {
      console.log(`  ❌ ${article.city} — ${updateError.message}`)
    } else {
      console.log(`  ✅ ${article.city} (${cityEnglish}) — ${sectionCount}개 섹션`)
      updated++
    }
  }

  console.log(`\n✨ 완료! 업데이트 ${updated}개, 스킵 ${skipped}개`)
}

main().catch(console.error)
