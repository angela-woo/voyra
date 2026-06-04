#!/usr/bin/env npx tsx
/**
 * 기존 아티클 이미지를 엔티티 기반으로 일괄 업데이트
 * 실행: env $(cat .env.local | grep -v '^#' | xargs) npx tsx scripts/update-entity-images.ts
 * 옵션: --limit 20 (처리할 아티클 수, 기본 50)
 *        --force    (이미 이미지 있는 아티클도 재처리)
 */
import { createClient } from '@supabase/supabase-js'
import { getEntityBasedImages } from '../src/lib/images/entityImageManager'

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '')
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 필수 환경변수 누락 — NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const limitArg = process.argv.indexOf('--limit')
const LIMIT = limitArg !== -1 ? parseInt(process.argv[limitArg + 1]) : 50
const FORCE = process.argv.includes('--force')

async function main() {
  let query = supabase
    .from('articles')
    .select('slug, title, content, city, country, cover_image_url')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(LIMIT)

  if (!FORCE) {
    // 이미지 없는 아티클 우선 처리
    query = supabase
      .from('articles')
      .select('slug, title, content, city, country, cover_image_url')
      .eq('published', true)
      .is('cover_image_url', null)
      .order('created_at', { ascending: false })
      .limit(LIMIT)
  }

  const { data: articles, error } = await query

  if (error || !articles) {
    console.error('Failed to fetch articles:', error)
    process.exit(1)
  }

  console.log(`\n🚀 엔티티 기반 이미지 업데이트 시작`)
  console.log(`📋 대상: ${articles.length}개 아티클 (--force: ${FORCE})\n`)

  let updated = 0
  let cached = 0
  let failed = 0

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i]
    process.stdout.write(`  [${i + 1}/${articles.length}] ${article.title?.slice(0, 40)}... `)

    try {
      const { coverImage, entities } = await getEntityBasedImages(
        article.slug,
        article.title || '',
        article.content || '',
        article.city || '',
        article.country || '',
      )

      if (coverImage) {
        const isNew = coverImage !== article.cover_image_url
        console.log(`${isNew ? '✅ 이미지 업데이트' : '⚡ 캐시 사용'} | 엔티티: ${entities.mainEntity.name}`)
        if (isNew) updated++
        else cached++
      } else {
        console.log(`⚠️ 이미지 없음`)
        failed++
      }

      await new Promise(r => setTimeout(r, 2000))
    } catch (err) {
      console.log(`❌ 오류: ${err instanceof Error ? err.message : err}`)
      failed++
      await new Promise(r => setTimeout(r, 1000))
    }
  }

  console.log(`\n✨ 완료!`)
  console.log(`  업데이트: ${updated}개`)
  console.log(`  캐시 사용: ${cached}개`)
  console.log(`  실패: ${failed}개`)
}

main().catch(console.error)
