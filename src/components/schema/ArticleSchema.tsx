import JsonLd from '@/components/JsonLd'

/**
 * 컬럼 매핑:
 *   headline       ← articles.title
 *   description    ← articles.meta_description
 *   image          ← articles.cover_image_url (fallback: og-image.jpg)
 *   datePublished  ← articles.created_at
 *   dateModified   ← articles.updated_at ?? articles.created_at
 *   url            ← /article/[slug]
 *   author.name    ← "Kiravoy" (고정)
 *   publisher.name ← "Kiravoy" (고정)
 */
interface ArticleSchemaProps {
  headline: string
  description: string | null | undefined
  image: string | null | undefined
  datePublished: string | null | undefined
  dateModified: string | null | undefined
  url: string
}

const LOGO_URL = 'https://kiravoy.com/og-image.jpg'
const PUBLISHER = 'Kiravoy'

export default function ArticleSchema({
  headline,
  description,
  image,
  datePublished,
  dateModified,
  url,
}: ArticleSchemaProps) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description: description ?? undefined,
    image: image ?? LOGO_URL,
    datePublished: datePublished ?? undefined,
    dateModified: dateModified ?? datePublished ?? undefined,
    author: {
      '@type': 'Organization',
      name: PUBLISHER,
      url: 'https://kiravoy.com',
    },
    publisher: {
      '@type': 'Organization',
      name: PUBLISHER,
      logo: { '@type': 'ImageObject', url: LOGO_URL },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
  }

  return <JsonLd data={data} />
}
