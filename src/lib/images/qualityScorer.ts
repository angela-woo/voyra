export interface ImageCandidate {
  url: string
  thumbUrl?: string
  source: string
  sourceId: string
  width: number
  height: number
  altText?: string
  description?: string
  photographer?: string
  photographerUrl?: string
  tags?: string[]
  downloads?: number
  likes?: number
}

export function calculateQualityScore(
  image: ImageCandidate,
  entityName: string,
  searchQuery: string,
): number {
  let score = 0
  const entityLower = entityName.toLowerCase()
  const queryLower = searchQuery.toLowerCase()

  // 1. 해상도 점수 (최대 20점)
  const pixels = image.width * image.height
  if (pixels >= 2073600) score += 20      // 1920×1080 이상
  else if (pixels >= 921600) score += 15  // 1280×720 이상
  else if (pixels >= 409600) score += 10  // 640×640 이상
  else score += 5

  // 2. 비율 점수 (최대 15점)
  const ratio = image.width / image.height
  if (ratio >= 1.5 && ratio <= 1.8) score += 15  // 16:9 ~ 16:10 가로형
  else if (ratio >= 1.2 && ratio <= 2.0) score += 10
  else if (ratio >= 0.8 && ratio <= 1.2) score += 8  // 정사각형
  else score += 3

  // 3. Alt Text 관련도 (최대 20점)
  if (image.altText) {
    const altLower = image.altText.toLowerCase()
    if (altLower.includes(entityLower)) score += 20
    else if (queryLower.split(' ').some(w => altLower.includes(w))) score += 10
    else score += 3
  }

  // 4. Description 관련도 (최대 15점)
  if (image.description) {
    const descLower = image.description.toLowerCase()
    if (descLower.includes(entityLower)) score += 15
    else if (queryLower.split(' ').some(w => descLower.includes(w))) score += 8
  }

  // 5. Tags 관련도 (최대 15점)
  if (image.tags && image.tags.length > 0) {
    const tagsLower = image.tags.map(t => t.toLowerCase())
    const entityWords = entityLower.split(' ')
    const matchCount = entityWords.filter(w => tagsLower.some(t => t.includes(w))).length
    score += Math.min(15, matchCount * 5)
  }

  // 6. 인기도 (최대 10점)
  const popularity = (image.downloads || 0) + (image.likes || 0) * 2
  if (popularity > 10000) score += 10
  else if (popularity > 5000) score += 7
  else if (popularity > 1000) score += 5
  else if (popularity > 100) score += 3

  // 7. 소스 신뢰도 (최대 5점)
  if (image.source === 'google_places') score += 5
  else if (image.source === 'pexels') score += 4
  else if (image.source === 'unsplash') score += 3

  return Math.min(100, score)
}
