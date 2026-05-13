#!/usr/bin/env npx tsx
/**
 * 기존 아티클에 places 데이터 생성·삽입
 * Usage: npx tsx scripts/generate-places.ts
 */
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface GeneratedPlace {
  name: string
  category: 'hotel' | 'restaurant' | 'attraction' | 'cafe'
  address: string
  rating: number
  google_maps_url: string
}

async function generatePlaces(city: string, country: string): Promise<GeneratedPlace[]> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `${city}, ${country}의 대표 장소 4~5개를 JSON 배열로 반환해주세요.
마크다운 코드블록 없이 순수 JSON 배열만:
[
  {
    "name": "장소명 (현지어 또는 영어)",
    "category": "hotel 또는 restaurant 또는 attraction 또는 cafe 중 하나",
    "address": "실제 주소",
    "rating": 4.5,
    "google_maps_url": "https://maps.google.com/?q=위도,경도"
  }
]
구성: hotel 1~2개, restaurant 1~2개, attraction 1~2개. 실제 존재하는 장소와 위도/경도 사용.`,
    }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '[]'
  const jsonText = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  return JSON.parse(jsonText)
}

async function main() {
  // places가 없는 아티클만 가져오기
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, city, country')
    .eq('published', true)
    .order('created_at', { ascending: false })

  if (error || !articles) {
    console.error('아티클 조회 실패:', error?.message)
    return
  }

  // 이미 places가 있는 article_id 목록
  const { data: existingPlaces } = await supabase
    .from('places')
    .select('article_id')
  const hasPlaces = new Set((existingPlaces ?? []).map((p: { article_id: string }) => p.article_id))

  const targets = articles.filter(a => !hasPlaces.has(a.id) && a.city)
  console.log(`🚀 places 생성 대상: ${targets.length}개 아티클\n`)

  for (const article of targets) {
    process.stdout.write(`  📍 ${article.city}, ${article.country} — ${article.title.slice(0, 30)}... `)
    try {
      const places = await generatePlaces(article.city!, article.country!)
      if (!places.length) {
        console.log('⚠️  places 없음')
        continue
      }

      const rows = places.map(p => {
        const match = p.google_maps_url?.match(/[?&]q=([^,&]+),([^&]+)/)
        const lat = match ? parseFloat(match[1]) : null
        const lng = match ? parseFloat(match[2]) : null
        return {
          article_id: article.id,
          name: p.name,
          category: p.category,
          address: p.address,
          rating: p.rating,
          google_maps_url: p.google_maps_url,
          ...(lat && lng ? { lat, lng } : {}),
        }
      })

      const { error: insertError } = await supabase.from('places').insert(rows)
      if (insertError) {
        console.log(`❌ ${insertError.message}`)
      } else {
        console.log(`✅ ${places.length}개 저장`)
      }
    } catch (e) {
      console.log(`❌ ${e instanceof Error ? e.message : e}`)
    }
    await new Promise(r => setTimeout(r, 1500))
  }

  console.log('\n✨ 완료!')
}

main().catch(console.error)
