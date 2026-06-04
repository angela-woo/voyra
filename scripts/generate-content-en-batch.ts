#!/usr/bin/env npx tsx
/**
 * English article batch generator (long-tail keyword targeting)
 * Usage: env $(cat .env.local | grep -v '^#' | xargs) npx tsx scripts/generate-content-en-batch.ts
 * Options: --limit 5
 */
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { topicsEn } from './topics-en'
import { getEntityBasedImages } from '../src/lib/images/entityImageManager'

// 환경변수 검증 및 디버깅
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '')
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
console.log('SUPABASE_URL:', supabaseUrl.substring(0, 40) || '(empty)')
console.log('SERVICE_KEY exists:', supabaseKey.length > 0)
console.log('ANTHROPIC_KEY exists:', !!process.env.ANTHROPIC_API_KEY)

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing env vars — NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const UNSPLASH_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY ?? ''

const limitArg = process.argv.indexOf('--limit')
const LIMIT = limitArg !== -1 ? parseInt(process.argv[limitArg + 1]) : Infinity

const TYPE_KEYWORD_MAP: Array<[string, string]> = [
  ['cherry-blossom', 'cherry blossom sakura spring'],
  ['snow-festival', 'snow festival winter lights'],
  ['day-trip', 'scenic day trip landscape'],
  ['street-food', 'street food night market'],
  ['best-restaurants', 'restaurant dining gourmet food'],
  ['shopping-guide', 'shopping street mall market'],
  ['complete-guide', 'famous landmark city skyline'],
  ['travel-guide', 'city travel iconic landmark'],
  ['temples-guide', 'temple shrine ancient architecture'],
  ['kimono', 'kimono traditional Japan culture'],
  ['beach', 'beach ocean tropical sunset'],
  ['winter', 'winter snow cold mountain'],
  ['resort', 'luxury resort pool infinity'],
  ['night', 'city night lights skyline'],
  ['cafe', 'cafe coffee cozy interior'],
  ['museum', 'museum art culture gallery'],
  ['hiking', 'hiking mountain trail'],
  ['food', 'food cuisine restaurant'],
  ['restaurant', 'restaurant dining food'],
  ['shopping', 'shopping street market'],
  ['temple', 'temple shrine ancient'],
  ['guide', 'city landmark famous attraction'],
]

