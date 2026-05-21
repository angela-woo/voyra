#!/usr/bin/env npx tsx
/**
 * 신규 25개 도시 아티클 생성 (1회용)
 * env $(cat .env.local | grep -v '^#' | xargs) npx tsx scripts/generate-new-cities.ts
 */
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const NEW_DESTINATIONS = [
  '베를린, 독일',
  '뮌헨, 독일',
  '암스테르담, 네덜란드',
  '브뤼셀, 벨기에',
  '비엔나, 오스트리아',
  '프라하, 체코',
  '부다페스트, 헝가리',
  '바르샤바, 폴란드',
  '스톡홀름, 스웨덴',
  '코펜하겐, 덴마크',
  '헬싱키, 핀란드',
  '오슬로, 노르웨이',
  '취리히, 스위스',
  '리스본, 포르투갈',
  '마드리드, 스페인',
  '로마, 이탈리아',
  '밀라노, 이탈리아',
  '아테네, 그리스',
  '두바이, UAE',
  '이스탄불, 터키',
  '뭄바이, 인도',
  '델리, 인도',
  '상하이, 중국',
  '베이징, 중국',
  '타이베이, 대만',
]

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function generateArticle(destination: string) {
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
section_images는 content의 ## 헤딩마다 하나씩 Unsplash 검색 키워드를 영어로 지정해주세요.`,
    }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonText = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  return JSON.parse(jsonText)
}

async function main() {
  // 이미 존재하는 도시 확인
  const { data: existing } = await supabase.from('articles').select('city')
  const existingCities = new Set((existing ?? []).map(a => a.city))

  const toGenerate = NEW_DESTINATIONS.filter(d => {
    const city = d.split(',')[0].trim()
    return !existingCities.has(city)
  })
  const skipped = NEW_DESTINATIONS.length - toGenerate.length

  console.log(`\n📋 생성 대상: ${toGenerate.length}개 | 이미 존재(스킵): ${skipped}개\n`)

  let success = 0, failed = 0

  for (const destination of toGenerate) {
    process.stdout.write(`  📝 ${destination} 생성 중... `)
    try {
      const article = await generateArticle(destination)
      const { places, ...articleData } = article

      const { data: inserted, error: articleError } = await supabase
        .from('articles')
        .insert({ ...articleData, published: true, section_images: article.section_images ?? {} })
        .select('id')
        .single()

      if (articleError || !inserted) {
        console.log(`❌ 저장 실패: ${articleError?.message}`)
        failed++
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
        await supabase.from('places').insert(placesRows)
        console.log(`✅ "${article.title}" (places ${places.length}개)`)
      } else {
        console.log(`✅ "${article.title}"`)
      }
      success++
    } catch (e) {
      console.log(`❌ ${e instanceof Error ? e.message : e}`)
      failed++
    }
    await new Promise(r => setTimeout(r, 1500))
  }

  const { count } = await supabase.from('articles').select('*', { count: 'exact', head: true }).eq('published', true)
  console.log(`\n✨ 완료! 성공 ${success}개 / 실패 ${failed}개`)
  console.log(`📊 현재 총 아티클 수: ${count}개`)
}

main().catch(console.error)
