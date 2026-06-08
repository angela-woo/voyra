const DEFAULT_OG_IMAGE = 'https://kiravoy.com/og-image.jpg'

export function truncateDescription(text: string, maxLength = 155): string {
  const stripped = text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
  if (stripped.length <= maxLength) return stripped
  const truncated = stripped.slice(0, maxLength - 3)
  const lastSpace = truncated.lastIndexOf(' ')
  return (lastSpace > maxLength * 0.8 ? truncated.slice(0, lastSpace) : truncated) + '...'
}

export function generateOgImageUrl(
  _slug: string,
  _type: 'article' | 'destination',
): string {
  return DEFAULT_OG_IMAGE
}
