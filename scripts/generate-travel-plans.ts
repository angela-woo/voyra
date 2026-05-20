#!/usr/bin/env npx tsx
/**
 * 여행 일정 콘텐츠 생성 스크립트
 * Usage: npx tsx scripts/generate-travel-plans.ts
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
  { city: '도쿄', country: '일본', country_code: 'TYO', cityEn: 'Tokyo' },
  { city: '오사카', country: '일본', country_code: 'OSA', cityEn: 'Osaka' },
  { city: '교토', country: '일본', country_code: 'KIX', cityEn: 'Kyoto' },
  { city: '파리', country: '프랑스', country_code: 'PAR', cityEn: 'Paris' },
  { city: '바르셀로나', country: '스페인', country_code: 'BCN', cityEn: 'Barcelona' },
  { city: '방콕', country: '태국', country_code: 'BKK', cityEn: 'Bangkok' },
  { city: '치앙마이', country: '태국', country_code: 'CNX', cityEn: 'Chiang Mai' },
  { city: '발리', country: '인도네시아', country_code: 'DPS', cityEn: 'Bali' },
  { city: '싱가포르', country: '싱가포르', country_code: 'SIN', cityEn: 'Singapore' },
  { city: '런던', country: '영국', country_code: 'LON', cityEn: 'London' },
]

const THEMES = [
  { travel_type: 'couple', days: 3, label: '커플 3일' },
  { travel_type: 'family', days: 4, label: '가족 4일' },
  { travel_type: 'friends', days: 3, label: '친구 3일' },
  { travel_type: 'solo', days: 3, label: '혼자 3일' },
]

function makeSlug(cityEn: string, travelType: string, days: number): string {
  return `${cityEn.toLowerCase().replace(/\s+/g, '-')}-${travelType}-${days}days`
}

async function generatePlan(dest: typeof DESTINATIONS[0], theme: typeof THEMES[0]) {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    messages: [{
      role: 'user',
      content: `${dest.city}(${dest.country}) ${theme.label} 여행 일정을 아래 JSON 형식으로 생성해주세요.
마크다운 코드블록 없이 순수 JSON만 반환하세요.

{
  "title": "SEO 최적화 제목 (50자 이내, 예: 도쿄 커플 여행 3일 코스 - 신주쿠부터 아사쿠사까지)",
  "meta_description": "150자 이내 설명",
  "overview": {
    "weather": "계절별 날씨 간단 설명",
    "currency": "현지 화폐명, 대략적인 환율 정보",
    "transport": "주요 교통수단 설명",
    "tips": ["주의사항1", "주의사항2", "주의사항3"],
    "best_season": "최적 여행 시기"
  },
  "days": [
    {
      "day": 1,
      "title": "Day 1 소제목",
      "places": [
        {
          "time": "09:00",
          "name": "장소명 (현지어 또는 영어)",
          "category": "attraction",
          "duration": "2시간",
          "cost": "무료",
          "description": "1-2문장 간단 설명",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=장소명+${dest.cityEn}",
          "klook_url": "https://www.klook.com/search/?query=장소명&aff_id=${KLOOK_AFF_ID}"
        },
        {
          "time": "12:00",
          "name": "식당명",
          "category": "restaurant",
          "duration": "1시간",
          "cost": "₩15,000~",
          "description": "설명",
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
- description은 1문장으로 짧게
- google_maps_url은 https://www.google.com/maps/search/?api=1&query=장소명 형식`,
    }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '{}'
  const jsonText = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  return JSON.parse(jsonText)
}

async function main() {
  // 기존 슬러그 목록 조회
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
        country_code: dest.country_code,
        days: theme.days,
        travel_type: theme.travel_type,
        title: generated.title,
        meta_description: generated.meta_description,
        overview: generated.overview,
        days_data: generated.days,
        published: true,
      })

      if (error) {
        console.log(`❌ ${error.message}`)
        fail++
      } else {
        console.log(`✅ 저장 완료`)
        success++
      }
    } catch (e) {
      console.log(`❌ ${e instanceof Error ? e.message : e}`)
      fail++
    }

    await new Promise(r => setTimeout(r, 1500))
  }

  console.log(`\n✨ 완료! 성공: ${success}개, 실패: ${fail}개`)
}

main().catch(console.error)