async function getUniqueImage(
  slug: string,
  cityEn: string,
  usedUrls: Set<string>,
): Promise<{ url: string; author: string } | null> {
  if (!UNSPLASH_KEY) return null
  const lower = slug.toLowerCase()
  let query = `${cityEn} travel`
  for (const [key, kw] of TYPE_KEYWORD_MAP) {
    if (lower.includes(key)) { query = `${cityEn} ${kw}`; break }
  }

  for (let page = 1; page <= 10; page++) {
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=10&page=${page}&orientation=landscape`,
        { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } },
      )
      if (!res.ok) break
      const data = await res.json()
      for (const photo of (data.results ?? [])) {
        if (!usedUrls.has(photo.urls.regular)) {
          usedUrls.add(photo.urls.regular)
          return { url: photo.urls.regular, author: photo.user.name }
        }
      }
    } catch {
      break
    }
    await new Promise(r => setTimeout(r, 200))
  }

  // Fallback: scenic photography
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(cityEn + ' scenic photography')}&per_page=10&page=1&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } },
    )
    if (res.ok) {
      const data = await res.json()
      for (const photo of (data.results ?? [])) {
        if (!usedUrls.has(photo.urls.regular)) {
          usedUrls.add(photo.urls.regular)
          return { url: photo.urls.regular, author: photo.user.name }
        }
      }
    }
  } catch {}

  return null
}

function makeSlug(city: string, type: string): string {
  return `${city.toLowerCase().replace(/\s+/g, '-')}-${type}-en`
}

async function generateArticle(topic: typeof topicsEn[0], attempt = 1): Promise<Record<string, unknown>> {
  const slug = makeSlug(topic.city, topic.type)
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    messages: [{
      role: 'user',
      content: `Write a travel guide article for English-speaking international travelers.

Destination: ${topic.city}, ${topic.country}
Target keyword: ${topic.keyword}

[Writing rules]
- Write in third person only (no "I visited", "we recommend", "I suggest")
- Factual, informative tone — professional travel guide style
- Use long-tail SEO keywords naturally throughout
- Minimum 2000 words
- Use ## for section headings (5+ sections), ### for sub-items

[Price rule]
- Use local currency only (JPY, THB, EUR, USD, etc.)
- Never use KRW (₩) — readers are international travelers

Respond ONLY with valid JSON (no markdown code blocks):
{
  "title": "SEO-optimized title naturally including '${topic.keyword}' (under 70 chars)",
  "slug": "${slug}",
  "meta_description": "Under 160 chars, include '${topic.keyword}'",
  "content": "Markdown body (2000+ words). ## headings, ### sub-items.",
  "category": "one of: 관광/맛집/자연/문화/쇼핑",
  "city": "${topic.city}",
  "country": "${topic.country}",
  "language": "en",
  "places": [
    {
      "name": "Place name",
      "category": "attraction or restaurant or cafe or hotel",
      "address": "Full address",
      "rating": 4.5,
      "google_maps_url": "https://maps.google.com/?q=lat,lng"
    }
  ],
  "section_images": {
    "Section Heading": "unsplash search query in English"
  }
}

Include 4-5 places. Add section_images for each ## heading.`,
    }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonText = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  try {
    return JSON.parse(jsonText)
  } catch (e) {
    if (attempt < 3) {
      await sleep(2000)
      return generateArticle(topic, attempt + 1)
    }
    throw e
  }
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  // Load existing image URLs to prevent duplicates
  const { data: existingImages } = await supabase
    .from('articles')
    .select('cover_image_url')
    .not('cover_image_url', 'is', null)
  const usedUrls = new Set<string>(
    (existingImages ?? []).map((a: { cover_image_url: string }) => a.cover_image_url),
  )
  console.log(`📷 Loaded ${usedUrls.size} existing image URLs`)

  const { data: existing } = await supabase.from('articles').select('slug').eq('language', 'en')
  const existingSlugs = new Set((existing ?? []).map(a => a.slug))

  const pending = topicsEn.filter(t => !existingSlugs.has(makeSlug(t.city, t.type)))
  const targets = LIMIT < Infinity ? pending.slice(0, LIMIT) : pending

  console.log(`\n📋 Pending: ${pending.length} | Already exist: ${topicsEn.length - pending.length} | This run: ${targets.length}\n`)

  let success = 0, failed = 0

  for (let i = 0; i < targets.length; i++) {
    const topic = targets[i]
    process.stdout.write(`  [${i + 1}/${targets.length}] ${topic.city} — ${topic.keyword}... `)

    try {
      const slug = makeSlug(topic.city, topic.type)
      const article = await generateArticle(topic)
      const { places, ...articleData } = article as Record<string, unknown>

      const { data: inserted, error } = await supabase
        .from('articles')
        .insert({
          ...articleData,
          published: true,
          section_images: (article.section_images ?? {}),
        })
        .select('id')
        .single()

      if (error || !inserted) {
        console.log(`❌ Save failed: ${error?.message}`)
        failed++
        continue
      }

      if (Array.isArray(places) && places.length > 0) {
        await supabase.from('places').insert(
          places.map((p: Record<string, unknown>) => ({
            article_id: inserted.id,
            name: p.name,
            category: p.category,
            address: p.address,
            rating: p.rating,
            google_maps_url: p.google_maps_url,
          })),
        )
      }

      // Entity-based image assignment
      try {
        const { coverImage } = await getEntityBasedImages(
          slug,
          String(article.title ?? ''),
          String(article.content ?? ''),
          topic.city,
          topic.country,
        )
        if (coverImage) {
          process.stdout.write(` 🖼️`)
        }
      } catch (imgErr) {
        process.stdout.write(` ⚠️img-error`)
        console.error('Image error:', imgErr)
      }

      console.log(` ✅ "${article.title}"`)
      success++
    } catch (e) {
      console.log(`❌ ${e instanceof Error ? e.message : e}`)
      failed++
    }

    await sleep(2000)
  }

  const { count } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .eq('language', 'en')

  console.log(`\n✨ Done! Success: ${success} | Failed: ${failed}`)
  console.log(`📊 Total English articles: ${count}`)
}

main().catch(console.error)
