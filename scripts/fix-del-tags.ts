#!/usr/bin/env npx tsx
/**
 * Fix ~~ patterns in DB content that cause <del> tag rendering.
 * "150~~250달러" → "150~250달러"
 */
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

function fixTildes(text: string): string {
  return text
    .replace(/(\S)~~(\S)/g, '$1~$2')  // 150~~250 → 150~250
    .replace(/~~/g, '')                // 남은 ~~ 제거
}

function fixJson(val: unknown): unknown {
  if (typeof val === 'string') return fixTildes(val)
  if (Array.isArray(val)) return val.map(fixJson)
  if (val && typeof val === 'object') {
    return Object.fromEntries(Object.entries(val).map(([k, v]) => [k, fixJson(v)]))
  }
  return val
}

async function fixArticles() {
  const { data, error } = await supabase.from('articles').select('id, slug, content')
  if (error) { console.error('articles fetch error:', error); return 0 }

  let fixed = 0
  for (const row of data ?? []) {
    if (!row.content?.includes('~~')) continue
    const newContent = fixTildes(row.content)
    const { error: e } = await supabase.from('articles').update({ content: newContent }).eq('id', row.id)
    if (e) { console.error(`  error ${row.slug}:`, e) }
    else { console.log(`  [article] fixed: ${row.slug}`); fixed++ }
    await new Promise(r => setTimeout(r, 500))
  }
  return fixed
}

async function fixTravelPlans() {
  const { data, error } = await supabase.from('travel_plans').select('id, slug, title, meta_description, days_data')
  if (error) { console.error('travel_plans fetch error:', error); return 0 }

  let fixed = 0
  for (const row of data ?? []) {
    const fields: Record<string, string | null> = {
      title: row.title,
      meta_description: row.meta_description,
    }
    const hasTildeInText = Object.values(fields).some(v => v?.includes('~~'))
    const hasTildeInData = JSON.stringify(row.days_data ?? '').includes('~~')

    if (!hasTildeInText && !hasTildeInData) continue

    const updates: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(fields)) {
      if (val?.includes('~~')) updates[key] = fixTildes(val)
    }
    if (hasTildeInData) updates.days_data = fixJson(row.days_data)

    const { error: e } = await supabase.from('travel_plans').update(updates).eq('id', row.id)
    if (e) { console.error(`  error ${row.slug}:`, e) }
    else { console.log(`  [plan] fixed: ${row.slug}`); fixed++ }
    await new Promise(r => setTimeout(r, 500))
  }
  return fixed
}

async function main() {
  console.log('=== Fixing ~~ patterns in DB ===\n')
  const articleFixed = await fixArticles()
  const planFixed = await fixTravelPlans()
  console.log(`\nDone. articles: ${articleFixed} fixed, travel_plans: ${planFixed} fixed.`)
}

main()
