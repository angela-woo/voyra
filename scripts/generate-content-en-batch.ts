#!/usr/bin/env npx tsx
/**
 * English article batch generator (long-tail keyword targeting)
 * Usage: env $(cat .env.local | grep -v '^#' | xargs) npx tsx scripts/generate-content-en-batch.ts
 * Options: --limit 5
 */
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import ws from 'ws'
import { topicsEn } from './topics-en'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { realtime: { transport: ws } },
)
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const limitArg = process.argv.indexOf('--limit')
const LIMIT = limitArg !== -1 ? parseInt(process.argv[limitArg + 1]) : Infinity

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
      const article = await generateArticle(topic)
      const { places, ...articleData } = article as Record<string, unknown>

      const { data: inserted, error } = await supabase
        .from('articles')
        .insert({ ...articleData, published: true, section_images: (article.section_images ?? {}) })
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

      console.log(`✅ "${article.title}"`)
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
