#!/usr/bin/env npx tsx
/**
 * 아티클 본문 내 도시명 자동 내부 링크 삽입
 * 실행: env $(cat .env.local | grep -v '^#' | xargs) npx tsx scripts/add-internal-links.ts
 * 옵션: --dry-run  (DB 업데이트 없이 결과 미리보기)
 *       --limit 10 (처리할 아티클 수 제한)
 *       --language ko|en
 */
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const DRY_RUN = process.argv.includes('--dry-run')
const limitArg = process.argv.indexOf('--limit')
const LIMIT = limitArg !== -1 ? parseInt(process.argv[limitArg + 1]) : Infinity
const langArg = process.argv.indexOf('--language')
const LANG = langArg !== -1 ? process.argv[langArg + 1] : 'ko'

const TARGET_CITIES_KO = [
  '도쿄', '오사카', '교토', '후쿠오카', '오키나와', '삿포로', '나고야',
  '파리', '발리', '방콕', '다낭', '싱가포르', '세부', '보라카이',
  '타이베이', '런던', '이스탄불', '치앙마이',
  '나트랑', '호치민', '하노이', '마드리드', '로마', '두바이',
  '바르셀로나', '암스테르담', '프라하', '뉴욕',
]

const TARGET_CITIES_EN = [
  'Tokyo', 'Osaka', 'Kyoto', 'Fukuoka', 'Okinawa', 'Sapporo',
  'Paris', 'Bali', 'Bangkok', 'Da Nang', 'Singapore', 'Cebu',
  'Taipei', 'London', 'Istanbul', 'Chiang Mai',
  'Ho Chi Minh', 'Hanoi', 'Madrid', 'Rome', 'Dubai',
  'Barcelona', 'Amsterdam', 'Prague', 'New York',
]

function processContent(
  content: string,
  citySlugMap: Record<string, string>,
  articleCity: string | null,
  articlePath: string,
): { result: string; changed: boolean; links: string[] } {
  let result = content
  const links: string[] = []

  for (const [city, slug] of Object.entries(citySlugMap)) {
    if (city === articleCity) continue
    if (!result.includes(city)) continue

    // 이미 링크로 감싼 경우 스킵
    if (result.includes(`[${city}](/${articlePath}/`)) continue

    let replaced = false
    const lines = result.split('\n')
    const processed = lines.map(line => {
      if (replaced) return line
      if (line.startsWith('#')) return line         // 헤딩 스킵
      if (line.startsWith('|')) return line         // 테이블 스킵
      if (!line.includes(city)) return line

      const idx = line.indexOf(city)
      if (idx === -1) return line

      // 이미 마크다운 링크 텍스트 안에 있는지 확인
      const before = line.substring(0, idx)
      const openBracket = before.lastIndexOf('[')
      const closeBracket = before.lastIndexOf(']')
      if (openBracket > closeBracket) return line   // [ ... 도시명 → 링크 텍스트 내부

      replaced = true
      links.push(city)
      return (
        line.substring(0, idx) +
        `[${city}](/${articlePath}/${slug})` +
        line.substring(idx + city.length)
      )
    })

    if (replaced) result = processed.join('\n')
  }

  return { result, changed: links.length > 0, links }
}

async function main() {
  const targetCities = LANG === 'ko' ? TARGET_CITIES_KO : TARGET_CITIES_EN
  const articlePath = LANG === 'ko' ? 'article' : 'en/article'

  console.log(`\n🔗 내부 링크 삽입 시작 (language=${LANG}, dry-run=${DRY_RUN})`)

  // 도시별 대표 아티클 slug 조회
  const { data: cityArticles } = await supabase
    .from('articles')
    .select('slug, city')
    .eq('published', true)
    .eq('language', LANG)
    .in('city', targetCities)
    .order('created_at', { ascending: false })

  const citySlugMap: Record<string, string> = {}
  for (const row of cityArticles ?? []) {
    if (row.city && !citySlugMap[row.city]) {
      citySlugMap[row.city] = row.slug
    }
  }

  console.log(`📍 링크 가능한 도시: ${Object.keys(citySlugMap).join(', ')}\n`)

  // 처리할 아티클 조회
  const { data: articles } = await supabase
    .from('articles')
    .select('id, slug, city, content')
    .eq('published', true)
    .eq('language', LANG)
    .not('content', 'is', null)
    .order('created_at', { ascending: false })
    .limit(LIMIT < Infinity ? LIMIT : 10000)

  let changed = 0, skipped = 0

  for (const article of articles ?? []) {
    const { result, changed: didChange, links } = processContent(
      article.content ?? '',
      citySlugMap,
      article.city,
      articlePath,
    )

    if (!didChange) { skipped++; continue }

    process.stdout.write(`  [${article.slug}] → ${links.join(', ')}... `)

    if (!DRY_RUN) {
      const { error } = await supabase
        .from('articles')
        .update({ content: result })
        .eq('id', article.id)

      if (error) { console.log(`❌ ${error.message}`); continue }
    }

    console.log('✅')
    changed++
  }

  console.log(`\n✨ 완료: 링크 추가 ${changed}개 | 변경 없음 ${skipped}개`)
  if (DRY_RUN) console.log('(dry-run 모드: DB 업데이트 없음)')
}

main().catch(console.error)
