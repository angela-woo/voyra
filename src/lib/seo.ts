const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kiravoy.com'

export function truncateDescription(text: string, maxLength = 155): string {
  const stripped = text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
  if (stripped.length <= maxLength) return stripped
  const truncated = stripped.slice(0, maxLength - 3)
  const lastSpace = truncated.lastIndexOf(' ')
  return (lastSpace > maxLength * 0.8 ? truncated.slice(0, lastSpace) : truncated) + '...'
}

/**
 * OG 이미지 URL 결정.
 * fallbackImageUrl이 있으면 실제 이미지를 사용하고 Unsplash면 1200×630으로 리사이즈.
 * 없으면 /og 동적 생성 라우트 URL을 반환.
 */
export function buildOgImageUrl(params: {
  title: string
  description?: string
  type: 'article' | 'destination' | 'default'
  fallbackImageUrl?: string | null
}): string {
  const { title, description, type, fallbackImageUrl } = params

  if (fallbackImageUrl) {
    if (fallbackImageUrl.includes('unsplash.com')) {
      try {
        const u = new URL(fallbackImageUrl)
        u.searchParams.set('w', '1200')
        u.searchParams.set('h', '630')
        u.searchParams.set('fit', 'crop')
        return u.toString()
      } catch {
        return fallbackImageUrl
      }
    }
    return fallbackImageUrl
  }

  const url = new URL(`${SITE_URL}/og`)
  url.searchParams.set('title', title.slice(0, 60))
  if (description) url.searchParams.set('description', description.slice(0, 100))
  url.searchParams.set('type', type)
  return url.toString()
}
