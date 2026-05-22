import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Clock } from 'lucide-react'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ country: string; city: string }>
}

const TRAVEL_TYPE_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  couple: { label: 'Couple', emoji: '💑', color: 'bg-pink-50 border-pink-200 text-pink-700' },
  family: { label: 'Family', emoji: '👨‍👩‍👧‍👦', color: 'bg-green-50 border-green-200 text-green-700' },
  friends: { label: 'Friends', emoji: '👫', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  solo: { label: 'Solo', emoji: '🧳', color: 'bg-purple-50 border-purple-200 text-purple-700' },
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
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-2 text-sm text-gray-400">
        <Link href="/en/destinations" className="hover:text-[var(--primary)]">Destinations</Link>
        {' › '}
        <Link href={`/en/destinations/${country}`} className="hover:text-[var(--primary)]">{countryName}</Link>
        {' › '}
        <span>{cityName}</span>
      </div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          {cityName} Travel Itineraries
        </h1>
        <p className="text-gray-500">Choose a travel style to find your perfect itinerary.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map(plan => {
          const typeInfo = TRAVEL_TYPE_LABELS[plan.travel_type] ?? { label: plan.travel_type, emoji: '✈️', color: 'bg-gray-50 border-gray-200 text-gray-700' }
          return (
            <Link
              key={plan.id}
              href={`/en/destinations/${country}/${city}/${plan.slug}`}
              className="group bg-white rounded-[var(--radius)] border border-gray-100 shadow-sm hover:border-[var(--primary)] hover:shadow-md transition-all overflow-hidden"
            >
              <div className={`px-4 py-3 border-b flex items-center gap-2 ${typeInfo.color}`}>
                <span className="text-xl">{typeInfo.emoji}</span>
                <span className="font-semibold text-sm">{typeInfo.label} Trip</span>
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
                  <span>{plan.days}-day itinerary</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
