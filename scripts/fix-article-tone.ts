#!/usr/bin/env npx tsx
/**
 * 기존 아티클 본문에서 1인칭 표현을 3인칭 정보 제공 형태로 수정합니다.
 * 1인칭 표현이 없는 아티클은 건너뜁니다.
 *
 * 실행: env $(cat .env.local | grep -v '^#' | xargs) npx tsx scripts/fix-article-tone.ts
 * 특정 도시: ... npx tsx scripts/fix-article-tone.ts --city 도쿄
 * 강제 전체: ... npx tsx scripts/fix-article-tone.ts --force
 */
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const targetCity = process.argv.includes('--city')
  ? process.argv[process.argv.indexOf('--city') + 1]
  : null
const force = process.argv.includes('--force')

// 1인칭 표현 패턴 감지
const FIRST_PERSON_PATTERNS = [
  /\b(나는|나의|저는|저의|제가|제 |우리가|우리는|우리의)\b/,
  /가봤는데|가봤을 때|방문했을 때|먹어봤|경험했|느꼈|생각했|좋았어|좋았다/,
  /강력 추천|꼭 가보세요|가보시길 바랍니다|정말 맛있어|정말 좋아/,
  /직접 경험|직접 가본|직접 먹어본/,
]

function hasFirstPerson(content: string): boolean {
  return FIRST_PERSON_PATTERNS.some(pattern => pattern.test(content))
}

async function fixTone(content: string, city: string): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    messages: [{
      role: 'user',
      content: `아래 ${city} 여행 가이드 텍스트를 3인칭 정보 제공 형태로 수정해주세요.

[수정 규칙]
1. 1인칭 표현(나, 저, 제가, 우리, 직접 경험한) 제거 → 객관적 정보로 변환
2. 주관적 감탄 표현 → 사실 기반 정보로 변환
   ❌ "제가 가봤을 때 센소지는 정말 아름다웠어요"
   ✅ "센소지는 도쿄에서 가장 오래된 사원으로 연간 수백만 명이 방문하는 명소입니다"
   ❌ "이 식당은 제가 강력 추천하는 곳이에요"
   ✅ "현지인과 여행객 모두에게 인기 있는 맛집으로 평균 평점 4.5를 자랑합니다"
3. 내용(정보량), 구조(마크다운 헤딩/섹션), 길이는 그대로 유지
4. 1인칭 표현이 없는 문장은 수정하지 말 것
5. 마크다운 형식 그대로 유지 (##, ###, -, * 등)

원본:
---
${content}
---

순수 마크다운만 반환. JSON·코드블록 없이.`,
    }],
  })
  return message.content[0].type === 'text' ? message.content[0].text.trim() : content
}

async function main() {
  let query = supabase.from('articles').select('id, city, content')
  if (targetCity) query = query.eq('city', targetCity)

  const { data: articles, error } = await query
  if (error) { console.error('❌ 조회 실패:', error.message); process.exit(1) }
  if (!articles?.length) { console.log('아티클 없음'); return }

  const toProcess = force
    ? articles
    : articles.filter(a => hasFirstPerson(a.content ?? ''))
  const skipped = articles.length - toProcess.length

  console.log(`\n📋 전체 ${articles.length}개 | 1인칭 없음(스킵) ${skipped}개 | 수정 대상 ${toProcess.length}개\n`)

  if (!toProcess.length) {
    console.log('✅ 모든 아티클에 1인칭 표현이 없습니다.')
    return
  }

  let success = 0, failed = 0

  for (const article of toProcess) {
    process.stdout.write(`  ✍️  ${article.city} 문체 수정 중... `)
    try {
      const fixed = await fixTone(article.content ?? '', article.city ?? '')

      const { error: updateError } = await supabase
        .from('articles')
        .update({ content: fixed })
        .eq('id', article.id)

      if (updateError) {
        console.log(`❌ 저장 실패: ${updateError.message}`)
        failed++
      } else {
        console.log('✅')
        success++
      }
    } catch (e) {
      console.log(`❌ ${e instanceof Error ? e.message : e}`)
      failed++
    }
    await new Promise(r => setTimeout(r, 1500))
  }

  console.log(`\n✨ 완료! 성공 ${success}개 / 실패 ${failed}개`)
}

main().catch(console.error)
