import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { marked } from 'marked'
import Image from 'next/image'
import {
  fetchUnsplashPhoto,
  fetchItemImages,
  itemToSearchQuery,
  toEnglishCity,
} from '@/lib/unsplash'
import { getSectionImageKeyword } from '@/lib/utils/sectionKeywords'
import { getSectionImage } from '@/lib/images/sectionImageResolver'
import { getSectionImageKeywords, fetchUniqueUnsplashImage, getCachedSectionImage, cacheSectionImage } from '@/lib/images/smartImageSearch'
import ImageCarousel from '@/components/ui/ImageCarousel'
import PlaceCard from '@/components/article/PlaceCard'
import WeatherWidget from '@/components/widgets/WeatherWidget'
import BudgetCalculator from '@/components/widgets/BudgetCalculator'
import { getKlookUrl } from '@/lib/utils/klookUrl'
import { Calendar, MapPin, Ticket, UtensilsCrossed, Moon, Bus, Landmark } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { Metadata } from 'next'
import { generateMetaDescription } from '@/lib/utils/metaGenerator'
import { buildOgImageUrl } from '@/lib/seo'
import { NOINDEX_ARTICLE_SLUGS } from '@/lib/seo/noindex-articles'
import AdUnit from '@/components/ui/AdUnit'
import ESimBanner from '@/components/widgets/ESimBanner'
import ShareButtons from '@/components/ui/ShareButtons'
import Breadcrumb from '@/components/ui/Breadcrumb'
import RelatedContent from '@/components/article/RelatedContent'
import InternalLinks from '@/components/article/InternalLinks'
import TagBasedInternalLinks from '@/components/InternalLinks'
import { Suspense } from 'react'
import FlightSearchWidget from '@/components/widgets/FlightSearchWidget'
import ArticleSchema from '@/components/schema/ArticleSchema'
import BreadcrumbSchema from '@/components/schema/BreadcrumbSchema'

export const revalidate = 3600

marked.use({ renderer: { del({ text }: { text: string }) { return `~${text}~` } } })

function preprocessMarkdown(md: string): string {
  return md.replace(/(\S)~~(\S)/g, '$1~$2').replace(/~~/g, '')
}

interface PageProps {
  params: Promise<{ slug: string }>
}

// ------- 파서 -------
interface ArticleItem { heading: string; body: string }
interface ArticleSection { heading: string; intro: string; items: ArticleItem[] }

function parseArticle(content: string): { globalIntro: string; sections: ArticleSection[] } {
  const lines = content.split('\n')
  const globalIntroBuf: string[] = []
  const sections: Array<{ heading: string; introBuf: string[]; items: Array<{ heading: string; bodyBuf: string[] }> }> = []
  let sec: typeof sections[0] | null = null
  let item: typeof sections[0]['items'][0] | null = null

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (item && sec) { sec.items.push(item); item = null }
      if (sec) sections.push(sec)
      sec = { heading: line.slice(3).trim(), introBuf: [], items: [] }
    } else if (line.startsWith('### ') && sec) {
      if (item) sec.items.push(item)
      item = { heading: line.slice(4).trim(), bodyBuf: [] }
    } else {
      if (item) item.bodyBuf.push(line)
      else if (sec) sec.introBuf.push(line)
      else globalIntroBuf.push(line)
    }
  }
  if (item && sec) sec.items.push(item)
  if (sec) sections.push(sec)

  return {
    globalIntro: globalIntroBuf.join('\n'),
    sections: sections.map(s => ({
      heading: s.heading,
      intro: s.introBuf.join('\n'),
      items: s.items.map(i => ({ heading: i.heading, body: i.bodyBuf.join('\n') })),
    })),
  }
}

// ------- DB / 데이터 -------
async function getArticle(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('articles').select('*').eq('slug', slug).eq('published', true).single()
  return data
}

