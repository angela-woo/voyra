import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { toPlanUrl } from '@/lib/location'
import { MapPin, Clock, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

const BASE_URL = 'https://kiravoy.com'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '최신 여행 일정',
    description: '커플, 가족, 친구, 혼자 여행까지 다양한 테마의 최신 여행 일정을 찾아보세요. 2박3일부터 장기 여행까지 완벽한 여행 플랜을 제공합니다.',
    openGraph: {
      title: '최신 여행 일정 | Kiravoy',
      description: '커플, 가족, 친구, 혼자 여행까지 다양한 테마의 최신 여행 일정을 찾아보세요.',
      url: `${BASE_URL}/latest-itineraries`,
      siteName: 'Kiravoy',
      locale: 'ko_KR',
      type: 'website',
    },
    alternates: {
      canonical: `${BASE_URL}/latest-itineraries`,
    },
  }
}

const TRAVEL_TYPES = [
  { value: '', label: '전체' },
  { value: '커플', label: '커플' },
  { value: '가족', label: '가족' },
  { value: '친구', label: '친구' },
  { value: '혼자', label: '혼자' },
]

const DAY_FILTERS = [
  { value: '', label: '전체' },
  { value: '2', label: '2박3일' },
  { value: '3', label: '3박4일' },
  { value: '4+', label: '4박5일+' },
]

const TRAVEL_TYPE_ICONS: Record<string, string> = {
  '커플': '💑',
  '가족': '👨‍👩‍👧‍👦',
  '친구': '👫',
  '혼자': '🧳',
}

interface PageProps {
  searchParams: Promise<{ type?: string; days?: string }>
}

type PlanRow = {
  id: string
  slug: string
  title: string
  meta_description: string | null
  city: string
  country: string
  created_at: string | null
  cover_image_url: string | null
  days: number | null
  travel_type: string | null
  views_count: number | null
}

export default async function LatestItinerariesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const selectedType = params.type ?? ''
  const selectedDays = params.days ?? ''

  const supabase = await createClient()

  let query = supabase
    .from('travel_plans')
    .select('id, slug, title, meta_description, city, country, created_at, cover_image_url, days, travel_type, views_count')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(60)

  if (selectedType) {
    query = query.eq('travel_type', selectedType)
  }

  if (selectedDays === '4+') {
    query = query.gte('days', 5)
  } else if (selectedDays) {
    const nights = parseInt(selectedDays, 10)
    query = query.eq('days', nights + 1)
  }

  const { data: plans } = await query

  function buildUrl(type: string, days: string): string {
    const p = new URLSearchParams()
    if (type) p.set('type', type)
    if (days) p.set('days', days)
    const qs = p.toString()
    return `/latest-itineraries${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
          최신 여행 일정
        </h1>
        <p className="mt-2 text-gray-500 text-sm">
          나에게 맞는 여행 스타일로 완벽한 일정을 찾아보세요
          {plans?.length ? ` · ${plans.length}개 이상의 일정` : ''}
        </p>
      </div>

      {/* Travel type tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {TRAVEL_TYPES.map((t) => {
          const isActive = selectedType === t.value
          return (
            <Link
              key={t.value}
              href={buildUrl(t.value, selectedDays)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
              style={
                isActive
                  ? { backgroundColor: '#FF5722', color: 'white' }
                  : { backgroundColor: '#f3f4f6', color: '#4b5563' }
              }
            >
              {t.value ? `${TRAVEL_TYPE_ICONS[t.value] ?? ''} ${t.label}` : t.label}
            </Link>
          )
        })}
      </div>

      {/* Day filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {DAY_FILTERS.map((d) => {
          const isActive = selectedDays === d.value
          return (
            <Link
              key={d.value}
              href={buildUrl(selectedType, d.value)}
              className="px-3 py-1.5 rounded-lg text-sm transition-colors border"
              style={
                isActive
                  ? { borderColor: '#FF5722', color: '#FF5722', backgroundColor: '#fff5f2' }
                  : { borderColor: '#e5e7eb', color: '#6b7280', backgroundColor: 'white' }
              }
            >
              {d.label}
            </Link>
          )
        })}
      </div>

      {/* Plans grid */}
      {!plans?.length ? (
        <p className="text-gray-400 text-center py-20">해당 조건의 여행 일정이 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(plans as PlanRow[]).map((plan) => {
            const planUrl = toPlanUrl({ country: plan.country, city: plan.city, slug: plan.slug })
            const nights = plan.days ? plan.days - 1 : null
            const location = [plan.city, plan.country].filter(Boolean).join(', ')

            return (
              <Link
                key={plan.slug}
                href={planUrl}
                className="group block bg-white rounded-[var(--radius)] overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                {/* Cover image */}
                <div className="h-48 bg-gradient-to-br from-orange-400 to-red-500 relative overflow-hidden">
                  {plan.cover_image_url ? (
                    <>
                      <Image
                        src={plan.cover_image_url}
                        alt={`${plan.city} ${plan.title}`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <MapPin className="w-10 h-10 text-white/60" />
                    </div>
                  )}
                  {/* Location badge */}
                  {location && (
                    <span className="absolute top-3 left-3 bg-[var(--primary)] text-white text-xs px-2 py-1 rounded-full z-10">
                      {location}
                    </span>
                  )}
                  {/* Days badge */}
                  {nights !== null && (
                    <span className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full z-10 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {nights}박{plan.days}일
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-base leading-snug mb-2 line-clamp-2 group-hover:text-[var(--primary)] transition-colors" style={{ fontFamily: 'var(--font-heading)' }}>
                    {plan.title}
                  </h3>
                  {plan.meta_description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{plan.meta_description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {plan.travel_type && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {TRAVEL_TYPE_ICONS[plan.travel_type] ?? ''} {plan.travel_type}
                      </span>
                    )}
                    {plan.views_count != null && plan.views_count > 0 && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        조회 {plan.views_count.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
