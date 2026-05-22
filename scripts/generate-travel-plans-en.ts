#!/usr/bin/env npx tsx
/**
 * Generate English travel plans (language='en')
 * env $(cat .env.local | grep -v '^#' | xargs) npx tsx scripts/generate-travel-plans-en.ts
 *
 * Prereq: run supabase/add-language-column.sql first
 */
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const PLANS = [
  { city: 'Tokyo', country: 'Japan', country_code: 'TYO', days: 3, travel_type: 'solo' },
  { city: 'Paris', country: 'France', country_code: 'PAR', days: 4, travel_type: 'couple' },
  { city: 'Bali', country: 'Indonesia', country_code: 'DPS', days: 5, travel_type: 'friends' },
  { city: 'Bangkok', country: 'Thailand', country_code: 'BKK', days: 3, travel_type: 'solo' },
  { city: 'Singapore', country: 'Singapore', country_code: 'SIN', days: 3, travel_type: 'family' },
  { city: 'London', country: 'UK', country_code: 'LON', days: 4, travel_type: 'couple' },
  { city: 'Barcelona', country: 'Spain', country_code: 'BCN', days: 3, travel_type: 'friends' },
  { city: 'Rome', country: 'Italy', country_code: 'ROM', days: 3, travel_type: 'couple' },
  { city: 'New York', country: 'USA', country_code: 'NYC', days: 4, travel_type: 'friends' },
  { city: 'Amsterdam', country: 'Netherlands', country_code: 'AMS', days: 3, travel_type: 'couple' },
]

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function generatePlan(city: string, country: string, days: number, travel_type: string) {
  const typeLabel = { solo: 'solo traveler', couple: 'couple', family: 'family', friends: 'group of friends' }[travel_type] ?? travel_type

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    messages: [{
      role: 'user',
      content: `Create a detailed ${days}-day travel itinerary for ${city}, ${country}, designed for a ${typeLabel}.

[Rules]
- Third person only. No "I recommend", "we suggest".
- Each day must have 4-6 places with specific times, costs, and descriptions.
- Cost format: use local currency or "Free" (not just "$")
- Provide real place names, addresses, and Google Maps coordinates.

Respond ONLY with valid JSON (no markdown code blocks):
{
  "title": "SEO-optimized English title",
  "slug": "${city.toLowerCase().replace(/\s+/g, '-')}-${travel_type}-${days}days-en",
  "meta_description": "Under 160 chars, English",
  "city": "${city}",
  "country": "${country}",
  "days": ${days},
  "travel_type": "${travel_type}",
  "language": "en",
  "overview": {
    "weather": "Season/weather info in English",
    "currency": "Currency and exchange rate info",
    "transport": "How to get around",
    "best_season": "Best time to visit",
    "tips": ["tip1", "tip2", "tip3"]
  },
  "days_data": [
    {
      "day": 1,
      "title": "Day 1 title",
      "places": [
        {
          "time": "09:00",
          "name": "Place name",
          "category": "attraction or restaurant or cafe or hotel",
          "duration": "1.5 hours",
          "cost": "Free or $15 or £10",
          "description": "2-3 sentence description",
          "google_maps_url": "https://www.google.com/maps/search/?api=1&query=Name+City",
          "klook_url": "https://www.klook.com/search/?query=Place+Name&aff_id=121117",
          "alternatives": ["Alternative place 1", "Alternative place 2"]
        }
      ]
    }
  ]
}`,
    }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonText = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  return JSON.parse(jsonText)
}

async function main() {
  const { data: existing } = await supabase
    .from('travel_plans')
    .select('slug')
    .like('slug', '%-en')
  const existingSlugs = new Set((existing ?? []).map(p => p.slug))

  const toGenerate = PLANS.filter(p => {
    const slug = `${p.city.toLowerCase().replace(/\s+/g, '-')}-${p.travel_type}-${p.days}days-en`
    return !existingSlugs.has(slug)
  })
  console.log(`\n📋 To generate: ${toGenerate.length} | Already exist: ${PLANS.length - toGenerate.length}\n`)

  let success = 0, failed = 0

  for (const dest of toGenerate) {
    process.stdout.write(`  📝 ${dest.city} ${dest.days}D ${dest.travel_type}... `)
    try {
      const plan = await generatePlan(dest.city, dest.country, dest.days, dest.travel_type)

      const { error } = await supabase
        .from('travel_plans')
        .insert({
          ...plan,
          country_code: dest.country_code,
          published: true,
          views_count: 0,
        })

      if (error) {
        console.log(`❌ Save failed: ${error.message}`)
        failed++
        continue
      }

      console.log(`✅ "${plan.title}"`)
      success++
    } catch (e) {
      console.log(`❌ ${e instanceof Error ? e.message : e}`)
      failed++
    }
    await new Promise(r => setTimeout(r, 1500))
  }

  const { count } = await supabase
    .from('travel_plans')
    .select('*', { count: 'exact', head: true })
    .eq('language', 'en')
  console.log(`\n✨ Done! Success: ${success} | Failed: ${failed}`)
  console.log(`📊 Total English travel plans: ${count}`)
}

main().catch(console.error)
