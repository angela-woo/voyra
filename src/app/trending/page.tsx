import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { toPlanUrl } from '@/lib/location'
import { TrendingUp, MapPin, Clock, Eye } from 'lucide-react'
import ArticleCard from '@/components/article/ArticleCard'

export const revalidate = 1800

const BASE_URL = 'https://kiravoy.com'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '트렌딩 — 인기 여행 콘텐츠',
    description: '지금 가장 많이 읽히는 여행 가이드와 인기 여행 일정을 확인하세요.',
    openGraph: {
      title: '트렌딩 — 인기 여행 콘텐츠 | Kiravoy',
      description: '지금 가장 많이 읽히는 여행 가이드와 인기 여행 일정을 확인하세요.',
      url: `${BASE_URL}/trending`,
      siteName: 'Kiravoy',
      locale: 'ko_KR',
      type: 'website',
    },
    alternates: {
      canonical: `${BASE_URL}/trending`,
    },
  }
}

const TRAVEL_TYPE_ICONS: Record<string, string> = {
  '커플': '💑',
  '가족': '👨‍👩‍👧‍👦',
  '친구': '👫',
  '혼자': '🧳',
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

type ArticleRow = {
  id: string
  slug: string
  title: string
  meta_description: string | null
  city: string | null
  country: string | null
  category: string | null
  created_at: string | null
  cover_image_url: string | null
  cover_image_attribution: string | null
}

export default async function TrendingPage() {
  const supabase = await createClient()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [{ data: topPlans }, { data: recentArticles }] = await Promise.all([
    supabase
      .from('travel_plans')
      .select('id, slug, title, meta_description, city, country, created_at, cover_image_url, days, travel_type, views_count')
      .eq('published', true)
      .order('views_count', { ascending: false })
      .limit(10),
    supabase
      .from('articles')
      .select('id, slug, title, meta_description, city, country, category, created_at, cover_image_url, cover_image_attribution')
      .eq('published', true)
      .eq('language', 'ko')
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-10 flex items-center gap-3">
        <TrendingUp className="w-8 h-8" style={{ color: '#FF5722' }} />
        <div>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
            트렌딩
          </h1>
          <p className="mt-1 text-gray-500 text-sm">지금 가장 인기 있는 여행 콘텐츠</p>
        </div>
      </div>

      {/* Top plans by views */}
      {(topPlans?.length ?? 0) > 0 && (
        <section className="mb-14">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full inline-block" style={{ backgroundColor: '#FF5722' }} />
            인기 여행 일정 TOP 10
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(topPlans as PlanRow[]).map((plan, idx) => {
              const planUrl = toPlanUrl({ country: plan.country, city: plan.city, slug: plan.slug })
              const nights = plan.days ? plan.days - 1 : null
              const location = [plan.city, plan.country].filter(Boolean).join(', ')

              return (
                <Link
                  key={plan.slug}
                  href={planUrl}
                  className="group block bg-white rounded-[var(--radius)] overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="h-44 bg-gradient-to-br from-orange-400 to-red-500 relative overflow-hidden">
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
                    {/* Rank badge */}
                    <span className="absolute top-3 left-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold z-10 text-white"
                      style={{ backgroundColor: idx < 3 ? '#FF5722' : 'rgba(0,0,0,0.5)' }}>
                      {idx + 1}
                    </span>
                    {/* Location */}
                    {location && (
                      <span className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full z-10">
                        {location}
                      </span>
                    )}
                    {/* Days */}
                    {nights !== null && (
                      <span className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full z-10 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {nights}박{plan.days}일
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-sm leading-snug mb-2 line-clamp-2 group-hover:text-[var(--primary)] transition-colors" style={{ fontFamily: 'var(--font-heading)' }}>
                      {plan.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      {plan.travel_type && (
                        <span>
                          {TRAVEL_TYPE_ICONS[plan.travel_type] ?? ''} {plan.travel_type}
                        </span>
                      )}
                      {plan.views_count != null && plan.views_count > 0 && (
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {plan.views_count.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Recent articles (last 7 days) */}
      {(recentArticles?.length ?? 0) > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full inline-block" style={{ backgroundColor: '#FF5722' }} />
            이번 주 새 여행 가이드
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(recentArticles as ArticleRow[]).map((article) => (
              <ArticleCard key={article.slug} article={article} locale="ko" />
            ))}
          </div>
        </section>
      )}

      {(topPlans?.length ?? 0) === 0 && (recentArticles?.length ?? 0) === 0 && (
        <p className="text-gray-400 text-center py-20">아직 트렌딩 콘텐츠가 없습니다.</p>
      )}
    </div>
  )
}
