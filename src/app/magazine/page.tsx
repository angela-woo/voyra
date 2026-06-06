import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { BookMarked, ArrowRight, Calendar, MapPin } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '여행 매거진 | Voyra',
  description: '한국인 여행자를 위한 심층 여행 매거진. 인기 여행지의 지역별 가이드, 맛집, 쇼핑, 일정까지 한눈에.',
  openGraph: {
    title: '여행 매거진 | Voyra',
    description: '한국인 여행자를 위한 심층 여행 매거진',
    url: 'https://voyra.co/magazine',
  },
  alternates: {
    canonical: 'https://voyra.co/magazine',
  },
}

const magazines = [
  {
    href: '/magazine/tokyo-2026',
    title: '2026 도쿄 여행 완벽 가이드',
    subtitle: '인기 지역 TOP 10, 한국인 맛집, 쇼핑 리스트 TOP 30, 4박5일 일정',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    tag: '일본',
    date: '2026년 1월',
    readTime: '15분',
    featured: true,
  },
]

export default function MagazinePage() {
  return (
    <div style={{ backgroundColor: '#FAFAF8' }} className="min-h-screen">
      {/* Hero */}
      <section
        className="relative flex items-center justify-center py-24 px-4 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #E8B86D 100%)' }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.05) 40px, rgba(255,255,255,0.05) 80px)',
          }}
        />
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ backgroundColor: 'rgba(232,184,109,0.2)', border: '1px solid #E8B86D' }}>
            <BookMarked className="w-4 h-4" style={{ color: '#E8B86D' }} />
            <span className="text-sm font-medium" style={{ color: '#E8B86D' }}>Kiravoy Magazine</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            여행 매거진
          </h1>
          <p className="text-lg text-white/80 leading-relaxed max-w-xl mx-auto">
            한국인 여행자를 위한 심층 여행 콘텐츠.<br />
            지역별 완벽 가이드부터 트렌드까지.
          </p>
        </div>
      </section>

      {/* Magazine list */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-center gap-3 mb-10">
          <h2 className="text-2xl font-bold text-gray-900">최신 매거진</h2>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Featured — full width hero card */}
        {magazines.filter((m) => m.featured).map((mag) => (
          <Link
            key={mag.href}
            href={mag.href}
            className="group block mb-8 relative overflow-hidden"
            style={{ borderRadius: '4px' }}
          >
            <div className="relative h-[52vh] min-h-[320px] overflow-hidden">
              <Image
                src={mag.image}
                alt={mag.title}
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="100vw"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(26,26,46,0.85) 0%, rgba(26,26,46,0.4) 60%, transparent 100%)' }} />
              <div className="absolute inset-0 flex flex-col justify-center px-10 md:px-16 max-w-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <span style={{ backgroundColor: '#C9A96E', color: '#1A1A2E', fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', padding: '3px 10px' }}>
                    FEATURED
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', letterSpacing: '0.15em' }}>{mag.tag}</span>
                </div>
                <h3 style={{ fontFamily: 'Georgia, serif', color: '#FFFFFF', fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: 700, lineHeight: 1.15 }} className="mb-3">
                  {mag.title}
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '14px', lineHeight: 1.7 }} className="mb-5">
                  {mag.subtitle}
                </p>
                <div className="flex items-center gap-4 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{mag.date}</span>
                  <span className="flex items-center gap-1"><BookMarked className="w-3 h-3" />{mag.readTime} 읽기</span>
                </div>
              </div>
              <div className="absolute bottom-6 right-8 flex items-center gap-2 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <span style={{ fontSize: '13px', letterSpacing: '0.1em' }}>읽어보기</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        ))}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {magazines.filter((m) => !m.featured).map((mag) => (
            <Link
              key={mag.href}
              href={mag.href}
              className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={mag.image}
                  alt={mag.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: 'rgba(26,26,46,0.8)' }}>
                  {mag.tag}
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{mag.date}</span>
                  <span className="flex items-center gap-1"><BookMarked className="w-3 h-3" />{mag.readTime} 읽기</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug group-hover:text-[#E8B86D] transition-colors">
                  {mag.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{mag.subtitle}</p>
                <div className="flex items-center gap-1 text-sm font-medium" style={{ color: '#E8B86D' }}>
                  읽어보기 <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}

          {/* Coming soon placeholder */}
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center py-16 text-center">
            <MapPin className="w-10 h-10 text-gray-300 mb-4" />
            <p className="text-gray-400 font-medium mb-1">다음 매거진 준비 중</p>
            <p className="text-sm text-gray-300">오사카 · 방콕 · 파리</p>
          </div>
        </div>
      </section>
    </div>
  )
}
