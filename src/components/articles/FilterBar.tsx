'use client'

import { useRouter } from 'next/navigation'
import { SlidersHorizontal } from 'lucide-react'

interface Props {
  countries: string[]
  categories: string[]
  currentSort: string
  currentCountry: string
  currentCategory: string
}

export default function FilterBar({ countries, categories, currentSort, currentCountry, currentCategory }: Props) {
  const router = useRouter()

  const update = (key: string, value: string) => {
    const params = new URLSearchParams()
    const current: Record<string, string> = {
      sort: currentSort,
      country: currentCountry,
      category: currentCategory,
      [key]: value,
    }
    Object.entries(current).forEach(([k, v]) => {
      if (v && v !== 'all') params.set(k, v)
    })
    // sort=newest는 기본값이므로 URL에서 제거
    if (current.sort === 'newest') params.delete('sort')
    router.push(`/articles?${params.toString()}`)
  }

  const selectClass =
    'px-2 py-2 text-sm border-b border-[var(--border)] bg-transparent text-[color:var(--ink-soft)] focus:outline-none focus:border-[color:var(--ink)] transition-colors cursor-pointer'

  return (
    <div className="flex flex-wrap items-center gap-6 mb-10 pb-6 border-b border-[var(--border)]">
      <div className="flex items-center gap-2 text-[13px] tracking-wide text-[color:var(--ink-faint)]">
        <SlidersHorizontal className="w-3.5 h-3.5" />
        필터
      </div>

      {/* 정렬 */}
      <select
        className={selectClass}
        value={currentSort}
        onChange={e => update('sort', e.target.value)}
      >
        <option value="newest">최신순</option>
        <option value="popular">인기순</option>
      </select>

      {/* 나라 */}
      <select
        className={selectClass}
        value={currentCountry}
        onChange={e => update('country', e.target.value)}
      >
        <option value="">전체 나라</option>
        {countries.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {/* 카테고리 */}
      <select
        className={selectClass}
        value={currentCategory}
        onChange={e => update('category', e.target.value)}
      >
        <option value="">전체 카테고리</option>
        {categories.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {/* 필터 초기화 */}
      {(currentCountry || currentCategory || currentSort !== 'newest') && (
        <button
          onClick={() => router.push('/articles')}
          className="link-underline text-xs text-[color:var(--ink-faint)] hover:text-[color:var(--ink)] transition-colors ml-auto"
        >
          초기화
        </button>
      )}
    </div>
  )
}
