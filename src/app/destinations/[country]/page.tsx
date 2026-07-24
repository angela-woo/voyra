import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { SLUG_TO_COUNTRY_MAP, CITY_SLUG_MAP } from '@/lib/location'

export const revalidate = 3600

interface PageProps {
  params: Promise<{ country: string }>
}

const THEME_LABELS: Record<string, string> = {
  couple: '커플',
  family: '가족',
  friends: '친구',
  solo: '혼자',
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
    <div className="max-w-[var(--measure-wide)] mx-auto px-6 py-16">
      <div className="mb-12 pb-6 border-b border-[var(--border)]">
        <p className="eyebrow mb-3">
          <Link href="/destinations" className="hover:text-[color:var(--ink)] transition-colors">여행 일정</Link>
          {' / '}
          <span className="text-[color:var(--ink)]">{koreanName}</span>
        </p>
        <h1 className="editorial-heading text-4xl mb-3">
          {koreanName} 여행 일정
        </h1>
        <p className="text-[color:var(--ink-soft)]">도시를 선택해서 일정을 확인해보세요.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
        {cities.map(({ city, citySlug, themes, planCount }) => (
          <Link
            key={city}
            href={`/destinations/${country}/${citySlug}`}
            className="group border-t border-[var(--border)] pt-5"
          >
            <h2 className="text-xl text-[color:var(--ink)] mb-2 group-hover:opacity-70 transition-opacity" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
              {city}
            </h2>
            <p className="text-xs text-[color:var(--ink-faint)] mb-2">
              {themes.map(t => THEME_LABELS[t] ?? t).join(' · ')}
            </p>
            <p className="text-xs text-[color:var(--ink-faint)]">{planCount}개 일정</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
