#!/usr/bin/env npx tsx
/**
 * articles, travel_plans 테이블에서 lat/lng NULL인 항목을 cityCoordinates 매핑으로 업데이트
 * 실행: env $(cat .env.local | grep -v '^#' | xargs) npx tsx scripts/update-coordinates.ts
 */
import { createClient } from '@supabase/supabase-js'
import { getCityCoordinates } from '../src/lib/utils/cityCoordinates'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function updateTable(table: 'articles' | 'travel_plans') {
  const { data, error } = await supabase
    .from(table)
    .select('id, city')
    .or('lat.is.null,lng.is.null')

  if (error) { console.error(`  ❌ ${table} fetch error:`, error.message); return }
  if (!data?.length) { console.log(`  ✅ ${table}: all rows already have coordinates`); return }

  console.log(`  📋 ${table}: ${data.length}개 업데이트 대상`)
  let fixed = 0, skipped = 0

  for (const row of data) {
    const coords = getCityCoordinates(row.city ?? '')
    if (!coords) { skipped++; continue }

    const { error: upErr } = await supabase
      .from(table)
      .update({ lat: coords.lat, lng: coords.lng })
      .eq('id', row.id)

    if (upErr) {
      console.log(`    ❌ [${row.city}] ${upErr.message}`)
    } else {
      console.log(`    ✅ [${row.city}] → ${coords.lat}, ${coords.lng}`)
      fixed++
    }
  }

  console.log(`  → 완료: ${fixed}개 업데이트, ${skipped}개 좌표 없음 (스킵)\n`)
}

async function main() {
  console.log('\n🌍 Updating article coordinates...\n')
  await updateTable('articles')
  // travel_plans has no lat/lng columns — coordinates resolved at runtime via getCityCoordinates()
  console.log('✨ 완료!')
}

main().catch(console.error)
