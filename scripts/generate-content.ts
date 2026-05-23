#!/usr/bin/env npx ts-node
/**
 * Batch article generator using Claude API → Supabase
 * Usage: npx tsx scripts/generate-content.ts --destinations "도쿄,파리,발리"
 */
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const destinations = process.argv.includes('--destinations')
  ? process.argv[process.argv.indexOf('--destinations') + 1].split(',').map(s => s.trim())
  : [
    '런던, 영국',
    '로마, 이탈리아',
    '암스테르담, 네덜란드',
    '프라하, 체코',
    '비엔나, 오스트리아',
    '싱가포르, 싱가포르',
    '발리, 인도네시아',
    '홍콩, 홍콩',
    '이스탄불, 터키',
    '두바이, UAE',
    '마드리드, 스페인',
    '리스본, 포르투갈',
    '시드니, 호주',
    '멜버른, 호주',
    '베를린, 독일',
    '취리히, 스위스',
    '코펜하겐, 덴마크',
    '헬싱키, 핀란드',
    '오사카, 일본',
    '교토, 일본',
  ]

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

interface GeneratedArticle {
  title: string
  slug: string
  meta_description: string
  content: string
  category: string
  city: string
  country: string
  places: GeneratedPlace[]
  section_images?: Record<string, string>
}

async function generateArticle(destination: string): Promise<GeneratedArticle> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 6000,
    messages: [{
      role: 'user',
      content: `여행 가이드 아티클을 작성해주세요.

여행지: ${destination}

[문체 필수 규칙]
- 1인칭(나, 저, 제가, 우리) 절대 사용 금지
- "제가 가봤는데", "직접 경험한", "강력 추천" 같은 주관적 표현 금지
- 3인칭 정보 제공 형태로 작성
  ❌ "제가 방문했을 때 센소지는 정말 아름다웠어요"
  ✅ "센소지는 도쿄에서 가장 오래된 사원으로 연간 수백만 명이 방문하는 명소입니다"
  ❌ "이 식당은 제가 강력 추천하는 곳이에요"
  ✅ "현지인과 여행객 모두에게 인기 있는 맛집으로 평균 평점 4.5를 자랑합니다"
- 범위 표현 시 ~~ 절대 사용 금지, ~ 또는 - 만 사용 (예: 27~32도, 7~10월, 10-15분)

다음 JSON 형식으로 응답해주세요 (마크다운 코드블록 없이 순수 JSON만):
{
  "title": "매력적인 아티클 제목 (한국어)",
  "slug": "url-friendly-slug-in-english",
  "meta_description": "150자 이내 요약 (한국어)",
  "content": "마크다운 형식의 본문 (2000자 이상, 한국어). ## 소제목 사용, 추천 장소/음식/팁 포함. 1인칭 표현 없이 객관적 정보 전달.",
  "category": "카테고리 (관광/맛집/자연/문화/쇼핑 중 하나)",
  "city": "도시명 (한국어)",
  "country": "국가명 (한국어)",
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
    "섹션 제목": "Unsplash 검색 키워드 (영어, 도시명+주제 형식)"
  }
}

places는 해당 도시의 대표적인 장소 4~5개를 포함해주세요.
- hotel: 유명 호텔 1~2개
- restaurant: 현지 맛집 1~2개
- attraction: 관광 명소 1~2개
- cafe: 유명 카페 0~1개
google_maps_url은 실제 위도/경도를 사용해주세요.

section_images는 content의 ## 헤딩마다 하나씩 Unsplash 검색 키워드를 영어로 지정해주세요.
예시: { "도쿄 주요 관광명소": "tokyo landmarks", "도쿄 맛집 가이드": "tokyo street food" }`,
    }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonText = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  return JSON.parse(jsonText)
}

async function main() {
  console.log(`🚀 ${destinations.length}개 여행지 아티클 + places 생성 시작...\n`)

  for (const destination of destinations) {
    process.stdout.write(`  📝 ${destination} 생성 중... `)
    try {
      const article = await generateArticle(destination)
      const { places, ...articleData } = article

      // 아티클 저장
      const { data: inserted, error: articleError } = await supabase
        .from('articles')
        .insert({ ...articleData, published: true, section_images: article.section_images ?? {} })
        .select('id')
        .single()

      if (articleError || !inserted) {
        console.log(`❌ 아티클 저장 실패: ${articleError?.message}`)
        continue
      }

      // places 저장
      if (places?.length) {
        const placesRows = places.map(p => ({
          article_id: inserted.id,
          name: p.name,
          category: p.category,
          address: p.address,
          rating: p.rating,
          google_maps_url: p.google_maps_url,
        }))
        const { error: placesError } = await supabase.from('places').insert(placesRows)
        if (placesError) {
          console.log(`⚠️  places 저장 실패: ${placesError.message} (아티클은 저장됨)`)
        } else {
          console.log(`✅ "${article.title}" (places ${places.length}개)`)
        }
      } else {
        console.log(`✅ "${article.title}" (places 없음)`)
      }
    } catch (e) {
      console.log(`❌ ${e instanceof Error ? e.message : e}`)
    }
    await new Promise(r => setTimeout(r, 1500))
  }

  console.log('\n✨ 완료!')
}

main().catch(console.error)
