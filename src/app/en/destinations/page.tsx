import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getCountryFlag } from '@/lib/utils/countryFlags'

export const metadata: Metadata = {
  title: 'Travel Itineraries by Destination | Kiravoy',
  description: 'Browse curated travel itineraries for couples, families, friends, and solo travelers around the world.',
  alternates: { canonical: 'https://kiravoy.com/en/destinations' },
}

export const dynamic = 'force-dynamic'


interface CountryGroup {
  country: string
  country_en: string
  cities: string[]
  planCount: number
}

async function getCountries(): Promise<CountryGroup[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('travel_plans')
    .select('country, country_en, city')
    .eq('language', 'en')
    .eq('published', true)

  if (!data) return []

  const map = new Map<string, { country: string; country_en: string; cities: Set<string> }>()
  for (const row of data) {
    const key = row.country_en ?? row.country.toLowerCase()
    if (!map.has(key)) map.set(key, { country: row.country, country_en: key, cities: new Set() })
    map.get(key)!.cities.add(row.city)
  }

  return Array.from(map.values()).map(({ country, country_en, cities }) => ({
    country,
    country_en,
    cities: Array.from(cities),
    planCount: data.filter(r => (r.country_en ?? r.country.toLowerCase()) === country_en).length,
  }))
}

export default async function EnDestinationsPage() {
  const countries = await getCountries()

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          Explore Travel Itineraries
        </h1>
        <p className="text-gray-500">Choose a destination to find your perfect travel itinerary.</p>
      </div>

      {countries.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-lg">No itineraries available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {countries.map(({ country, country_en, cities, planCount }) => (
            <Link
              key={country_en}
              href={`/en/destinations/${country_en}`}
              className="group bg-white rounded-[var(--radius)] border border-gray-100 shadow-sm p-6 hover:border-[var(--primary)] hover:shadow-md transition-all text-center"
            >
              <div className="text-5xl mb-3">{getCountryFlag(country_en)}</div>
              <h2 className="font-bold text-gray-800 mb-1">{country}</h2>
              <p className="text-xs text-gray-400">{cities.length} {cities.length === 1 ? 'city' : 'cities'} · {planCount} {planCount === 1 ? 'itinerary' : 'itineraries'}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
