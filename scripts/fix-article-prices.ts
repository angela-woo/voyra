#!/usr/bin/env npx tsx
/**
 * articles의 content에서 잘못된 원화 가격 표기 수정
 *
 * Pattern A: "₩1,700 (500엔)" → "500엔"
 * Pattern B: "₩10,000~20,000" → "현지 통화 확인"
 *
 * 실행: env $(cat .env.local | grep -v '^#' | xargs) npx tsx scripts/fix-article-prices.ts
 */
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

function fixPrices(content: string): { result: string; countA: number; countB: number } {
  let countA = 0
  let countB = 0

  // Pattern A: ₩1,700 (500엔) → 500엔
  const resultA = content.replace(/₩[\d,]+~?\s*\(([^)]+)\)/g, (_, local) => {
    countA++
    return local.trim()
  })

  // Pattern B: 남은 ₩xxx 단독 표기 → 현지 통화 확인
  const resultB = resultA.replace(/₩[\d,]+(?:~[\d,]*)?/g, () => {
    countB++
    return '현지 통화 확인'
  })

  return { result: resultB, countA, countB }
}

async function main() {
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, slug, city, content')
    .eq('published', true)

  if (error || !articles) { console.error('fetch error:', error); return }

  let totalA = 0, totalB = 0, updated = 0

  for (const article of articles) {
    if (!article.content?.includes('₩')) continue

    const { result, countA, countB } = fixPrices(article.content)
    if (result === article.content) continue

    const { error: upErr } = await supabase
      .from('articles')
      .update({ content: result })
      .eq('id', article.id)

    if (upErr) {
      console.log(`❌ [${article.slug}] ${upErr.message}`)
    } else {
      console.log(`✅ [${article.slug}] (${article.city}) A:${countA}건 B:${countB}건 수정`)
      totalA += countA
      totalB += countB
      updated++
    }
  }

  console.log(`\n✨ 완료: ${updated}개 아티클 업데이트`)
  console.log(`   Pattern A (현지통화 추출): ${totalA}건`)
  console.log(`   Pattern B (원화 단독 삭제): ${totalB}건`)
}

main().catch(console.error)
