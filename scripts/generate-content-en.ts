#!/usr/bin/env npx tsx
/**
 * Generate English travel articles (language='en')
 * env $(cat .env.local | grep -v '^#' | xargs) npx tsx scripts/generate-content-en.ts
 *
 * Prereq: run supabase/add-language-column.sql first
 */
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const DESTINATIONS = [
  { city: 'Tokyo', country: 'Japan', type: 'first-timers guide' },
  { city: 'Paris', country: 'France', type: '3-day itinerary on a budget' },
  { city: 'Bali', country: 'Indonesia', type: 'best things to do' },
  { city: 'Bangkok', country: 'Thailand', type: 'travel guide for first-time visitors' },
  { city: 'Singapore', country: 'Singapore', type: '3-day itinerary' },
  { city: 'London', country: 'UK', type: 'travel guide for first timers' },
  { city: 'Barcelona', country: 'Spain', type: 'best things to do' },
  { city: 'Rome', country: 'Italy', type: '3-day itinerary on a budget' },
  { city: 'Amsterdam', country: 'Netherlands', type: 'travel guide for first-time visitors' },
  { city: 'New York', country: 'USA', type: 'best things to do' },
]

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function generateArticle(city: string, country: string, type: string) {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 6000,
    messages: [{
      role: 'user',
      content: `Write a travel guide article for English-speaking travelers.

Destination: ${city}, ${country}
Focus: ${city} ${type}

[Writing rules]
- Write in third person only (no "I visited", "we recommend", "I suggest")
- Factual, informative tone — like a professional travel guide
- Use long-tail SEO keywords naturally
  ✅ "${city} travel guide for first-time visitors"
  ✅ "best things to do in ${city}"
  ✅ "${city} 3-day itinerary"
- Minimum 2000 words
- Use ## for section headings, ### for sub-items

Respond ONLY with valid JSON (no markdown code blocks):
{
  "title": "SEO-optimized English title (e.g. '${city} Travel Guide: Best Things to Do for First-Time Visitors')",
  "slug": "${city.toLowerCase().replace(/\s+/g, '-')}-travel-guide-en",
  "meta_description": "Under 160 chars, English",
  "content": "Markdown body (2000+ words, English). ## headings, ### sub-items for places.",
  "category": "one of: 관광/맛집/자연/문화/쇼핑",
  "city": "${city}",
  "country": "${country}",
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
  return JSON.parse(jsonText)
}

async function main() {
  const { data: existing } = await supabase
    .from('articles')
    .select('city, language')
    .eq('language', 'en')
  const existingCities = new Set((existing ?? []).map(a => a.city))

  const toGenerate = DESTINATIONS.filter(d => !existingCities.has(d.city))
  console.log(`\n📋 To generate: ${toGenerate.length} | Already exist: ${DESTINATIONS.length - toGenerate.length}\n`)

  let success = 0, failed = 0

  for (const dest of toGenerate) {
    process.stdout.write(`  📝 ${dest.city} (${dest.type})... `)
    try {
      const article = await generateArticle(dest.city, dest.country, dest.type)
      const { places, ...articleData } = article

      const { data: inserted, error } = await supabase
        .from('articles')
        .insert({ ...articleData, published: true, section_images: article.section_images ?? {} })
        .select('id')
        .single()

      if (error || !inserted) {
        console.log(`❌ Save failed: ${error?.message}`)
        failed++
        continue
      }

      if (places?.length) {
        await supabase.from('places').insert(
          places.map((p: { name: string; category: string; address: string; rating: number; google_maps_url: string }) => ({
            article_id: inserted.id,
            name: p.name,
            category: p.category,
            address: p.address,
            rating: p.rating,
            google_maps_url: p.google_maps_url,
          })),
        )
        console.log(`✅ "${article.title}" (${places.length} places)`)
      } else {
        console.log(`✅ "${article.title}"`)
      }
      success++
    } catch (e) {
      console.log(`❌ ${e instanceof Error ? e.message : e}`)
      failed++
    }
    await new Promise(r => setTimeout(r, 1500))
  }

  const { count } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .eq('language', 'en')
  console.log(`\n✨ Done! Success: ${success} | Failed: ${failed}`)
  console.log(`📊 Total English articles: ${count}`)
}

main().catch(console.error)
