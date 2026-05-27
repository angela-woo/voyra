#!/usr/bin/env npx tsx
/**
 * 한글 아티클 배치 생성기 (롱테일 키워드 타겟)
 * 실행: env $(cat .env.local | grep -v '^#' | xargs) npx tsx scripts/generate-content-ko-batch.ts
 * 옵션: --limit 5  (최대 생성 수)
 */
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import ws from 'ws'
import { topicsKo } from './topics-ko'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { realtime: { transport: ws } },
)
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const limitArg = process.argv.indexOf('--limit')
const LIMIT = limitArg !== -1 ? parseInt(process.argv[limitArg + 1]) : Infinity

function makeSlug(citySlug: string, type: string): string {
  return `${citySlug}-${type}-ko`
}

async function generateArticle(topic: typeof topicsKo[0], attempt = 1): Promise<Record<string, unknown>> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    messages: [{
      role: 'user',
      content: `한국인 여행자를 위한 여행 가이드 아티클을 작성해주세요.

여행지: ${topic.city}, ${topic.country}
주제: ${topic.keyword}

[문체 필수 규칙]
- 1인칭(나, 저, 제가, 우리) 절대 사용 금지
- "직접 경험한", "강력 추천", "제가 방문했을 때" 같은 주관적 표현 금지
- 3인칭 정보 제공 형태로 작성 (객관적·유용한 정보 중심)
- ~~ 절대 사용 금지. 범위 표현은 ~ 하나만 사용 (예: 27~32도, 1만~2만 엔)

[가격 표기 필수 규칙]
- 현지 통화만 표기 (엔, 바트, 유로, 달러 등)
- 원화(₩) 표기 절대 금지

[구조 규칙]
- ## 으로 섹션 구분 (5개 이상)
- 각 섹션 내 ### 으로 세부 항목 (각 섹션 2~3개)
- 총 콘텐츠 2000자 이상

Respond ONLY with valid JSON (no markdown code blocks):
{
  "title": "SEO 최적화 제목 (${topic.keyword} 키워드 자연스럽게 포함, 50자 이내)",
  "slug": "${makeSlug(topic.citySlug, topic.type)}",
  "meta_description": "150자 이내 요약, ${topic.keyword} 키워드 포함",
  "content": "마크다운 본문 (2000자 이상). ## 섹션, ### 세부항목 구조 사용.",
  "category": "관광 또는 맛집 또는 자연 또는 문화 또는 쇼핑 중 하나",
  "city": "${topic.city}",
  "country": "${topic.country}",
  "language": "ko",
  "places": [
    {
      "name": "장소명",
      "category": "attraction 또는 restaurant 또는 cafe 또는 hotel 중 하나",
      "address": "실제 주소",
      "rating": 4.5,
      "google_maps_url": "https://maps.google.com/?q=위도,경도"
    }
  ],
  "section_images": {
    "섹션 제목": "unsplash 검색 키워드 (영어)"
  }
}

places 4~5개, section_images는 모든 ## 섹션에 하나씩.`,
    }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonText = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  try {
    return JSON.parse(jsonText)
  } catch (e) {
    if (attempt < 3) {
      await sleep(2000)
      return generateArticle(topic, attempt + 1)
    }
    throw e
  }
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  // 기존 슬러그 조회
  const { data: existing } = await supabase.from('articles').select('slug').eq('language', 'ko')
  const existingSlugs = new Set((existing ?? []).map(a => a.slug))

  const pending = topicsKo.filter(t => !existingSlugs.has(makeSlug(t.citySlug, t.type)))
  const targets = LIMIT < Infinity ? pending.slice(0, LIMIT) : pending

  console.log(`\n📋 대기: ${pending.length}개 | 이미 존재: ${topicsKo.length - pending.length}개 | 이번 실행: ${targets.length}개\n`)

  let success = 0, failed = 0

  for (let i = 0; i < targets.length; i++) {
    const topic = targets[i]
    const slug = makeSlug(topic.citySlug, topic.type)
    process.stdout.write(`  [${i + 1}/${targets.length}] ${topic.city} — ${topic.keyword}... `)

    try {
      const article = await generateArticle(topic)
      const { places, ...articleData } = article as Record<string, unknown>

      const { data: inserted, error } = await supabase
        .from('articles')
        .insert({ ...articleData, slug, published: true, section_images: (article.section_images ?? {}) })
        .select('id')
        .single()

      if (error || !inserted) {
        console.log(`❌ DB 저장 실패: ${error?.message}`)
        failed++
        continue
      }

      if (Array.isArray(places) && places.length > 0) {
        await supabase.from('places').insert(
          places.map((p: Record<string, unknown>) => ({
            article_id: inserted.id,
            name: p.name,
            category: p.category,
            address: p.address,
            rating: p.rating,
            google_maps_url: p.google_maps_url,
          })),
        )
      }

      console.log(`✅ "${article.title}"`)
      success++
    } catch (e) {
      console.log(`❌ ${e instanceof Error ? e.message : e}`)
      failed++
    }

    await sleep(2000)
  }

  const { count } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .eq('language', 'ko')

  console.log(`\n✨ 완료! 성공: ${success} | 실패: ${failed}`)
  console.log(`📊 전체 한글 아티클: ${count}개`)
}

main().catch(console.error)
