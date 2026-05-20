'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

const POPULAR_TAGS = ['도쿄', '파리', '발리', '방콕', '런던']

export default function HeroSearch() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const search = (q: string) => {
    const trimmed = q.trim()
    if (!trimmed) return
    router.push(`/destinations?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Search bar */}
      <div className="flex items-center bg-white rounded-[var(--radius)] shadow-xl overflow-hidden">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search(query)}
          placeholder="도시 또는 나라를 검색하세요"
          className="flex-1 px-5 py-4 text-gray-800 placeholder-gray-400 focus:outline-none text-base"
        />
        <button
          onClick={() => search(query)}
          className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-6 py-4 transition-colors duration-200 flex items-center gap-2 font-medium whitespace-nowrap"
        >
          <Search className="w-4 h-4" />
          검색
        </button>
      </div>

      {/* Popular tags */}
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {POPULAR_TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => search(tag)}
            className="text-sm text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-1.5 rounded-full transition-colors duration-200 border border-white/30"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  )
}
