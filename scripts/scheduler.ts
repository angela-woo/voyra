#!/usr/bin/env npx tsx
/**
 * 콘텐츠 자동 생성 스케줄러 — 매일 한글 5개 + 영어 5개
 *
 * 크론 설정 예시 (매일 오전 3시):
 *   0 3 * * * cd /path/to/voyra && env $(cat .env.local | xargs) npx tsx scripts/scheduler.ts >> logs/scheduler.log 2>&1
 *
 * 수동 실행:
 *   env $(cat .env.local | grep -v '^#' | xargs) npx tsx scripts/scheduler.ts
 * 옵션:
 *   --ko-count 5   (한글 생성 수, 기본 5)
 *   --en-count 5   (영어 생성 수, 기본 5)
 *   --dry-run      (실제 생성 없이 대기 목록만 출력)
 */
import { execSync } from 'child_process'
import { createClient } from '@supabase/supabase-js'
import { topicsKo } from './topics-ko'
import { topicsEn } from './topics-en'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

function getArg(flag: string, defaultVal: number): number {
  const idx = process.argv.indexOf(flag)
  return idx !== -1 ? parseInt(process.argv[idx + 1]) : defaultVal
}

const KO_COUNT = getArg('--ko-count', 5)
const EN_COUNT = getArg('--en-count', 5)
const DRY_RUN = process.argv.includes('--dry-run')

function makeKoSlug(citySlug: string, type: string) { return `${citySlug}-${type}-ko` }
function makeEnSlug(city: string, type: string) { return `${city.toLowerCase().replace(/\s+/g, '-')}-${type}-en` }

async function main() {
  const now = new Date().toISOString()
  console.log(`\n🗓  스케줄러 시작: ${now}`)

  // 기존 슬러그 조회
  const { data: existing } = await supabase.from('articles').select('slug')
  const existingSlugs = new Set((existing ?? []).map(a => a.slug))

  const pendingKo = topicsKo.filter(t => !existingSlugs.has(makeKoSlug(t.citySlug, t.type)))
  const pendingEn = topicsEn.filter(t => !existingSlugs.has(makeEnSlug(t.city, t.type)))

  const { count: totalKo } = await supabase.from('articles').select('*', { count: 'exact', head: true }).eq('language', 'ko')
  const { count: totalEn } = await supabase.from('articles').select('*', { count: 'exact', head: true }).eq('language', 'en')

  console.log(`\n📊 현재 현황: KO ${totalKo}개 | EN ${totalEn}개`)
  console.log(`📋 대기 중: KO ${pendingKo.length}개 | EN ${pendingEn.length}개`)

  if (pendingKo.length === 0 && pendingEn.length === 0) {
    console.log('\n✅ 모든 토픽이 이미 생성됨. 새 토픽을 topics-ko.ts / topics-en.ts에 추가하세요.')
    return
  }

  if (DRY_RUN) {
    console.log(`\n🔍 DRY RUN — 이번 실행 예정:`)
    console.log(`  한글 ${Math.min(KO_COUNT, pendingKo.length)}개:`)
    pendingKo.slice(0, KO_COUNT).forEach(t => console.log(`    - ${t.city}: ${t.keyword}`))
    console.log(`  영어 ${Math.min(EN_COUNT, pendingEn.length)}개:`)
    pendingEn.slice(0, EN_COUNT).forEach(t => console.log(`    - ${t.city}: ${t.keyword}`))
    return
  }

  // 한글 생성
  if (pendingKo.length > 0 && KO_COUNT > 0) {
    console.log(`\n🇰🇷 한글 아티클 ${Math.min(KO_COUNT, pendingKo.length)}개 생성 시작...`)
    try {
      execSync(
        `npx tsx scripts/generate-content-ko-batch.ts --limit ${KO_COUNT}`,
        { stdio: 'inherit', env: process.env },
      )
    } catch (e) {
      console.error('한글 생성 오류:', e)
    }
  }

  // 영어 생성
  if (pendingEn.length > 0 && EN_COUNT > 0) {
    console.log(`\n🇺🇸 영어 아티클 ${Math.min(EN_COUNT, pendingEn.length)}개 생성 시작...`)
    try {
      execSync(
        `npx tsx scripts/generate-content-en-batch.ts --limit ${EN_COUNT}`,
        { stdio: 'inherit', env: process.env },
      )
    } catch (e) {
      console.error('영어 생성 오류:', e)
    }
  }

  // 이미지 백필 (새로 생성된 아티클)
  console.log('\n📸 커버 이미지 백필...')
  try {
    execSync('npx tsx scripts/fix-article-images.ts', { stdio: 'inherit', env: process.env })
  } catch (e) {
    console.error('이미지 백필 오류:', e)
  }

  // 좌표 업데이트
  console.log('\n📍 좌표 업데이트...')
  try {
    execSync('npx tsx scripts/update-coordinates.ts', { stdio: 'inherit', env: process.env })
  } catch (e) {
    console.error('좌표 업데이트 오류:', e)
  }

  const { count: finalKo } = await supabase.from('articles').select('*', { count: 'exact', head: true }).eq('language', 'ko')
  const { count: finalEn } = await supabase.from('articles').select('*', { count: 'exact', head: true }).eq('language', 'en')
  console.log(`\n✨ 스케줄러 완료: KO ${finalKo}개 | EN ${finalEn}개 | 합계 ${(finalKo ?? 0) + (finalEn ?? 0)}개`)
}

main().catch(console.error)
