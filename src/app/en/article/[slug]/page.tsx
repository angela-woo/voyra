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
import ReadingProgress from '@/components/article/ReadingProgress'
import TableOfContents from '@/components/article/TableOfContents'
import { Calendar, MapPin, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { enUS } from 'date-fns/locale'
import type { Metadata } from 'next'
import { generateMetaDescription, getOgImageUrl } from '@/lib/utils/metaGenerator'
import { NOINDEX_ARTICLE_SLUGS } from '@/lib/seo/noindex-articles'
import AdUnit from '@/components/ui/AdUnit'
import ShareButtons from '@/components/ui/ShareButtons'
import Breadcrumb from '@/components/ui/Breadcrumb'
import RelatedContent from '@/components/article/RelatedContent'
import InternalLinks from '@/components/article/InternalLinks'

export const revalidate = 3600

marked.use({ renderer: { del({ text }: { text: string }) { return `~${text}~` } } })

function preprocessMarkdown(md: string): string {
  return md.replace(/(\S)~~(\S)/g, '$1~$2').replace(/~~/g, '')
}

interface PageProps {
  params: Promise<{ slug: string }>
}

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

function slugify(text: string, index: number): string {
  const base = text
    .trim()
    .toLowerCase()
    .replace(/["'!?.,:;()[\]{}·`~]/g, '')
    .replace(/\s+/g, '-')
  return base ? `${base}-${index}` : `section-${index}`
}

function estimateReadingMinutes(content: string): number {
  const words = content.replace(/[#*`>_-]/g, '').trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

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
  if (!article) return { title: 'Not Found' }

  const description = (article.meta_description && article.meta_description.length >= 50)
    ? article.meta_description
    : generateMetaDescription(article.content ?? '', article.city ?? '', article.country ?? '', slug, 'en')

  const ogImage = getOgImageUrl(article.cover_image_url)

  const keywords = [
    article.city,
    article.country,
    'travel guide',
    'travel tips',
    article.city ? `${article.city} travel` : null,
    article.city ? `${article.city} travel guide` : null,
    article.country ? `${article.country} travel` : null,
  ].filter(Boolean) as string[]

  return {
    title: `${article.title} | Kiravoy`,
    description,
    keywords,
    ...(NOINDEX_ARTICLE_SLUGS.has(slug) && { robots: { index: false, follow: false } }),
    alternates: {
      canonical: `https://kiravoy.com/en/article/${slug}`,
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
      url: `https://kiravoy.com/en/article/${slug}`,
      siteName: 'Kiravoy',
      locale: 'en_US',
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

export default async function EnArticlePage({ params }: PageProps) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  const places = await getPlaces(article.id)
  const cityEnglish = toEnglishCity(article.city ?? '')
  const { globalIntro, sections } = parseArticle(article.content ?? '')

  const allItemQueries = sections.flatMap(s =>
    s.items.map(item => ({ heading: item.heading, query: itemToSearchQuery(item.heading, cityEnglish) })),
  )

  const [heroPhoto, itemImages] = await Promise.all([
    article.cover_image_url ? Promise.resolve(null) : fetchUnsplashPhoto(getSectionImageKeyword(article.title, cityEnglish)),
    fetchItemImages(allItemQueries),
  ])

  // Item-less sections: title+content analysis for accurate image matching
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
      const photo = await getSectionImage(s.heading, cityEnglish, usedSectionUrls)
      if (photo) sectionPhotos[s.heading] = photo.url
    }
  }

  const allMarkdown = [
    globalIntro,
    ...sections.flatMap(s => [s.intro, ...s.items.map(i => i.body)]),
  ]
  const allHtml = await Promise.all(allMarkdown.map(md => marked(preprocessMarkdown(md))))

  let htmlIdx = 0
  const globalIntroHtml = allHtml[htmlIdx++]
  const processedSections = sections.map((s, i) => ({
    ...s,
    id: slugify(s.heading, i),
    introHtml: allHtml[htmlIdx++],
    items: s.items.map(item => ({ ...item, bodyHtml: allHtml[htmlIdx++] })),
  }))
  const tocItems = processedSections.map(s => ({ id: s.id, label: s.heading }))

  const heroImageUrl = article.cover_image_url ?? heroPhoto?.url ?? null
  const timeAgo = article.created_at
    ? formatDistanceToNow(new Date(article.created_at), { addSuffix: true, locale: enUS })
    : null
  const readingMinutes = estimateReadingMinutes(article.content ?? '')
  const destination = [article.city, article.country].filter(Boolean).join(', ')
  const mainPlace = places.find((p: { lat: number | null; lng: number | null }) => p.lat && p.lng)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.meta_description,
    image: article.cover_image_url ?? 'https://kiravoy.com/og-image.jpg',
    datePublished: article.created_at ?? undefined,
    dateModified: article.updated_at ?? article.created_at ?? undefined,
    author: { '@type': 'Organization', name: 'Kiravoy', url: 'https://kiravoy.com' },
    publisher: {
      '@type': 'Organization',
      name: 'Kiravoy',
      logo: { '@type': 'ImageObject', url: 'https://kiravoy.com/og-image.jpg' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://kiravoy.com/en/article/${article.slug}` },
  }

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ReadingProgress />

      {/* Hero */}
      <div className={`relative w-full h-[46vh] min-h-[320px] md:h-[64vh] md:min-h-[440px] ${heroImageUrl ? 'bg-[var(--bg-secondary)]' : 'bg-[var(--ink)]'}`}>
        {heroImageUrl && (
          <Image src={heroImageUrl} alt={article.title} fill priority sizes="100vw" className="object-cover object-center" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 pb-8 md:pb-12 px-6">
          <div className="max-w-[var(--measure)] mx-auto">
            {destination && (
              <p className="eyebrow text-white/75 mb-3">
                <MapPin className="w-3 h-3 inline -mt-0.5 mr-1" />{destination}
              </p>
            )}
            <h1
              className="text-white leading-[1.15] max-w-2xl"
              style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
            >
              {article.title}
            </h1>
          </div>
        </div>
        {heroImageUrl && heroImageUrl.includes('unsplash.com') && (
          <span className="absolute bottom-2 right-3 text-[10px] text-white/50">
            {article.cover_image_attribution ? `${article.cover_image_attribution} / ` : 'Photo on '}
            <a href="https://unsplash.com/?utm_source=kiravoy&utm_medium=referral" target="_blank" rel="noopener noreferrer" className="underline">Unsplash</a>
          </span>
        )}
      </div>

      <Breadcrumb items={[
        { label: 'Home', href: '/en' },
        { label: 'Travel Guides', href: '/en/articles' },
        ...(article.country ? [{ label: article.country, href: `/en/articles?country=${encodeURIComponent(article.country)}` }] : []),
        { label: article.title },
      ]} />

      <div className="max-w-[1360px] mx-auto px-6 py-14">
        <div className="grid grid-cols-1 xl:grid-cols-[180px_minmax(0,var(--measure))_300px] gap-12 xl:gap-16 justify-center">
          <TableOfContents items={tocItems} />

          <article className="w-full mx-auto max-w-[var(--measure)] xl:max-w-none">
            {/* Meta / byline */}
            <div className="mb-10 pb-8 border-b border-[var(--border)]">
              {article.meta_description && (
                <p className="text-lg text-[color:var(--ink-soft)] mb-5 leading-relaxed" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
                  {article.meta_description}
                </p>
              )}
              <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-[13px] text-[color:var(--ink-faint)] mb-5">
                <span>Kiravoy Editor</span>
                {timeAgo && (
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{timeAgo}</span>
                )}
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{readingMinutes} min read</span>
                {article.category && <span>{article.category}</span>}
              </div>
              <ShareButtons
                url={`https://kiravoy.com/en/article/${article.slug}`}
                title={article.title}
                description={article.meta_description}
                locale="en"
              />
            </div>

            {/* Body */}
            <div className="prose max-w-none">
              {globalIntro && <div dangerouslySetInnerHTML={{ __html: globalIntroHtml as string }} />}

              <AdUnit slot="1936618959" />

              {processedSections.map(section => (
                <div key={section.heading}>
                  <h2 id={section.id}>{section.heading}</h2>

                  {section.intro && (
                    <div dangerouslySetInnerHTML={{ __html: section.introHtml as string }} />
                  )}

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
                    sectionPhotos[section.heading] && (
                      <figure className="not-prose my-6">
                        <div className="relative w-full h-[220px] md:h-[380px] overflow-hidden">
                          <Image
                            src={sectionPhotos[section.heading]!}
                            alt={section.heading}
                            fill
                            sizes="(max-width: 1024px) 100vw, 700px"
                            className="object-cover"
                          />
                        </div>
                        <figcaption className="eyebrow mt-2 text-[color:var(--ink-faint)]">{section.heading}</figcaption>
                      </figure>
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
              language="en"
            />

            <AdUnit slot="6933794765" />

            {/* Recommended places */}
            {places.length > 0 && (
              <div className="mt-14 pt-10 border-t border-[var(--border)]">
                <h2 className="editorial-heading text-xl mb-5">Recommended Places</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {places.map((place: { id: string }) => (
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    <PlaceCard key={place.id} place={place as any} city={article.city} locale="en" />
                  ))}
                </div>
              </div>
            )}

            <AdUnit slot="9176814723" />
          </article>

          {/* Sidebar */}
          <aside className="space-y-6 xl:pt-0">
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
        language="en"
      />
    </div>
  )
}
