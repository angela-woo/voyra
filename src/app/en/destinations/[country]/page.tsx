import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const revalidate = 3600

interface PageProps {
  params: Promise<{ country: string }>
}

const THEME_LABELS: Record<string, string> = {
  couple: 'Couple',
  family: 'Family',
  friends: 'Friends',
  solo: 'Solo',
}

interface CityGroup {
  city: string
  city_en: string
  country: string
  themes: string[]
  planCount: number
}

async function getCities(countrySlug: string): Promise<{ countryName: string; cities: CityGroup[] }> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('travel_plans')
    .select('city, city_en, country, travel_type')
    .eq('country_en', countrySlug)
    .eq('language', 'en')
    .eq('published', true)

  if (!data || data.length === 0) return { countryName: '', cities: [] }

  const countryName = data[0].country
  const map = new Map<string, { city: string; city_en: string; themes: Set<string> }>()
  for (const row of data) {
    const key = row.city_en ?? row.city.toLowerCase()
    if (!map.has(key)) map.set(key, { city: row.city, city_en: key, themes: new Set() })
    map.get(key)!.themes.add(row.travel_type)
  }

  return {
    countryName,
    cities: Array.from(map.values()).map(({ city, city_en, themes }) => ({
      city,
      city_en,
      country: countryName,
      themes: Array.from(themes),
      planCount: data.filter(r => (r.city_en ?? r.city.toLowerCase()) === city_en).length,
    })),
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { country } = await params
  const { countryName } = await getCities(country)
  const name = countryName || country
  return {
    title: `${name} Travel Itineraries | Kiravoy`,
    description: `Explore city-by-city travel itineraries for ${name}. Find the perfect trip for couples, families, friends, or solo travel.`,
  }
}

export default async function EnCountryPage({ params }: PageProps) {
  const { country } = await params
  const { countryName, cities } = await getCities(country)

  if (cities.length === 0) notFound()

  return (
    <div className="max-w-[var(--measure-wide)] mx-auto px-6 py-16">
      <div className="mb-12 pb-6 border-b border-[var(--border)]">
        <p className="eyebrow mb-3">
          <Link href="/en/destinations" className="hover:text-[color:var(--ink)] transition-colors">Destinations</Link>
          {' / '}
          <span className="text-[color:var(--ink)]">{countryName}</span>
        </p>
        <h1 className="editorial-heading text-4xl mb-3">
          {countryName} Travel Itineraries
        </h1>
        <p className="text-[color:var(--ink-soft)]">Choose a city to find your perfect itinerary.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
        {cities.map(({ city, city_en, themes, planCount }) => (
          <Link
            key={city_en}
            href={`/en/destinations/${country}/${city_en}`}
            className="group border-t border-[var(--border)] pt-5"
          >
            <h2 className="text-xl text-[color:var(--ink)] mb-2 group-hover:opacity-70 transition-opacity" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
              {city}
            </h2>
            <p className="text-xs text-[color:var(--ink-faint)] mb-2">
              {themes.map(t => THEME_LABELS[t] ?? t).join(' · ')}
            </p>
            <p className="text-xs text-[color:var(--ink-faint)]">{planCount} {planCount === 1 ? 'itinerary' : 'itineraries'}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
