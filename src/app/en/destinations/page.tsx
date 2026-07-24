import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getCountryFlag } from '@/lib/utils/countryFlags'

export const metadata: Metadata = {
  title: 'Travel Itineraries & Trip Plans | Kiravoy',
  description: 'Find perfect travel itineraries for couples, families, friends and solo travelers. Tokyo 3 days, Paris 5 days and more.',
  keywords: ['travel itinerary', 'trip plan', 'travel planner', 'vacation itinerary'],
  alternates: {
    canonical: 'https://kiravoy.com/en/destinations',
    languages: {
      ko: 'https://kiravoy.com/destinations',
      en: 'https://kiravoy.com/en/destinations',
      'x-default': 'https://kiravoy.com/destinations',
    },
  },
  openGraph: {
    title: 'Travel Itineraries & Trip Plans | Kiravoy',
    description: 'Find perfect travel itineraries for couples, families, friends and solo travelers.',
    url: 'https://kiravoy.com/en/destinations',
    siteName: 'Kiravoy',
    locale: 'en_US',
    type: 'website',
  },
}

export const revalidate = 1800


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
    <div className="max-w-[var(--measure-wide)] mx-auto px-6 py-16">
      <div className="mb-12 pb-6 border-b border-[var(--border)]">
        <p className="eyebrow mb-3">Kiravoy</p>
        <h1 className="editorial-heading text-4xl mb-3">
          Explore Travel Itineraries
        </h1>
        <p className="text-[color:var(--ink-soft)]">Choose a destination to find your perfect travel itinerary.</p>
      </div>

      {countries.length === 0 ? (
        <div className="text-center py-24 text-[color:var(--ink-faint)]">
          <p className="text-lg">No itineraries available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-10">
          {countries.map(({ country, country_en, cities, planCount }) => (
            <Link
              key={country_en}
              href={`/en/destinations/${country_en}`}
              className="group border-t border-[var(--border)] pt-5 text-center"
            >
              <div className="text-3xl mb-3">{getCountryFlag(country_en)}</div>
              <h2 className="text-[color:var(--ink)] mb-1 group-hover:opacity-70 transition-opacity" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>{country}</h2>
              <p className="text-xs text-[color:var(--ink-faint)]">{cities.length} {cities.length === 1 ? 'city' : 'cities'} · {planCount} {planCount === 1 ? 'itinerary' : 'itineraries'}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
