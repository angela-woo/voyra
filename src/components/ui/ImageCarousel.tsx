'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { UnsplashPhoto } from '@/lib/unsplash'

interface Props {
  images: UnsplashPhoto[]
  height?: number
}

export default function ImageCarousel({ images, height = 250 }: Props) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const next = useCallback(() => setCurrent(c => (c + 1) % images.length), [images.length])
  const prev = useCallback(() => setCurrent(c => (c - 1 + images.length) % images.length), [images.length])

  useEffect(() => {
    if (paused || images.length <= 1) return
    const t = setInterval(next, 4000)
    return () => clearInterval(t)
  }, [paused, next, images.length])

  if (!images.length) return null

  const photo = images[current]

  return (
    <div className="not-prose my-4">
      {/* 슬라이드 영역 */}
      <div
        className="relative rounded-[var(--radius)] overflow-hidden group"
        style={{ height }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={e => { touchStartX.current = e.touches[0].clientX }}
        onTouchEnd={e => {
          if (touchStartX.current === null) return
          const diff = touchStartX.current - e.changedTouches[0].clientX
          if (Math.abs(diff) > 50) diff > 0 ? next() : prev()
          touchStartX.current = null
        }}
      >
        <Image
          src={photo.url}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 700px"
        />

        {/* 하단 그라데이션 (dot 가독성) */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

        {/* 좌우 화살표 */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-4 h-4 text-gray-700" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-4 h-4 text-gray-700" />
            </button>
          </>
        )}

        {/* Dot 인디케이터 */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all pointer-events-auto ${
                  i === current ? 'bg-white scale-125' : 'bg-white/55'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Unsplash 크레딧 */}
      <p className="text-xs text-gray-400 mt-1.5 text-right">
        Photo by{' '}
        <a
          href={photo.authorUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600"
        >
          {photo.authorName}
        </a>{' '}
        on Unsplash
      </p>
    </div>
  )
}
