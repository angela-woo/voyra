#!/usr/bin/env npx tsx
/**
 * 기존 아티클을 ### 서브헤딩 구조로 재생성합니다.
 * 이미 ### 구조가 있는 아티클은 건너뜁니다.
 *
 * 실행: env $(cat .env.local | grep -v '^#' | xargs) npx tsx scripts/regenerate-articles.ts
 * 특정 도시만: ... npx tsx scripts/regenerate-articles.ts --city 도쿄
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

async function restructureArticle(content: string, city: string): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    messages: [{
      role: 'user',
      content: `다음 여행 가이드 아티클을 ### 서브헤딩 구조로 재작성해주세요.

원본:
---
${content}
---

규칙:
1. ## 섹션 헤딩은 그대로 유지 (삭제/추가/변경 금지)
2. 각 ## 섹션 내 주요 장소·음식·팁 등을 ### 서브헤딩으로 분리 (섹션당 3~4개)
3. ### 헤딩 형식 (필수): ### 한국어명 (English Name)
   예: ### 센소지 사원 (Senso-ji Temple), ### 이치란 라멘 (Ichiran Ramen)
4. 각 아이템 설명 2~3문단, 기존 실용 정보(운영시간·가격·팁 등) 모두 유지
5. 기존 내용 총량과 비슷하게 유지
6. 구분선(---), # h1 헤딩은 그대로 유지

순수 마크다운만 반환. JSON·코드블록 없이.`,
    }],
  })
  return message.content[0].type === 'text' ? message.content[0].text.trim() : content
}

function hasSubheadings(content: string): boolean {
  return content.split('\n').some(l => l.startsWith('### '))
}

async function main() {
  let query = supabase.from('articles').select('id, city, content')
  if (targetCity) query = query.eq('city', targetCity)

  const { data: articles, error } = await query
  if (error) { console.error('❌ 조회 실패:', error.message); process.exit(1) }
  if (!articles?.length) { console.log('아티클 없음'); return }

  const toProcess = articles.filter(a => !hasSubheadings(a.content ?? ''))
  const alreadyDone = articles.length - toProcess.length

  console.log(`\n📋 전체 ${articles.length}개 | 이미 완료 ${alreadyDone}개 | 재생성 대상 ${toProcess.length}개\n`)

  if (toProcess.length === 0) {
    console.log('✅ 모든 아티클이 이미 ### 구조를 갖추고 있습니다.')
    return
  }

  let success = 0, failed = 0

  for (const article of toProcess) {
    process.stdout.write(`  📝 ${article.city} 재생성 중... `)
    try {
      const newContent = await restructureArticle(article.content ?? '', article.city ?? '')

      if (!hasSubheadings(newContent)) {
        console.log('⚠️  ### 헤딩 미생성 — 스킵')
        failed++
        continue
      }

      const { error: updateError } = await supabase
        .from('articles')
        .update({ content: newContent })
        .eq('id', article.id)

      if (updateError) {
        console.log(`❌ 저장 실패: ${updateError.message}`)
        failed++
      } else {
        const count = newContent.split('\n').filter(l => l.startsWith('### ')).length
        console.log(`✅ ### 헤딩 ${count}개 추가`)
        success++
      }
    } catch (e) {
      console.log(`❌ ${e instanceof Error ? e.message : e}`)
      failed++
    }
    await new Promise(r => setTimeout(r, 2000))
  }

  console.log(`\n✨ 완료! 성공 ${success}개, 실패 ${failed}개`)
}

main().catch(console.error)
