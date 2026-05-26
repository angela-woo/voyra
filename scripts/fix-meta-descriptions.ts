#!/usr/bin/env npx tsx
/**
 * articles 테이블에서 meta_description이 짧거나 없는 항목을 Claude API로 재생성
 *
 * 실행: env $(cat .env.local | grep -v '^#' | xargs) npx tsx scripts/fix-meta-descriptions.ts
 * 건식 실행: ... npx tsx scripts/fix-meta-descriptions.ts --dry-run
 */
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
const DRY_RUN = process.argv.includes('--dry-run')
const MIN_LENGTH = 50

async function generateMetaDescription(
  title: string,
  city: string | null,
  country: string | null,
  language: string,
  contentSnippet: string,
): Promise<string> {
  const isKo = language === 'ko'
  const prompt = isKo
    ? `다음 여행 가이드 아티클에 대한 SEO 최적화된 meta_description을 작성해주세요.

제목: ${title}
도시: ${city ?? ''}
나라: ${country ?? ''}
내용 요약: ${contentSnippet.slice(0, 300)}

요구사항:
- 길이: 120~160자 (한글 기준)
- 도시명, 나라명, 핵심 여행 정보 포함
- 사용자가 클릭하고 싶게 만드는 문장
- "여행", "가이드", "팁" 등 키워드 자연스럽게 포함
- "|", 따옴표, 특수문자 없이 순수 텍스트로만
- 마침표로 끝내기

meta_description만 출력하세요:`
    : `Write an SEO-optimized meta_description for the following travel guide article.

Title: ${title}
City: ${city ?? ''}
Country: ${country ?? ''}
Content snippet: ${contentSnippet.slice(0, 300)}

Requirements:
- Length: 120-160 characters
- Include city name, country, and key travel information
- Compelling enough to drive clicks
- Naturally include keywords like "travel", "guide", "tips"
- Plain text only, no quotes or special characters
- End with a period

Output only the meta_description:`

  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''
  return text.slice(0, 160)
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Missing ANTHROPIC_API_KEY')
    process.exit(1)
  }

  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, city, country, language, meta_description, content')
    .eq('published', true)

  if (error) { console.error('Fetch error:', error); process.exit(1) }
  if (!articles?.length) { console.log('No articles found.'); return }

  const toFix = articles.filter(a =>
    !a.meta_description || a.meta_description.length < MIN_LENGTH,
  )

  console.log(`\n📋 전체 ${articles.length}개 | 수정 대상 ${toFix.length}개 (${MIN_LENGTH}자 미만)\n`)
  if (!toFix.length) { console.log('✅ 모든 meta_description이 충분합니다.'); return }
  if (DRY_RUN) { console.log('[dry-run] 업데이트하지 않습니다.'); return }

  let fixed = 0, failed = 0

  for (const article of toFix) {
    const contentSnippet = (article.content ?? '').replace(/#+\s|[*_~`]/g, '').slice(0, 500)
    process.stdout.write(`  📝 [${article.language}] ${article.title.slice(0, 50)}... `)

    try {
      const description = await generateMetaDescription(
        article.title,
        article.city,
        article.country,
        article.language,
        contentSnippet,
      )

      const { error: upErr } = await supabase
        .from('articles')
        .update({ meta_description: description })
        .eq('id', article.id)

      if (upErr) {
        console.log(`❌ ${upErr.message}`)
        failed++
      } else {
        console.log(`✅ (${description.length}자)`)
        fixed++
      }
    } catch (e) {
      console.log(`❌ ${e}`)
      failed++
    }

    await new Promise(r => setTimeout(r, 1000))
  }

  console.log(`\n✨ 완료! 성공 ${fixed}개 / 실패 ${failed}개`)
}

main().catch(console.error)
