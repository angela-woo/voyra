import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '여행 일정 | Voyra',
  description: '세계 각국의 맞춤 여행 일정을 탐색해보세요. 커플, 가족, 친구, 혼자 여행까지.',
}

export const dynamic = 'force-dynamic'

const COUNTRY_FLAGS: Record<string, string> = {
  '일본': '🇯🇵',
  '프랑스': '🇫🇷',
  '스페인': '🇪🇸',
  '태국': '🇹🇭',
  '인도네시아': '🇮🇩',
  '싱가포르': '🇸🇬',
  '영국': '🇬🇧',
  '이탈리아': '🇮🇹',
  '독일': '🇩🇪',
  '미국': '🇺🇸',
  '호주': '🇦🇺',
  '베트남': '🇻🇳',
  '대만': '🇹🇼',
  '홍콩': '🇭🇰',
  '포르투갈': '🇵🇹',
  '네덜란드': '🇳🇱',
  '체코': '🇨🇿',
  '오스트리아': '🇦🇹',
  '스위스': '🇨🇭',
  '덴마크': '🇩🇰',
  '핀란드': '🇫🇮',
}

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
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          여행 일정 탐색
        </h1>
        <p className="text-gray-500">나라를 선택해서 맞춤 여행 일정을 확인해보세요.</p>
      </div>

      {countries.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-lg">아직 등록된 여행 일정이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {countries.map(({ country, cities, planCount }) => (
            <Link
              key={country}
              href={`/destinations/${encodeURIComponent(country)}`}
              className="group bg-white rounded-[var(--radius)] border border-gray-100 shadow-sm p-6 hover:border-[var(--primary)] hover:shadow-md transition-all text-center"
            >
              <div className="text-5xl mb-3">{COUNTRY_FLAGS[country] ?? '🌍'}</div>
              <h2 className="font-bold text-gray-800 mb-1">{country}</h2>
              <p className="text-xs text-gray-400">{cities.length}개 도시 · {planCount}개 일정</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
