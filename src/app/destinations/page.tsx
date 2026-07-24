import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'
import { toCountryUrl } from '@/lib/location'
import { getCountryFlag } from '@/lib/utils/countryFlags'

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient()
  const { count } = await supabase
    .from('travel_plans')
    .select('id', { count: 'exact', head: true })
    .eq('published', true)

  const total = count ?? 0
  const description = `커플, 가족, 친구, 혼자 여행 맞춤 일정${total > 0 ? ` ${total}개` : ''}. 도쿄 3일, 파리 5일 등 검증된 여행 코스 추천.`

  return {
    title: '여행 일정 추천 | Kiravoy',
    description,
    keywords: ['여행일정', '여행코스', '해외여행일정', '도쿄일정', '파리일정', '여행추천'],
    alternates: {
      canonical: 'https://kiravoy.com/destinations',
      languages: {
        ko: 'https://kiravoy.com/destinations',
        en: 'https://kiravoy.com/en/destinations',
        'x-default': 'https://kiravoy.com/destinations',
      },
    },
    openGraph: {
      title: '여행 일정 추천 | Kiravoy',
      description,
      url: 'https://kiravoy.com/destinations',
      siteName: 'Kiravoy',
      locale: 'ko_KR',
      type: 'website',
      images: [{
        url: `https://kiravoy.com/og?title=${encodeURIComponent('여행 일정 추천')}&description=${encodeURIComponent('커플·가족·친구·혼자 맞춤 여행 코스')}&type=destination`,
        width: 1200,
        height: 630,
        alt: '여행 일정 추천',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: '여행 일정 추천 | Kiravoy',
      description,
      images: [`https://kiravoy.com/og?title=${encodeURIComponent('여행 일정 추천')}&description=${encodeURIComponent('커플·가족·친구·혼자 맞춤 여행 코스')}&type=destination`],
    },
  }
}

export const revalidate = 1800


interface CountryGroup {
  country: string
  cities: string[]
  planCount: number
}

async function getCountries(): Promise<CountryGroup[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('travel_plans')
    .select('country, city')
    .eq('published', true)
    .eq('language', 'ko')

  if (!data) return []

  const map = new Map<string, Set<string>>()
  for (const row of data) {
    if (!map.has(row.country)) map.set(row.country, new Set())
    map.get(row.country)!.add(row.city)
  }

  return Array.from(map.entries()).map(([country, cities]) => ({
    country,
    cities: Array.from(cities),
    planCount: data.filter(r => r.country === country).length,
  }))
}

export default async function DestinationsPage() {
  const countries = await getCountries()

  return (
    <div className="max-w-[var(--measure-wide)] mx-auto px-6 py-16">
      <div className="mb-12 pb-6 border-b border-[var(--border)]">
        <p className="eyebrow mb-3">Kiravoy</p>
        <h1 className="editorial-heading text-4xl mb-3">
          여행 일정 탐색
        </h1>
        <p className="text-[color:var(--ink-soft)]">나라를 선택해서 맞춤 여행 일정을 확인해보세요.</p>
      </div>

      {countries.length === 0 ? (
        <div className="text-center py-24 text-[color:var(--ink-faint)]">
          <p className="text-lg">아직 등록된 여행 일정이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-10">
          {countries.map(({ country, cities, planCount }) => (
            <Link
              key={country}
              href={toCountryUrl(country)}
              className="group border-t border-[var(--border)] pt-5 text-center"
            >
              <div className="text-3xl mb-3">{getCountryFlag(country)}</div>
              <h2 className="text-[color:var(--ink)] mb-1 group-hover:opacity-70 transition-opacity" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>{country}</h2>
              <p className="text-xs text-[color:var(--ink-faint)]">{cities.length}개 도시 · {planCount}개 일정</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
