#!/usr/bin/env npx tsx
/**
 * 한국인 인기 여행지 Korean article generator
 * Usage: npx tsx scripts/generate-content-popular-ko.ts
 */
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const DESTINATIONS = [
  { city: '후쿠오카', country: '일본', flightHours: '약 1시간 30분', currency: '엔(JPY)', currencyRate: '1엔 ≈ 9원 (2024년 기준)' },
  { city: '다낭', country: '베트남', flightHours: '약 4시간 30분', currency: '동(VND)', currencyRate: '1만 동 ≈ 550원 (2024년 기준)' },
  { city: '나트랑', country: '베트남', flightHours: '약 5시간', currency: '동(VND)', currencyRate: '1만 동 ≈ 550원 (2024년 기준)' },
  { city: '하노이', country: '베트남', flightHours: '약 5시간', currency: '동(VND)', currencyRate: '1만 동 ≈ 550원 (2024년 기준)' },
  { city: '호치민', country: '베트남', flightHours: '약 5시간 30분', currency: '동(VND)', currencyRate: '1만 동 ≈ 550원 (2024년 기준)' },
  { city: '세부', country: '필리핀', flightHours: '약 4시간 30분', currency: '페소(PHP)', currencyRate: '1페소 ≈ 24원 (2024년 기준)' },
  { city: '보라카이', country: '필리핀', flightHours: '약 4시간 30분 (칼리보 또는 카티클란 경유)', currency: '페소(PHP)', currencyRate: '1페소 ≈ 24원 (2024년 기준)' },
  { city: '마닐라', country: '필리핀', flightHours: '약 4시간', currency: '페소(PHP)', currencyRate: '1페소 ≈ 24원 (2024년 기준)' },
  { city: '괌', country: '괌', flightHours: '약 4시간', currency: '달러(USD)', currencyRate: '1달러 ≈ 1,350원 (2024년 기준)' },
  { city: '사이판', country: '사이판', flightHours: '약 4시간 30분', currency: '달러(USD)', currencyRate: '1달러 ≈ 1,350원 (2024년 기준)' },
  { city: '타이베이', country: '대만', flightHours: '약 2시간 30분', currency: '신대만달러(TWD)', currencyRate: '1TWD ≈ 42원 (2024년 기준)' },
  { city: '타이중', country: '대만', flightHours: '약 2시간 30분', currency: '신대만달러(TWD)', currencyRate: '1TWD ≈ 42원 (2024년 기준)' },
  { city: '오키나와', country: '일본', flightHours: '약 2시간 30분', currency: '엔(JPY)', currencyRate: '1엔 ≈ 9원 (2024년 기준)' },
  { city: '삿포로', country: '일본', flightHours: '약 3시간', currency: '엔(JPY)', currencyRate: '1엔 ≈ 9원 (2024년 기준)' },
  { city: '나고야', country: '일본', flightHours: '약 2시간', currency: '엔(JPY)', currencyRate: '1엔 ≈ 9원 (2024년 기준)' },
]