async function getPlaces(articleId: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('places').select('*').eq('article_id', articleId)
  return data ?? []
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  const description = (article.meta_description && article.meta_description.length >= 50)
    ? article.meta_description
    : generateMetaDescription(article.content ?? '', article.city ?? '', article.country ?? '', slug, 'ko')

  const ogImage = buildOgImageUrl({
    title: article.title,
    description: description.slice(0, 100),
    type: 'article',
    fallbackImageUrl: article.cover_image_url,
  })

  const keywords = [
    article.city,
    article.country,
    '여행가이드',
    '여행정보',
    article.city ? `${article.city}여행` : null,
    article.city ? `${article.city}여행코스` : null,
    article.country ? `${article.country}여행` : null,
  ].filter(Boolean) as string[]

  return {
    title: `${article.title} | Kiravoy`,
    description,
    keywords,
    ...(NOINDEX_ARTICLE_SLUGS.has(slug) && { robots: { index: false, follow: false } }),
    alternates: {
      canonical: `https://kiravoy.com/article/${slug}`,
      languages: {
        ko: `https://kiravoy.com/article/${slug}`,
        en: `https://kiravoy.com/en/article/${slug}`,
        'x-default': `https://kiravoy.com/article/${slug}`,
      },
    },
    openGraph: {
      type: 'article',
      title: `${article.title} | Kiravoy`,
      description,
      url: `https://kiravoy.com/article/${slug}`,
      siteName: 'Kiravoy',
      locale: 'ko_KR',
      images: [{ url: ogImage, width: 1200, height: 630, alt: article.title }],
      publishedTime: article.created_at ?? undefined,
      modifiedTime: article.updated_at ?? article.created_at ?? undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${article.title} | Kiravoy`,
      description,
      images: [ogImage],
    },
    other: { 'pinterest-rich-pin': 'true' },
  }
}

// ------- 페이지 -------
export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  const places = await getPlaces(article.id)
  const cityEnglish = toEnglishCity(article.city ?? '')
  const { globalIntro, sections } = parseArticle(article.content ?? '')

  // 아이템 이미지 쿼리 수집 (캐러셀용)
  const allItemQueries = sections.flatMap(s =>
    s.items.map(item => ({ heading: item.heading, query: itemToSearchQuery(item.heading, cityEnglish) })),
  )

  // 히어로 + 아이템 이미지 병렬 fetch
  const [heroPhoto, itemImages] = await Promise.all([
    article.cover_image_url ? Promise.resolve(null) : fetchUnsplashPhoto(getSectionImageKeyword(article.title, cityEnglish)),
    fetchItemImages(allItemQueries),
  ])

  // 아이템 없는 섹션: 타이틀+본문 분석 기반 이미지 (슬러그별 캐시 + 중복 방지)
  const sectionPhotos: Record<string, string> = {}
  const usedSectionUrls = new Set<string>(article.cover_image_url ? [article.cover_image_url] : [])
  for (const s of sections.filter(sec => sec.items.length === 0)) {
    const cacheKey = `section-v4-${article.slug}-${s.heading.slice(0, 30)}`
    const cached = await getCachedSectionImage(cacheKey, usedSectionUrls)
    if (cached) {
      usedSectionUrls.add(cached)
      sectionPhotos[s.heading] = cached
      continue
    }
    const queries = getSectionImageKeywords(s.heading, s.intro, cityEnglish)
    const url = await fetchUniqueUnsplashImage(queries, usedSectionUrls)
    if (url) {
      sectionPhotos[s.heading] = url
      cacheSectionImage(cacheKey, url).catch(() => {})
    } else {
      // fallback: 기존 엔티티 기반 검색
      const photo = await getSectionImage(s.heading, cityEnglish, usedSectionUrls)
      if (photo) sectionPhotos[s.heading] = photo.url
    }
  }

  // 마크다운 → HTML (모두 병렬)
  const allMarkdown = [
    globalIntro,
    ...sections.flatMap(s => [s.intro, ...s.items.map(i => i.body)]),
  ]
  const allHtml = await Promise.all(allMarkdown.map(md => marked(preprocessMarkdown(md))))

  let htmlIdx = 0
  const globalIntroHtml = allHtml[htmlIdx++]
  const processedSections = sections.map(s => ({
    ...s,
    introHtml: allHtml[htmlIdx++],
    items: s.items.map(item => ({ ...item, bodyHtml: allHtml[htmlIdx++] })),
  }))

  const heroImageUrl = article.cover_image_url ?? heroPhoto?.url ?? null
  const timeAgo = article.created_at
    ? formatDistanceToNow(new Date(article.created_at), { addSuffix: true, locale: ko })
    : null
  const destination = [article.city, article.country].filter(Boolean).join(', ')
  const mainPlace = places.find((p: { lat: number | null; lng: number | null }) => p.lat && p.lng)

  const articleUrl = `https://kiravoy.com/article/${article.slug}`

  return (
    <div>
      <ArticleSchema
        headline={article.title}
        description={article.meta_description}
        image={article.cover_image_url}
        datePublished={article.created_at}
        dateModified={article.updated_at ?? article.created_at}
        url={articleUrl}
      />
      <BreadcrumbSchema
        items={[
          { name: '홈', url: 'https://kiravoy.com' },
          { name: '여행 가이드', url: 'https://kiravoy.com/articles' },
          ...(article.country ? [{ name: article.country, url: `https://kiravoy.com/articles?country=${encodeURIComponent(article.country)}` }] : []),
          { name: article.title, url: articleUrl },
        ]}
      />
      {/* 히어로 */}
      <div className={`relative w-full h-[300px] md:h-[500px] ${heroImageUrl ? 'bg-gray-200' : 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900'}`}>
        {heroImageUrl && (
          <Image src={heroImageUrl} alt={article.title} fill priority sizes="100vw" className="object-cover object-center" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 max-w-6xl mx-auto">
          {destination && (
            <span className="inline-flex items-center gap-1 text-sm text-white/90 font-medium mb-2">
              <MapPin className="w-4 h-4" />{destination}
            </span>
          )}
          <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            {article.title}
          </h1>
        </div>
        {heroImageUrl && heroImageUrl.includes('unsplash.com') && (
          <span className="absolute bottom-2 right-3 text-[10px] text-white/50">
            {article.cover_image_attribution ? `${article.cover_image_attribution} / ` : 'Photo on '}
            <a href="https://unsplash.com/?utm_source=kiravoy&utm_medium=referral" target="_blank" rel="noopener noreferrer" className="underline">Unsplash</a>
          </span>
        )}
      </div>

      <Breadcrumb items={[
        { label: '홈', href: '/' },
        { label: '여행 가이드', href: '/articles' },
        ...(article.country ? [{ label: article.country, href: `/articles?country=${encodeURIComponent(article.country)}` }] : []),
        { label: article.title },
      ]} />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
          <article>
            {/* 메타 */}
            <div className="mb-8">
              {!heroImageUrl && destination && (
                <span className="inline-flex items-center gap-1 text-sm text-[var(--primary)] font-medium mb-3">
                  <MapPin className="w-4 h-4" />{destination}
                </span>
              )}
              {!heroImageUrl && (
                <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                  {article.title}
                </h1>
              )}
              {article.meta_description && <p className="text-lg text-gray-500 mb-4">{article.meta_description}</p>}
              {timeAgo && (
                <div className="flex items-center gap-1 text-sm text-gray-400 mb-4">
                  <Calendar className="w-4 h-4" />{timeAgo}
                </div>
              )}
              {article.category && (
                <span className="inline-block text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: '#FFF3F0', color: '#FF5722' }}>{article.category}</span>
              )}
              <ShareButtons
                url={`https://kiravoy.com/article/${article.slug}`}
                title={article.title}
                description={article.meta_description}
                locale="ko"
              />
            </div>

            {/* 본문 */}
            <div className="prose prose-gray max-w-none prose-headings:font-bold prose-a:text-[var(--primary)]">
              {globalIntro && <div dangerouslySetInnerHTML={{ __html: globalIntroHtml as string }} />}

              <AdUnit slot="1936618959" />

              {processedSections.map(section => (
                <div key={section.heading}>
                  {/* Orange bar section title */}
                  <div className="not-prose flex items-center gap-3 mt-8 mb-3">
                    <div className="w-1 h-6 rounded-full shrink-0" style={{ backgroundColor: '#FF5722' }} />
                    <h2 className="text-xl font-bold text-gray-900">{section.heading}</h2>
                  </div>

                  {/* 섹션 인트로 (### 이전 내용) */}
                  {section.intro && (
                    <div dangerouslySetInnerHTML={{ __html: section.introHtml as string }} />
                  )}

                  {/* ### 아이템별 캐러셀 */}
                  {section.items.length > 0 ? (
                    section.items.map(item => {
                      const photos = itemImages[item.heading] ?? []
                      return (
                        <div key={item.heading}>
                          <h3>{item.heading}</h3>
                          {photos.length > 0 && (
                            <ImageCarousel images={photos} height={350} mobileHeight={220} />
                          )}
                          <div dangerouslySetInnerHTML={{ __html: item.bodyHtml as string }} />
                        </div>
                      )
                    })
                  ) : (
                    /* 아이템 없는 섹션: 타이틀+내용 분석 기반 이미지 */
                    sectionPhotos[section.heading] && (
                      <div className="not-prose my-4 relative w-full h-[220px] md:h-[320px] rounded-[var(--radius)] overflow-hidden">
                        <Image
                          src={sectionPhotos[section.heading]!}
                          alt={section.heading}
                          fill
                          sizes="(max-width: 1024px) 100vw, 700px"
                          className="object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                          <span className="text-white text-sm font-medium">{section.heading}</span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ))}
            </div>

            <InternalLinks
                city={article.city ?? null}
                country={article.country ?? null}
                currentSlug={article.slug}
                content={article.content ?? ''}
                language="ko"
              />

            <Suspense fallback={null}>
              <TagBasedInternalLinks
                currentSlug={article.slug}
                tags={[article.category, article.city].filter((v): v is string => Boolean(v))}
                type="article"
                language="ko"
              />
            </Suspense>

            <AdUnit slot="6933794765" />

            {/* Klook 투어 캐러셀 */}
            {article.city && (
              <div className="mt-10 not-prose">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-6 rounded-full shrink-0" style={{ backgroundColor: '#FF5722' }} />
                  <h2 className="text-xl font-bold">{article.city} 인기 투어 &amp; 액티비티</h2>
                </div>
                <div className="overflow-x-auto -mx-4 px-4 pb-2">
                  <div className="flex gap-3" style={{ width: 'max-content' }}>
                    {[
                      { label: `${article.city} 베스트 투어`, Icon: Ticket },
                      { label: `${article.city} 음식 투어`, Icon: UtensilsCrossed },
                      { label: `${article.city} 야경 투어`, Icon: Moon },
                      { label: `${article.city} 당일치기`, Icon: Bus },
                      { label: `${article.city} 문화 체험`, Icon: Landmark },
                    ].map((tour, i) => (
                      <a
                        key={i}
                        href={getKlookUrl((article.city ?? '') + ' ' + tour.label, 'ko')}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-sm font-medium shrink-0 hover:border-[#FF5722] hover:text-[#FF5722] transition-all"
                        style={{ borderColor: '#E5E7EB', color: '#374151', backgroundColor: 'white' }}
                      >
                        <tour.Icon className="w-4 h-4" />
                        {tour.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 추천 장소 */}
            {places.length > 0 && (
              <div className="mt-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-6 rounded-full shrink-0" style={{ backgroundColor: '#FF5722' }} />
                  <h2 className="text-xl font-bold text-gray-900">추천 장소</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {places.map((place: { id: string }) => (
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    <PlaceCard key={place.id} place={place as any} city={article.city} locale="ko" />
                  ))}
                </div>
              </div>
            )}

            <AdUnit slot="9176814723" />

            <ESimBanner locale="ko" city={article.city} />
            <FlightSearchWidget city={article.city ?? ''} cityEn={cityEnglish} locale="ko" />
          </article>

          {/* 사이드바 */}
          <aside className="space-y-6">
            {article.city && (
              <WeatherWidget lat={mainPlace?.lat ?? null} lng={mainPlace?.lng ?? null} city={article.city} />
            )}
            <BudgetCalculator />
          </aside>
        </div>
      </div>
      <RelatedContent
        city={article.city}
        country={article.country}
        currentSlug={article.slug}
        language="ko"
      />
    </div>
  )
}
