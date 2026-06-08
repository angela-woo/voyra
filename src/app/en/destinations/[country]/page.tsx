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

const THEME_COLORS: Record<string, string> = {
  couple: 'bg-pink-100 text-pink-700',
  family: 'bg-green-100 text-green-700',
  friends: 'bg-blue-100 text-blue-700',
  solo: 'bg-purple-100 text-purple-700',
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
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-2 text-sm text-gray-400">
        <Link href="/en/destinations" className="hover:text-[var(--primary)]">Destinations</Link>
        {' › '}
        <span>{countryName}</span>
      </div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          {countryName} Travel Itineraries
        </h1>
        <p className="text-gray-500">Choose a city to find your perfect itinerary.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cities.map(({ city, city_en, themes, planCount }) => (
          <Link
            key={city_en}
            href={`/en/destinations/${country}/${city_en}`}
            className="group bg-white rounded-[var(--radius)] border border-gray-100 shadow-sm p-6 hover:border-[var(--primary)] hover:shadow-md transition-all"
          >
            <h2 className="font-bold text-xl text-gray-800 mb-3 group-hover:text-[var(--primary)] transition-colors">
              {city}
            </h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {themes.map(theme => (
                <span
                  key={theme}
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${THEME_COLORS[theme] ?? 'bg-gray-100 text-gray-600'}`}
                >
                  {THEME_LABELS[theme] ?? theme}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-400">{planCount} {planCount === 1 ? 'itinerary' : 'itineraries'}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
