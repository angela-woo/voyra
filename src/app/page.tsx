import { createClient } from '@/lib/supabase/server'
import ArticleCard from '@/components/article/ArticleCard'
import NewsletterSignup from '@/components/widgets/NewsletterSignup'
import { MapPin, Compass, BookOpen } from 'lucide-react'
import Image from 'next/image'
import { fetchUnsplashPhoto, toEnglishCity } from '@/lib/unsplash'

export const dynamic = 'force-dynamic'

async function getArticles() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('articles')
      .select('id, slug, title, meta_description, city, country, category, created_at')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(50)
    return data ?? []
  } catch {
    return []
  }
}

async function getFeatured() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('articles')
      .select('id, slug, title, meta_description, city, country, category, created_at')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    return data
  } catch {
    return null
  }
}

export default async function HomePage() {
  const [articles, featured] = await Promise.all([getArticles(), getFeatured()])
  const nonFeatured = featured ? articles.filter((a: { id: string }) => a.id !== featured.id) : articles

  const featuredImage = featured?.city
    ? await fetchUnsplashPhoto(`${toEnglishCity(featured.city)} travel`)
    : null

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-24 px-4 overflow-hidden">
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-sm px-4 py-1.5 rounded-full">
              <Compass className="w-4 h-4" />
              AI 기반 여행 가이드
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            세상 모든 여행지를<br />
            <span className="text-yellow-300">Voyra</span>와 함께
          </h1>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            AI가 큐레이션한 여행 가이드로 최고의 여행 경험을 만들어보세요.
            숨겨진 명소부터 현지 맛집까지 모두 담았습니다.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="#articles" className="px-6 py-3 bg-white text-blue-700 font-semibold rounded-[var(--radius)] hover:bg-blue-50 transition-colors">
              가이드 보기
            </a>
            <a href="/community" className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-[var(--radius)] hover:bg-white/30 transition-colors">
              커뮤니티
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[var(--bg-secondary)] border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: <BookOpen className="w-5 h-5" />, value: '200+', label: '여행 가이드' },
            { icon: <MapPin className="w-5 h-5" />, value: '50+', label: '도시' },
            { icon: <Compass className="w-5 h-5" />, value: '10K+', label: '여행자' },
          ].map(stat => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <div className="text-[var(--primary)]">{stat.icon}</div>
              <div className="font-bold text-xl text-gray-800">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Article */}
      {featured && (
        <section className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
            추천 가이드
          </h2>
          <a href={`/article/${featured.slug}`} className="group block relative rounded-[var(--radius)] overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 text-white min-h-[320px]">
            {featuredImage && (
              <Image
                src={featuredImage.url}
                alt={featured.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-8">
              {(featured.city || featured.country) && (
                <span className="inline-block bg-white/20 text-white text-xs px-3 py-1 rounded-full mb-3 w-fit">
                  {[featured.city, featured.country].filter(Boolean).join(', ')}
                </span>
              )}
              <h3 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                {featured.title}
              </h3>
              {featured.meta_description && (
                <p className="text-sm text-blue-100 line-clamp-2">{featured.meta_description}</p>
              )}
            </div>
          </a>
        </section>
      )}

      {/* Article Grid */}
      <section id="articles" className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
          최신 여행 가이드
        </h2>
        {nonFeatured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {nonFeatured.map((article: any) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>아직 게시된 가이드가 없습니다.</p>
            <p className="text-sm mt-1">관리자 페이지에서 콘텐츠를 생성해보세요.</p>
          </div>
        )}
      </section>

      {/* Newsletter */}
      <section className="max-w-2xl mx-auto px-4 pb-16">
        <NewsletterSignup />
      </section>
    </div>
  )
}
