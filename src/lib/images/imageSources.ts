import type { ImageCandidate } from './qualityScorer'

export async function searchUnsplash(
  query: string,
  count: number = 5,
): Promise<ImageCandidate[]> {
  const key = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY
  if (!key) return []
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${key}` } },
    )
    if (!res.ok) return []
    const data = await res.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data.results || []).map((photo: any) => ({
      url: photo.urls.regular,
      thumbUrl: photo.urls.thumb,
      source: 'unsplash',
      sourceId: photo.id,
      width: photo.width,
      height: photo.height,
      altText: photo.alt_description || '',
      description: photo.description || '',
      photographer: photo.user?.name || '',
      photographerUrl: photo.user?.links?.html || '',
      tags: photo.tags?.map((t: { title: string }) => t.title) || [],
      likes: photo.likes || 0,
      downloads: photo.downloads || 0,
    }))
  } catch {
    return []
  }
}

export async function searchPexels(
  query: string,
  count: number = 5,
): Promise<ImageCandidate[]> {
  const key = process.env.PEXELS_API_KEY
  if (!key) return []
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`,
      { headers: { Authorization: key } },
    )
    if (!res.ok) return []
    const data = await res.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data.photos || []).map((photo: any) => ({
      url: photo.src.large2x || photo.src.large,
      thumbUrl: photo.src.medium,
      source: 'pexels',
      sourceId: String(photo.id),
      width: photo.width,
      height: photo.height,
      altText: photo.alt || '',
      description: photo.alt || '',
      photographer: photo.photographer || '',
      photographerUrl: photo.photographer_url || '',
      tags: [],
      likes: 0,
      downloads: 0,
    }))
  } catch {
    return []
  }
}
