'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Clock } from 'lucide-react'
import { toPlanUrl } from '@/lib/location'

interface TabArticle {
  id: string
  slug: string
  title: string
  meta_description: string | null
  city: string | null
  country: string | null
  category: string | null
  cover_image_url?: string | null
}

interface TabPlan {
  id: string
  slug: string
  title: string
  meta_description: string | null
  city: string | null
  country: string | null
  days: number | null
  travel_type: string | null
}

interface Props {
  articles: TabArticle[]
  plans: TabPlan[]
}

const TABS = ['전체', '일본', '유럽', '동남아', '미주'] as const
type Tab = typeof TABS[number]

const COUNTRY_GROUPS: Record<Tab, string[]> = {
  전체: [],
  일본: ['일본', 'Japan'],
  유럽: ['프랑스', '스페인', '영국', '이탈리아', '독일', 'France', 'Spain', 'UK', 'England', 'Italy', 'Germany'],
  동남아: ['태국', '인도네시아', '싱가포르', '베트남', 'Thailand', 'Indonesia', 'Singapore', 'Vietnam'],
  미주: ['미국', '캐나다', '멕시코', '브라질', '아르헨티나', 'United States', 'USA', 'Canada', 'Mexico', 'Brazil'],
}

const TRAVEL_TYPE_LABELS: Record<string, string> = {
  couple: '커플',
  family: '가족',
  friends: '친구',
  solo: '혼자',
}

const CATEGORY_COLORS: Record<string, string> = {
  맛집: 'bg-orange-100 text-orange-700',
  관광: 'bg-orange-50 text-[#FF5722]',
  쇼핑: 'bg-pink-100 text-pink-700',
  숙박: 'bg-purple-100 text-purple-700',
  액티비티: 'bg-green-100 text-green-700',
}

function matches(country: string | null, tab: Tab): boolean {
  if (tab === '전체') return true
  if (!country) return false
  return COUNTRY_GROUPS[tab].some(c => c.toLowerCase() === country.toLowerCase())
}

function ArticleCard({ a }: { a: TabArticle }) {
  const dest = [a.city, a.country].filter(Boolean).join(', ')
  const catColor = CATEGORY_COLORS[a.category ?? ''] ?? 'bg-gray-100 text-gray-600'
  return (
    <Link
      href={`/article/${a.slug}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 hover:-translate-y-1 transition-all duration-200 flex flex-col"
    >
      <div className="relative h-48 bg-gradient-to-br from-orange-50 to-red-100 overflow-hidden flex-shrink-0">
        {a.cover_image_url ? (
          <Image
            src={a.cover_image_url}
            alt={a.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-orange-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {dest && (
          <span className="absolute top-3 left-3 bg-[var(--primary)] text-white text-xs px-2.5 py-1 rounded-full z-10">
            {dest}
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-sm leading-snug mb-2 line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
          {a.title}
        </h3>
        {a.meta_description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">{a.meta_description}</p>
        )}
        {a.category && (
          <span className={`mt-auto self-start text-xs px-2 py-0.5 rounded-full ${catColor}`}>{a.category}</span>
        )}
      </div>
    </Link>
  )
}

function PlanCard({ p }: { p: TabPlan }) {
  return (
    <Link
      href={toPlanUrl({ country: p.country ?? '', city: p.city ?? '', slug: p.slug })}
      className="group bg-white rounded-[var(--radius)] overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200 flex flex-col"
    >
      <div className="h-2 bg-gradient-to-r from-[var(--primary)] to-indigo-400 flex-shrink-0" />
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">{p.city}, {p.country}</span>
          {p.travel_type && (
            <span className="text-xs font-medium text-[var(--primary)]">
              {TRAVEL_TYPE_LABELS[p.travel_type] ?? p.travel_type}
            </span>
          )}
        </div>
        <h3 className="font-semibold text-sm leading-snug mb-2 line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
          {p.title}
        </h3>
        {p.meta_description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">{p.meta_description}</p>
        )}
        <div className="mt-auto flex items-center gap-1 text-xs text-gray-400">
          <Clock className="w-3 h-3" />
          <span>{p.days}일 일정</span>
        </div>
      </div>
    </Link>
  )
}

export default function CountryTabSection({ articles, plans }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('전체')

  const filtArticles = articles.filter(a => matches(a.country, activeTab)).slice(0, 8)
  const filtPlans = plans.filter(p => matches(p.country, activeTab)).slice(0, 4)

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold mb-8 text-center" style={{ fontFamily: 'var(--font-heading)' }}>
        나라별 여행 모아보기
      </h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-10 justify-center flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
              activeTab === tab
                ? 'text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={activeTab === tab ? { backgroundColor: '#FF5722' } : undefined}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Articles grid */}
      {filtArticles.length > 0 && (
        <div className="mb-10">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">여행 가이드</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filtArticles.map(a => <ArticleCard key={a.id} a={a} />)}
          </div>
        </div>
      )}

      {/* Plans grid */}
      {filtPlans.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">여행 일정</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filtPlans.map(p => <PlanCard key={p.id} p={p} />)}
          </div>
        </div>
      )}

      {filtArticles.length === 0 && filtPlans.length === 0 && (
        <p className="text-center text-gray-400 py-12">해당 지역의 콘텐츠가 준비 중입니다.</p>
      )}
    </section>
  )
}
