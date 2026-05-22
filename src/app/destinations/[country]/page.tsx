import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { SLUG_TO_COUNTRY_MAP, CITY_SLUG_MAP } from '@/lib/location'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ country: string }>
}

const THEME_LABELS: Record<string, string> = {
  couple: '커플',
  family: '가족',
  friends: '친구',
  solo: '혼자',
}

const THEME_COLORS: Record<string, string> = {
  couple: 'bg-pink-100 text-pink-700',
  family: 'bg-green-100 text-green-700',
  friends: 'bg-blue-100 text-blue-700',
  solo: 'bg-purple-100 text-purple-700',
}

interface CityGroup {
  city: string
  citySlug: string
  themes: string[]
  planCount: number
}

async function getCities(countrySlug: string): Promise<{ koreanName: string; cities: CityGroup[] }> {
  const koreanCountry = SLUG_TO_COUNTRY_MAP[countrySlug] ?? decodeURIComponent(countrySlug)
  const supabase = await createClient()
  const { data } = await supabase
    .from('travel_plans')
    .select('city, travel_type')
    .eq('country', koreanCountry)
    .eq('published', true)
    .eq('language', 'ko')

  if (!data || data.length === 0) return { koreanName: koreanCountry, cities: [] }

  const map = new Map<string, Set<string>>()
  for (const row of data) {
    if (!map.has(row.city)) map.set(row.city, new Set())
    map.get(row.city)!.add(row.travel_type)
  }

  return {
    koreanName: koreanCountry,
    cities: Array.from(map.entries()).map(([city, themes]) => ({
      city,
      citySlug: CITY_SLUG_MAP[city] ?? encodeURIComponent(city),
      themes: Array.from(themes),
      planCount: data.filter(r => r.city === city).length,
    })),
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { country } = await params
  const { koreanName } = await getCities(country)
  return {
    title: `${koreanName} 여행 일정 | Kiravoy`,
    description: `${koreanName}의 도시별 맞춤 여행 일정을 확인해보세요.`,
  }
}

export default async function CountryPage({ params }: PageProps) {
  const { country } = await params
  const { koreanName, cities } = await getCities(country)

  if (cities.length === 0) notFound()

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-2 text-sm text-gray-400">
        <Link href="/destinations" className="hover:text-[var(--primary)]">여행 일정</Link>
        {' › '}
        <span>{koreanName}</span>
      </div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          {koreanName} 여행 일정
        </h1>
        <p className="text-gray-500">도시를 선택해서 일정을 확인해보세요.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cities.map(({ city, citySlug, themes, planCount }) => (
          <Link
            key={city}
            href={`/destinations/${country}/${citySlug}`}
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
            <p className="text-xs text-gray-400">{planCount}개 일정</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
