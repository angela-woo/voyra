#!/usr/bin/env npx tsx
/**
 * Generate English travel plans (language='en')
 * env $(cat .env.local | grep -v '^#' | xargs) npx tsx scripts/generate-travel-plans-en.ts
 *
 * Prereq: run supabase/add-language-column.sql first
 */
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

interface PlanSpec {
  city: string
  country: string
  country_code: string
  country_en?: string
  city_en?: string
  days: number
  travel_type: string
  theme?: string
  slugOverride?: string
}

const PLANS: PlanSpec[] = [
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
  // South Korea
  { city: 'Seoul', country: 'South Korea', country_code: 'ICN', country_en: 'south-korea', city_en: 'seoul', days: 3, travel_type: 'couple' },
  { city: 'Seoul', country: 'South Korea', country_code: 'ICN', country_en: 'south-korea', city_en: 'seoul', days: 4, travel_type: 'friends' },
  { city: 'Seoul', country: 'South Korea', country_code: 'ICN', country_en: 'south-korea', city_en: 'seoul', days: 3, travel_type: 'solo' },
  { city: 'Seoul', country: 'South Korea', country_code: 'ICN', country_en: 'south-korea', city_en: 'seoul', days: 4, travel_type: 'family' },
  { city: 'Seoul', country: 'South Korea', country_code: 'ICN', country_en: 'south-korea', city_en: 'seoul', days: 3, travel_type: 'friends', theme: 'kpop', slugOverride: 'seoul-kpop-3days-en' },
  { city: 'Busan', country: 'South Korea', country_code: 'PUS', country_en: 'south-korea', city_en: 'busan', days: 3, travel_type: 'couple' },
  { city: 'Busan', country: 'South Korea', country_code: 'PUS', country_en: 'south-korea', city_en: 'busan', days: 3, travel_type: 'friends' },
  { city: 'Jeju', country: 'South Korea', country_code: 'CJU', country_en: 'south-korea', city_en: 'jeju', days: 3, travel_type: 'couple' },
  { city: 'Jeju', country: 'South Korea', country_code: 'CJU', country_en: 'south-korea', city_en: 'jeju', days: 4, travel_type: 'family' },
  { city: 'Gyeongju', country: 'South Korea', country_code: 'ICN', country_en: 'south-korea', city_en: 'gyeongju', days: 2, travel_type: 'friends', theme: 'history', slugOverride: 'gyeongju-history-2days-en' },
  { city: 'Jeonju', country: 'South Korea', country_code: 'ICN', country_en: 'south-korea', city_en: 'jeonju', days: 2, travel_type: 'friends', theme: 'food', slugOverride: 'jeonju-food-2days-en' },
]

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const KOREA_PLAN_EXTRA = `
Additional requirements for South Korea itineraries:
- Include both English and Korean names for places: e.g. "Gyeongbokgung Palace (경복궁)"
- Use Google Maps links (works well for foreigners in Korea)
- Include Klook tour links for popular activities (city tours, K-pop experiences, etc.)
- Costs in USD (approximate: 1 USD ≈ 1,350 KRW)
- Recommend English-friendly restaurants and cafes
- Include K-pop related spots where relevant (HYBE, SM, YG, JYP buildings, fan cafes, music shows)
- Include K-drama filming locations where applicable
`

async function generatePlan(city: string, country: string, days: number, travel_type: string, theme?: string, slugOverride?: string) {
  const typeLabel = { solo: 'solo traveler', couple: 'couple', family: 'family', friends: 'group of friends' }[travel_type] ?? travel_type
  const isKorea = country === 'South Korea'
  const themeNote = theme === 'kpop' ? 'This itinerary is K-pop themed — focus on K-pop and K-drama related spots, fan cafes, idol agency buildings, and cultural experiences for K-pop fans.' :
    theme === 'history' ? 'This itinerary is history-themed — focus on ancient temples, royal tombs, UNESCO heritage sites, and traditional culture.' :
    theme === 'food' ? 'This itinerary is food-themed — focus on local cuisine, traditional markets, food streets, and cooking experiences.' : ''
  const slug = slugOverride ?? `${city.toLowerCase().replace(/\s+/g, '-')}-${travel_type}-${days}days-en`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 12000,
    messages: [{
      role: 'user',
      content: `Create a detailed ${days}-day travel itinerary for ${city}, ${country}, designed for a ${typeLabel}.
${themeNote ? `\nTheme: ${themeNote}` : ''}
${isKorea ? KOREA_PLAN_EXTRA : ''}
[Rules]
- Third person only. No "I recommend", "we suggest".
- Each day must have 4-6 places with specific times, costs, and descriptions.
- Cost format: use USD (e.g. "$15") or "Free"
- Provide real place names, addresses, and Google Maps coordinates.

Respond ONLY with valid JSON (no markdown code blocks):
{
  "title": "SEO-optimized English title",
  "slug": "${slug}",
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
          "cost": "Free or $15",
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
    const slug = p.slugOverride ?? `${p.city.toLowerCase().replace(/\s+/g, '-')}-${p.travel_type}-${p.days}days-en`
    return !existingSlugs.has(slug)
  })
  console.log(`\n📋 To generate: ${toGenerate.length} | Already exist: ${PLANS.length - toGenerate.length}\n`)

  let success = 0, failed = 0

  for (const dest of toGenerate) {
    const label = dest.theme ? `${dest.city} ${dest.days}D [${dest.theme}]` : `${dest.city} ${dest.days}D ${dest.travel_type}`
    process.stdout.write(`  📝 ${label}... `)
    try {
      const plan = await generatePlan(dest.city, dest.country, dest.days, dest.travel_type, dest.theme, dest.slugOverride)

      const { error } = await supabase
        .from('travel_plans')
        .insert({
          ...plan,
          country_code: dest.country_code,
          ...(dest.country_en ? { country_en: dest.country_en } : {}),
          ...(dest.city_en ? { city_en: dest.city_en } : {}),
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
