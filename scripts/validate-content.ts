#!/usr/bin/env npx tsx
/**
 * 아티클 품질 검증 스크립트
 * 실행: env $(cat .env.local | grep -v '^#' | xargs) npx tsx scripts/validate-content.ts
 * 옵션: --fix  (미달 항목 Supabase에서 unpublish)
 *       --language ko|en (특정 언어만 검증)
 */
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const FIX_MODE = process.argv.includes('--fix')
const langArg = process.argv.indexOf('--language')
const LANG_FILTER = langArg !== -1 ? process.argv[langArg + 1] : null

interface Article {
  id: string
  slug: string
  city: string
  language: string
  content: string | null
  meta_description: string | null
  cover_image_url: string | null
  title: string
}

interface ValidationResult {
  pass: boolean
  issues: string[]
}

function validate(article: Article): ValidationResult {
  const issues: string[] = []
  const content = article.content ?? ''
  const meta = article.meta_description ?? ''

  // 1. 글자 수 800자 이상
  if (content.length < 800) {
    issues.push(`글자 수 부족: ${content.length}자 (최소 800자)`)
  }

  // 2. ## 헤딩 3개 이상
  const h2Count = (content.match(/^## /gm) ?? []).length
  if (h2Count < 3) {
    issues.push(`## 헤딩 부족: ${h2Count}개 (최소 3개)`)
  }

  // 3. ~~ (이중 물결) 없는지
  if (content.includes('~~')) {
    const matches = content.match(/~~[^~]+~~/g) ?? []
    issues.push(`~~ 표기 발견: ${matches.slice(0, 2).join(', ')}`)
  }

  // 4. ₩숫자 형태의 원화 가격 표기 없는지 (KRW/₩ 통화 설명은 허용)
  const wonPrices = content.match(/₩[\d,]+/g) ?? []
  if (wonPrices.length > 0) {
    issues.push(`원화 가격 표기 발견: ${wonPrices.slice(0, 2).join(', ')}`)
  }

  // 5. meta_description 길이 (50~160자)
  if (meta.length > 0 && (meta.length < 50 || meta.length > 160)) {
    issues.push(`meta_description 길이 오류: ${meta.length}자 (50~160자 권장)`)
  } else if (meta.length === 0) {
    issues.push('meta_description 없음')
  }

  // 6. 이미지 없는지 (경고만)
  if (!article.cover_image_url) {
    issues.push('⚠️  cover_image_url 없음 (fix-article-images.ts 실행 필요)')
  }

  return { pass: issues.length === 0 || (issues.length === 1 && issues[0].startsWith('⚠️')), issues }
}

async function main() {
  let query = supabase.from('articles').select('id, slug, city, language, content, meta_description, cover_image_url, title').eq('published', true)
  if (LANG_FILTER) query = query.eq('language', LANG_FILTER)

  const { data: articles, error } = await query
  if (error || !articles) { console.error('fetch error:', error); return }

  console.log(`\n🔍 검증 대상: ${articles.length}개 아티클${LANG_FILTER ? ` (language=${LANG_FILTER})` : ''}\n`)

  let passed = 0, warned = 0, failed = 0
  const failList: { slug: string; issues: string[] }[] = []

  for (const article of articles as Article[]) {
    const { pass, issues } = validate(article)
    const warningOnly = issues.every(i => i.startsWith('⚠️'))

    if (issues.length === 0) {
      passed++
    } else if (warningOnly) {
      warned++
    } else {
      failed++
      failList.push({ slug: article.slug, issues })
      if (FIX_MODE) {
        await supabase.from('articles').update({ published: false }).eq('id', article.id)
      }
    }
  }

  if (failList.length > 0) {
    console.log('❌ 품질 미달 아티클:')
    failList.forEach(({ slug, issues }) => {
      console.log(`\n  [${slug}]`)
      issues.forEach(i => console.log(`    • ${i}`))
    })
    if (FIX_MODE) {
      console.log(`\n  → ${failed}개 아티클 unpublish 처리됨`)
    }
  }

  console.log(`\n📊 결과: ✅ 통과 ${passed} | ⚠️  경고 ${warned} | ❌ 실패 ${failed} (전체 ${articles.length}개)`)
  if (failed > 0 && !FIX_MODE) {
    console.log('  → --fix 플래그로 재실행 시 미달 항목을 unpublish 처리합니다')
  }
}

main().catch(console.error)
