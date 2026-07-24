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

function matches(country: string | null, tab: Tab): boolean {
  if (tab === '전체') return true
  if (!country) return false
  return COUNTRY_GROUPS[tab].some(c => c.toLowerCase() === country.toLowerCase())
}

function ArticleCard({ a }: { a: TabArticle }) {
  const dest = [a.city, a.country].filter(Boolean).join(', ')
  return (
    <Link href={`/article/${a.slug}`} className="group flex flex-col">
      <div className="img-zoom relative h-48 bg-[var(--bg-secondary)] overflow-hidden flex-shrink-0">
        {a.cover_image_url ? (
          <Image
            src={a.cover_image_url}
            alt={a.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <MapPin className="w-7 h-7 text-[color:var(--ink-faint)]" />
          </div>
        )}
      </div>
      <div className="pt-3 flex flex-col flex-1">
        {dest && <p className="eyebrow mb-1.5">{dest}</p>}
        <h3
          className="text-[15px] leading-snug mb-2 line-clamp-2 text-[color:var(--ink)] group-hover:opacity-70 transition-opacity"
          style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}
        >
          {a.title}
        </h3>
        {a.category && (
          <span className="mt-auto text-xs text-[color:var(--ink-faint)]">{a.category}</span>
        )}
      </div>
    </Link>
  )
}

function PlanCard({ p }: { p: TabPlan }) {
  return (
    <Link
      href={toPlanUrl({ country: p.country ?? '', city: p.city ?? '', slug: p.slug })}
      className="group flex flex-col border-t border-[var(--border)] pt-4"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[color:var(--ink-faint)]">{p.city}, {p.country}</span>
        {p.travel_type && (
          <span className="text-xs text-[color:var(--primary)]">
            {TRAVEL_TYPE_LABELS[p.travel_type] ?? p.travel_type}
          </span>
        )}
      </div>
      <h3
        className="text-[15px] leading-snug mb-2 line-clamp-2 text-[color:var(--ink)] group-hover:opacity-70 transition-opacity"
        style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}
      >
        {p.title}
      </h3>
      {p.meta_description && (
        <p className="text-xs text-[color:var(--ink-soft)] line-clamp-2 mb-3 leading-relaxed">{p.meta_description}</p>
      )}
      <div className="mt-auto flex items-center gap-1 text-xs text-[color:var(--ink-faint)]">
        <Clock className="w-3 h-3" />
        <span>{p.days}일 일정</span>
      </div>
    </Link>
  )
}

export default function CountryTabSection({ articles, plans }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('전체')

  const filtArticles = articles.filter(a => matches(a.country, activeTab)).slice(0, 8)
  const filtPlans = plans.filter(p => matches(p.country, activeTab)).slice(0, 4)

  return (
    <section className="max-w-[var(--measure-wide)] mx-auto px-6 py-24">
      <h2 className="editorial-heading text-3xl text-center mb-10">
        나라별 여행 모아보기
      </h2>

      {/* Tabs — underline style, no pill fills */}
      <div className="flex gap-8 mb-14 justify-center flex-wrap border-b border-[var(--border)]">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm tracking-wide transition-colors duration-200 border-b -mb-px ${
              activeTab === tab
                ? 'text-[color:var(--ink)] border-[color:var(--ink)]'
                : 'text-[color:var(--ink-faint)] border-transparent hover:text-[color:var(--ink-soft)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Articles grid */}
      {filtArticles.length > 0 && (
        <div className="mb-14">
          <p className="eyebrow mb-6">여행 가이드</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filtArticles.map(a => <ArticleCard key={a.id} a={a} />)}
          </div>
        </div>
      )}

      {/* Plans grid */}
      {filtPlans.length > 0 && (
        <div>
          <p className="eyebrow mb-6">여행 일정</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filtPlans.map(p => <PlanCard key={p.id} p={p} />)}
          </div>
        </div>
      )}

      {filtArticles.length === 0 && filtPlans.length === 0 && (
        <p className="text-center text-[color:var(--ink-faint)] py-12">해당 지역의 콘텐츠가 준비 중입니다.</p>
      )}
    </section>
  )
}