async function generateArticle(dest: typeof DESTINATIONS[0]) {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 7000,
    messages: [{
      role: 'user',
      content: `한국인 여행자를 위한 ${dest.city}(${dest.country}) 여행 가이드 아티클을 작성해주세요.

[문체 필수 규칙]
- 1인칭(나, 저, 제가, 우리) 절대 사용 금지
- "제가 가봤는데", "직접 경험한", "강력 추천" 같은 주관적 표현 금지
- 3인칭 정보 제공 형태로 작성 (객관적·유용한 정보 중심)
- ~~ 절대 사용 금지. 범위 표현은 ~ 하나만 사용 (예: 150~250달러, 20만~33만 원, 27~32도)

[필수 포함 정보]
- 인천공항 기준 비행시간: ${dest.flightHours}
- 현지 화폐: ${dest.currency}, ${dest.currencyRate}
- 물가 수준 (한국 대비 저렴/비슷/비쌈 여부, 식비/교통/숙박 대략 금액)
- 한국어 소통 가능 여부 (한국어 메뉴판, 한국어 앱, 한국인 직원, 한국어 안내판 등)

[구조 규칙]
- ## 으로 섹션 구분 (최소 5개 섹션)
- 각 ## 섹션 내에서 ### 으로 세부 항목 구분 (각 섹션에 2~4개 ### 항목)
- 예시 구조:
  ## 기본 여행 정보
  ### 인천공항에서 ${dest.city}까지
  ### 현지 화폐와 물가
  ### 한국어 소통 가이드
  ## 주요 관광지
  ### 관광지1
  ### 관광지2

다음 JSON 형식으로 응답해주세요 (마크다운 코드블록 없이 순수 JSON만):
{
  "title": "SEO 최적화 매력적인 아티클 제목 (한국어, 예: ${dest.city} 여행 완벽 가이드 - 한국인이 꼭 알아야 할 정보)",
  "slug": "url-friendly-slug-in-english-with-hyphens",
  "meta_description": "150자 이내 요약 (한국어, 핵심 여행 정보 포함)",
  "content": "마크다운 형식의 본문 (2500자 이상, 한국어). ## 섹션, ### 서브헤딩 구조 필수. 1인칭 없이 객관적 정보 전달.",
  "category": "카테고리 (관광/맛집/자연/문화/쇼핑 중 하나)",
  "city": "${dest.city}",
  "country": "${dest.country}",
  "places": [
    {
      "name": "장소명 (현지어 또는 영어)",
      "category": "hotel 또는 restaurant 또는 attraction 또는 cafe 중 하나",
      "address": "실제 주소",
      "rating": 4.5,
      "google_maps_url": "https://maps.google.com/?q=위도,경도"
    }
  ],
  "section_images": {
    "## 섹션 제목": "Unsplash 검색 키워드 (영어)"
  }
}

places는 해당 도시의 대표적인 장소 4~5개:
- hotel: 유명 호텔 1개
- restaurant: 현지 맛집 1~2개
- attraction: 관광 명소 1~2개
- cafe: 유명 카페 0~1개
google_maps_url은 실제 위도/경도 사용.

section_images는 ## 헤딩마다 하나씩 영어 Unsplash 키워드 지정.`,
    }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonText = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  return JSON.parse(jsonText)
}

async function main() {
  // 이미 존재하는 city 조회 (중복 방지)
  const { data: existing } = await supabase
    .from('articles')
    .select('city')
    .eq('language', 'ko')
  const existingCities = new Set((existing ?? []).map((r: { city: string }) => r.city))

  const targets = DESTINATIONS.filter(d => !existingCities.has(d.city))
  const skipped = DESTINATIONS.filter(d => existingCities.has(d.city))

  if (skipped.length > 0) {
    console.log(`⏭  이미 존재하여 스킵: ${skipped.map(d => d.city).join(', ')}\n`)
  }

  console.log(`🚀 ${targets.length}개 아티클 생성 시작...\n`)

  let success = 0
  let fail = 0

  for (const dest of targets) {
    process.stdout.write(`  📝 ${dest.city}(${dest.country}) 생성 중... `)
    try {
      const article = await generateArticle(dest)
      const { places, ...articleData } = article

      const { data: inserted, error: articleError } = await supabase
        .from('articles')
        .insert({ ...articleData, published: true, language: 'ko', section_images: article.section_images ?? {} })
        .select('id')
        .single()

      if (articleError || !inserted) {
        console.log(`❌ 저장 실패: ${articleError?.message}`)
        fail++
        continue
      }

      if (places?.length) {
        const placesRows = places.map((p: { name: string; category: string; address: string; rating: number; google_maps_url: string }) => ({
          article_id: inserted.id,
          name: p.name,
          category: p.category,
          address: p.address,
          rating: p.rating,
          google_maps_url: p.google_maps_url,
        }))
        const { error: placesError } = await supabase.from('places').insert(placesRows)
        if (placesError) {
          console.log(`⚠️  places 저장 실패: ${placesError.message}`)
        } else {
          console.log(`✅ "${article.title}" (places ${places.length}개)`)
        }
      } else {
        console.log(`✅ "${article.title}"`)
      }
      success++
    } catch (e) {
      console.log(`❌ ${e instanceof Error ? e.message : e}`)
      fail++
    }
    await new Promise(r => setTimeout(r, 1500))
  }

  console.log(`\n✨ 완료! 성공: ${success}개, 실패: ${fail}개, 스킵: ${skipped.length}개`)
}

main().catch(console.error)
