#!/usr/bin/env npx tsx
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const SLUG_STOP_WORDS = new Set([
  'travel', 'guide', 'tips', 'ultimate', 'best', 'things', 'what', 'how',
  'for', 'korean', 'travelers', 'to', 'in', 'the', 'a', 'an', 'top',
  'complete', 'perfect', 'must', 'see', 'do', 'visit',
])

function slugToSearchQuery(slug: string): string {
  const words = slug.split('-')
  const locationWords: string[] = []
  for (const word of words) {
    if (SLUG_STOP_WORDS.has(word)) break
    locationWords.push(word)
  }
  if (locationWords.length === 0) return slug.split('-').slice(0, 2).join(' ') + ' travel'
  return locationWords.join(' ') + ' travel'
}

async function fetchUnsplashPhoto(query: string): Promise<{ url: string; attribution: string } | null> {
  const key = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY
  if (!key) { console.error('UNSPLASH_ACCESS_KEY missing'); return null }
  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
    { headers: { Authorization: `Client-ID ${key}` } },
  )
  if (!res.ok) return null
  const data = await res.json()
  const photo = data.results?.[0]
  if (!photo) return null
  return {
    url: photo.urls.regular,
    attribution: `Photo by ${photo.user.name} on Unsplash`,
  }
}

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, slug, city, cover_image_url')
    .eq('published', true)
    .order('created_at', { ascending: false })

  if (error || !articles) { console.error('fetch error:', error); return }
  console.log(`Found ${articles.length} articles\n`)

  let updated = 0, skipped = 0, failed = 0

  for (const article of articles) {
    const query = slugToSearchQuery(article.slug)
    process.stdout.write(`[${article.slug}]\n  query: "${query}" ... `)

    const photo = await fetchUnsplashPhoto(query)
    if (!photo) {
      console.log('✗ no result')
      failed++
      await sleep(1000)
      continue
    }

    if (photo.url === article.cover_image_url) {
      console.log('= unchanged')
      skipped++
    } else {
      const { error: updateErr } = await supabase
        .from('articles')
        .update({ cover_image_url: photo.url, cover_image_attribution: photo.attribution })
        .eq('id', article.id)
      if (updateErr) {
        console.log(`✗ update failed: ${updateErr.message}`)
        failed++
      } else {
        console.log('✓ updated')
        updated++
      }
    }

    await sleep(1000)
  }

  console.log(`\nDone. updated=${updated}, skipped=${skipped}, failed=${failed}`)
}

main().catch(console.error)
