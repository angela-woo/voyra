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
    <div className="w-full max-w-lg mx-auto">
      {/* Search bar — underline only, no fill/shadow */}
      <div className="flex items-center gap-3 border-b border-white/40 focus-within:border-white/90 transition-colors">
        <Search className="w-4 h-4 text-white/70 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search(query)}
          placeholder="도시 또는 나라를 검색하세요"
          className="flex-1 bg-transparent py-3 text-white placeholder-white/60 focus:outline-none text-[15px] tracking-wide"
        />
        <button
          onClick={() => search(query)}
          className="text-[13px] tracking-[0.08em] uppercase text-white/80 hover:text-white transition-colors shrink-0"
        >
          검색
        </button>
      </div>

      {/* Popular tags */}
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-6 text-[13px] tracking-wide">
        {POPULAR_TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => search(tag)}
            className="text-white/65 hover:text-white transition-colors"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  )
}
