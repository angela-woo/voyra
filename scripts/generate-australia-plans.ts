#!/usr/bin/env npx tsx
/**
 * 호주(시드니/멜버른) 여행 일정 생성
 * Usage: env $(cat .env.local | grep -v '^#' | xargs) npx tsx scripts/generate-australia-plans.ts
 */
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const KLOOK_AFF_ID = '121117'

const DESTINATIONS = [
  { city: '시드니', country: '호주', country_en: 'australia', city_en: 'sydney', cityEn: 'Sydney' },
  { city: '멜버른', country: '호주', country_en: 'australia', city_en: 'melbourne', cityEn: 'Melbourne' },
]

const THEMES = [
  { travel_type: 'couple', days: 4, label: '커플 4일' },
  { travel_type: 'friends', days: 4, label: '친구 4일' },
  { travel_type: 'solo', days: 3, label: '혼자 3일' },
]

function makeSlug(cityEn: string, travelType: string, days: number): string {
  return `${cityEn.toLowerCase().replace(/\s+/g, '-')}-${travelType}-${days}days`
}

async function generatePlan(dest: typeof DESTINATIONS[0], theme: typeof THEMES[0]) {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 6000,
    messages: [{
      role: 'user',
      content: `${dest.city}(${dest.country}) ${theme.label} 여행 일정을 아래 JSON 형식으로 생성해주세요.
마크다운 코드블록 없이 순수 JSON만 반환하세요.

[문체 필수 규칙]
- 1인칭(나, 저, 제가, 우리) 절대 사용 금지
- 3인칭 정보 제공 형태로 작성 (객관적·유용한 정보 중심)
- description은 1문장으로 짧게
- ~~ 절대 사용 금지. 범위 표현은 ~ 하나만 사용 (예: 20~30달러)

{
  "title": "SEO 최적화 제목 (50자 이내, 예: ${dest.city} ${theme.label} 여행 코스 추천)",
  "meta_description": "150자 이내 설명",
  "overview": {
    "weather": "계절별 날씨 간단 설명",
    "currency": "호주 달러(AUD), 대략적인 환율 정보",
    "transport": "주요 교통수단 설명",
    "tips": ["한국인 여행 팁1", "한국인 여행 팁2", "한국인 여행 팁3"],
    "best_season": "최적 여행 시기"
  },
  "days": [
    {
      "day": 1,
      "title": "Day 1 소제목",
      "places": [
        {
          "time": "09:00",
          "name": "장소명",
          "category": "attraction",
          "duration": "2시간",
          "cost": "무료",
          "description": "1문장 설명",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=장소명+${dest.cityEn}",
          "klook_url": "https://www.klook.com/search/?query=장소명&aff_id=${KLOOK_AFF_ID}"
        },
        {
          "time": "12:00",
          "name": "식당명",
          "category": "restaurant",
          "duration": "1시간",
          "cost": "1인 20~30 AUD",
          "description": "1문장 설명",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=식당명+${dest.cityEn}",
          "alternatives": ["대안 식당1", "대안 식당2"]
        }
      ]
    }
  ]
}

조건:
- ${theme.days}일 일정
- 여행 스타일: ${theme.label}
- 하루 4~5개 장소 (간결하게)
- 식당/카페는 alternatives 2개 포함
- 관광지만 klook_url 포함
- 실제 존재하는 장소 사용
- google_maps_url은 https://www.google.com/maps/search/?api=1&query=장소명 형식
- 가격은 호주 달러(AUD)로 표기`,
    }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '{}'
  const jsonText = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  return JSON.parse(jsonText)
}

async function main() {
  const { data: existing } = await supabase.from('travel_plans').select('slug')
  const existingSlugs = new Set((existing ?? []).map((r: { slug: string }) => r.slug))

  const targets = []
  for (const dest of DESTINATIONS) {
    for (const theme of THEMES) {
      const slug = makeSlug(dest.cityEn, theme.travel_type, theme.days)
      if (!existingSlugs.has(slug)) targets.push({ dest, theme, slug })
    }
  }

  console.log(`🚀 생성 대상: ${targets.length}개 일정\n`)

  let success = 0
  let fail = 0

  for (const { dest, theme, slug } of targets) {
    process.stdout.write(`  ✈️  ${dest.city} ${theme.label} (${slug}) ... `)
    try {
      const generated = await generatePlan(dest, theme)

      const { error } = await supabase.from('travel_plans').insert({
        slug,
        city: dest.city,
        country: dest.country,
        country_en: dest.country_en,
        city_en: dest.city_en,
        days: theme.days,
        travel_type: theme.travel_type,
        title: generated.title,
        meta_description: generated.meta_description,
        overview: generated.overview,
        days_data: generated.days,
        language: 'ko',
        published: true,
      })

      if (error) {
        console.log(`❌ ${error.message}`)
        fail++
      } else {
        console.log(`✅`)
        success++
      }
    } catch (e) {
      console.log(`❌ ${e}`)
      fail++
    }

    await new Promise(r => setTimeout(r, 1000))
  }

  console.log(`\n완료: 성공 ${success}개, 실패 ${fail}개`)
}

main().catch(console.error)
