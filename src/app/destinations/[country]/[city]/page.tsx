import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Clock } from 'lucide-react'
import type { Metadata } from 'next'
import { SLUG_TO_COUNTRY_MAP, SLUG_TO_CITY_MAP } from '@/lib/location'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ country: string; city: string }>
}

const TRAVEL_TYPE_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  couple: { label: '커플', emoji: '💑', color: 'bg-pink-50 border-pink-200 text-pink-700' },
  family: { label: '가족', emoji: '👨‍👩‍👧‍👦', color: 'bg-green-50 border-green-200 text-green-700' },
  friends: { label: '친구', emoji: '👫', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  solo: { label: '혼자', emoji: '🧳', color: 'bg-purple-50 border-purple-200 text-purple-700' },
}

async function getPlans(countrySlug: string, citySlug: string) {
  const koreanCountry = SLUG_TO_COUNTRY_MAP[countrySlug] ?? decodeURIComponent(countrySlug)
  const koreanCity = SLUG_TO_CITY_MAP[citySlug] ?? decodeURIComponent(citySlug)
  const supabase = await createClient()
  const { data } = await supabase
    .from('travel_plans')
    .select('id, slug, title, meta_description, days, travel_type, theme, country, city')
    .eq('country', koreanCountry)
    .eq('city', koreanCity)
    .eq('published', true)
    .eq('language', 'ko')
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { country, city } = await params
  const koreanCountry = SLUG_TO_COUNTRY_MAP[country] ?? decodeURIComponent(country)
  const koreanCity = SLUG_TO_CITY_MAP[city] ?? decodeURIComponent(city)
  return {
    title: `${koreanCity} 여행 일정 | Kiravoy`,
    description: `${koreanCity}(${koreanCountry}) 맞춤 여행 일정 - 커플, 가족, 친구, 혼자 여행까지.`,
  }
}

export default async function CityPage({ params }: PageProps) {
  const { country, city } = await params
  const plans = await getPlans(country, city)

  if (plans.length === 0) notFound()

  const koreanCountry = plans[0].country
  const koreanCity = plans[0].city

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-2 text-sm text-gray-400">
        <Link href="/destinations" className="hover:text-[var(--primary)]">여행 일정</Link>
        {' › '}
        <Link href={`/destinations/${country}`} className="hover:text-[var(--primary)]">{koreanCountry}</Link>
        {' › '}
        <span>{koreanCity}</span>
      </div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          {koreanCity} 여행 일정
        </h1>
        <p className="text-gray-500">여행 스타일에 맞는 일정을 선택해보세요.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map(plan => {
          const typeInfo = TRAVEL_TYPE_LABELS[plan.travel_type] ?? { label: plan.travel_type, emoji: '✈️', color: 'bg-gray-50 border-gray-200 text-gray-700' }
          return (
            <Link
              key={plan.id}
              href={`/destinations/${country}/${city}/${plan.slug}`}
              className="group bg-white rounded-[var(--radius)] border border-gray-100 shadow-sm hover:border-[var(--primary)] hover:shadow-md transition-all overflow-hidden"
            >
              <div className={`px-4 py-3 border-b flex items-center gap-2 ${typeInfo.color}`}>
                <span className="text-xl">{typeInfo.emoji}</span>
                <span className="font-semibold text-sm">{typeInfo.label} 여행</span>
              </div>
              <div className="p-5">
                <h2 className="font-bold text-gray-800 mb-2 group-hover:text-[var(--primary)] transition-colors line-clamp-2">
                  {plan.title}
                </h2>
                {plan.meta_description && (
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{plan.meta_description}</p>
                )}
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{plan.days}일 일정</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
