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
    'px-3 py-2 text-sm border border-gray-200 rounded-[var(--radius)] bg-white text-gray-700 focus:outline-none focus:border-[var(--primary)] hover:border-gray-300 transition-colors cursor-pointer'

  return (
    <div className="flex flex-wrap items-center gap-3 mb-8 p-4 bg-white rounded-[var(--radius)] border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mr-2">
        <SlidersHorizontal className="w-4 h-4" />
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
          className="text-xs text-gray-400 hover:text-[var(--primary)] underline transition-colors ml-auto"
        >
          초기화
        </button>
      )}
    </div>
  )
}
