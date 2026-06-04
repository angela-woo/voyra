#!/usr/bin/env npx tsx
/**
 * 한글 아티클 배치 생성기 (롱테일 키워드 타겟)
 * 실행: env $(cat .env.local | grep -v '^#' | xargs) npx tsx scripts/generate-content-ko-batch.ts
 * 옵션: --limit 5  (최대 생성 수)
 */
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { topicsKo } from './topics-ko'
import { getEntityBasedImages } from '../src/lib/images/entityImageManager'

// 환경변수 검증 및 디버깅
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '')
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
console.log('SUPABASE_URL:', supabaseUrl.substring(0, 40) || '(empty)')
console.log('SERVICE_KEY exists:', supabaseKey.length > 0)
console.log('ANTHROPIC_KEY exists:', !!process.env.ANTHROPIC_API_KEY)

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 필수 환경변수 누락 — NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const UNSPLASH_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY ?? ''

const limitArg = process.argv.indexOf('--limit')
const LIMIT = limitArg !== -1 ? parseInt(process.argv[limitArg + 1]) : Infinity

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

async function getUniqueImage(
  slug: string,
  cityEn: string,
  usedUrls: Set<string>,
): Promise<{ url: string; author: string } | null> {
  if (!UNSPLASH_KEY) return null
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
    await new Promise(r => setTimeout(r, 200))
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
  // 기존 이미지 URL 로드 (중복 방지)
  const { data: existingImages } = await supabase
    .from('articles')
    .select('cover_image_url')
    .not('cover_image_url', 'is', null)
  const usedUrls = new Set<string>(
    (existingImages ?? []).map((a: { cover_image_url: string }) => a.cover_image_url),
  )
  console.log(`📷 기존 이미지 ${usedUrls.size}개 로드 완료`)

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
        .insert({
          ...articleData,
          slug,
          published: true,
          section_images: (article.section_images ?? {}),
        })
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

      // 엔티티 기반 이미지 결정 (커버 이미지 + 엔티티 매핑)
      try {
        const { coverImage } = await getEntityBasedImages(
          slug,
          String(article.title ?? ''),
          String(article.content ?? ''),
          topic.city,
          topic.country,
        )
        if (coverImage) {
          process.stdout.write(` 🖼️`)
        }
      } catch (imgErr) {
        process.stdout.write(` ⚠️이미지오류`)
        console.error('Image error:', imgErr)
      }

      console.log(` ✅ "${article.title}"`)
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
