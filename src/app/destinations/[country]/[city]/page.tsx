import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Clock, Heart, Users, UserCheck, Luggage, Plane } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Metadata } from 'next'
import { SLUG_TO_COUNTRY_MAP, SLUG_TO_CITY_MAP } from '@/lib/location'

export const revalidate = 3600

interface PageProps {
  params: Promise<{ country: string; city: string }>
}

const TRAVEL_TYPE_LABELS: Record<string, { label: string; icon: LucideIcon }> = {
  couple: { label: '커플', icon: Heart },
  family: { label: '가족', icon: Users },
  friends: { label: '친구', icon: UserCheck },
  solo: { label: '혼자', icon: Luggage },
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
    <div className="max-w-[var(--measure-wide)] mx-auto px-6 py-16">
      <div className="mb-12 pb-6 border-b border-[var(--border)]">
        <p className="eyebrow mb-3">
          <Link href="/destinations" className="hover:text-[color:var(--ink)] transition-colors">여행 일정</Link>
          {' / '}
          <Link href={`/destinations/${country}`} className="hover:text-[color:var(--ink)] transition-colors">{koreanCountry}</Link>
          {' / '}
          <span className="text-[color:var(--ink)]">{koreanCity}</span>
        </p>
        <h1 className="editorial-heading text-4xl mb-3">
          {koreanCity} 여행 일정
        </h1>
        <p className="text-[color:var(--ink-soft)]">여행 스타일에 맞는 일정을 선택해보세요.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
        {plans.map(plan => {
          const typeInfo = TRAVEL_TYPE_LABELS[plan.travel_type] ?? { label: plan.travel_type, icon: Plane }
          const TypeIcon = typeInfo.icon
          return (
            <Link
              key={plan.id}
              href={`/destinations/${country}/${city}/${plan.slug}`}
              className="group border-t border-[var(--border)] pt-5"
            >
              <div className="flex items-center gap-1.5 mb-2 text-xs text-[color:var(--primary)]">
                <TypeIcon className="w-3.5 h-3.5" />
                <span>{typeInfo.label} 여행</span>
              </div>
              <h2 className="text-[color:var(--ink)] mb-2 line-clamp-2 group-hover:opacity-70 transition-opacity" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
                {plan.title}
              </h2>
              {plan.meta_description && (
                <p className="text-xs text-[color:var(--ink-soft)] line-clamp-2 mb-3 leading-relaxed">{plan.meta_description}</p>
              )}
              <div className="flex items-center gap-1 text-xs text-[color:var(--ink-faint)]">
                <Clock className="w-3 h-3" />
                <span>{plan.days}일 일정</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
