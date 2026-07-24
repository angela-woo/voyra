import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Clock, Heart, Users, UserCheck, Luggage, Plane } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Metadata } from 'next'

export const revalidate = 3600

interface PageProps {
  params: Promise<{ country: string; city: string }>
}

const TRAVEL_TYPE_LABELS: Record<string, { label: string; icon: LucideIcon }> = {
  couple: { label: 'Couple', icon: Heart },
  family: { label: 'Family', icon: Users },
  friends: { label: 'Friends', icon: UserCheck },
  solo: { label: 'Solo', icon: Luggage },
}

async function getPlans(countrySlug: string, citySlug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('travel_plans')
    .select('id, slug, title, meta_description, days, travel_type, country, city, country_en, city_en')
    .eq('country_en', countrySlug)
    .eq('city_en', citySlug)
    .eq('language', 'en')
    .eq('published', true)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { country, city } = await params
  const plans = await getPlans(country, city)
  const cityName = plans[0]?.city ?? city
  const countryName = plans[0]?.country ?? country
  return {
    title: `${cityName} Travel Itineraries | Kiravoy`,
    description: `${cityName}, ${countryName} travel itineraries for couples, families, friends and solo travelers.`,
  }
}

export default async function EnCityPage({ params }: PageProps) {
  const { country, city } = await params
  const plans = await getPlans(country, city)

  if (plans.length === 0) notFound()

  const cityName = plans[0].city
  const countryName = plans[0].country

  return (
    <div className="max-w-[var(--measure-wide)] mx-auto px-6 py-16">
      <div className="mb-12 pb-6 border-b border-[var(--border)]">
        <p className="eyebrow mb-3">
          <Link href="/en/destinations" className="hover:text-[color:var(--ink)] transition-colors">Destinations</Link>
          {' / '}
          <Link href={`/en/destinations/${country}`} className="hover:text-[color:var(--ink)] transition-colors">{countryName}</Link>
          {' / '}
          <span className="text-[color:var(--ink)]">{cityName}</span>
        </p>
        <h1 className="editorial-heading text-4xl mb-3">
          {cityName} Travel Itineraries
        </h1>
        <p className="text-[color:var(--ink-soft)]">Choose a travel style to find your perfect itinerary.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
        {plans.map(plan => {
          const typeInfo = TRAVEL_TYPE_LABELS[plan.travel_type] ?? { label: plan.travel_type, icon: Plane }
          const TypeIcon = typeInfo.icon
          return (
            <Link
              key={plan.id}
              href={`/en/destinations/${country}/${city}/${plan.slug}`}
              className="group border-t border-[var(--border)] pt-5"
            >
              <div className="flex items-center gap-1.5 mb-2 text-xs text-[color:var(--primary)]">
                <TypeIcon className="w-3.5 h-3.5" />
                <span>{typeInfo.label} Trip</span>
              </div>
              <h2 className="text-[color:var(--ink)] mb-2 line-clamp-2 group-hover:opacity-70 transition-opacity" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
                {plan.title}
              </h2>
              {plan.meta_description && (
                <p className="text-xs text-[color:var(--ink-soft)] line-clamp-2 mb-3 leading-relaxed">{plan.meta_description}</p>
              )}
              <div className="flex items-center gap-1 text-xs text-[color:var(--ink-faint)]">
                <Clock className="w-3 h-3" />
                <span>{plan.days}-day itinerary</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
