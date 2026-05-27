#!/usr/bin/env npx tsx
/**
 * travel_plans의 days_data에서 잘못된 원화 가격 표기 수정
 *
 * Pattern A: "₩1,700 (500엔)" → "500엔"  (현지통화 병기된 경우)
 * Pattern B: "₩10,000~20,000" → "현지 통화 확인"  (원화 단독 표기)
 *
 * 실행: env $(cat .env.local | grep -v '^#' | xargs) npx tsx scripts/fix-price-format.ts
 */
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

function fixPrices(text: string): { result: string; countA: number; countB: number } {
  let countA = 0
  let countB = 0

  // Pattern A: ₩1,700 (500엔) → 500엔 / ₩9,000~ (980엔~) → 980엔~
  const resultA = text.replace(/₩[\d,]+~?\s*\(([^)]+)\)/g, (_, local) => {
    countA++
    return local.trim()
  })

  // Pattern B: 남은 ₩xxx 단독 표기 → 현지 통화 확인
  // JSON 문자열 안의 cost 값만 변경 (키 이름이 "cost"인 필드)
  const resultB = resultA.replace(/"cost"\s*:\s*"([^"]*₩[^"]*)"/g, (match, val) => {
    if (!val.includes('₩')) return match
    const fixed = val.replace(/₩[\d,]+(?:~[\d,]*)?/g, () => {
      countB++
      return '현지 통화 확인'
    })
    return match.replace(val, fixed)
  })

  return { result: resultB, countA, countB }
}

async function main() {
  const { data: plans, error } = await supabase
    .from('travel_plans')
    .select('id, slug, city, days_data')

  if (error || !plans) { console.error('fetch error:', error); return }

  let totalA = 0, totalB = 0, updated = 0

  for (const plan of plans) {
    const original = JSON.stringify(plan.days_data)
    if (!original.includes('₩')) continue

    const { result, countA, countB } = fixPrices(original)
    if (result === original) continue

    const { error: upErr } = await supabase
      .from('travel_plans')
      .update({ days_data: JSON.parse(result) })
      .eq('id', plan.id)

    if (upErr) {
      console.log(`❌ [${plan.slug}] ${upErr.message}`)
    } else {
      console.log(`✅ [${plan.slug}] (${plan.city}) A:${countA}건 B:${countB}건 수정`)
      totalA += countA
      totalB += countB
      updated++
    }
  }

  console.log(`\n✨ 완료: ${updated}개 플랜 업데이트`)
  console.log(`   Pattern A (현지통화 추출): ${totalA}건`)
  console.log(`   Pattern B (원화 단독 삭제): ${totalB}건`)
}

main().catch(console.error)
