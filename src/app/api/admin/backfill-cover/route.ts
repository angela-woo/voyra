import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { toEnglishCity } from '@/lib/unsplash'
import { getSectionImageKeyword } from '@/lib/utils/sectionKeywords'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

interface UnsplashSearchPhoto {
  id: string
  urls: { regular: string }
  user: { name: string }
  links: { download_location: string }
}

// Search Unsplash and register the required download-tracking ping
// (Unsplash API Guidelines: https://help.unsplash.com/en/articles/2511245)
// before a photo is used in production.
async function fetchAndTrackUnsplashPhoto(query: string) {
  const key = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY
  if (!key) return null

  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
    { headers: { Authorization: `Client-ID ${key}` } },
  )
  if (!res.ok) return { error: `unsplash search failed: HTTP ${res.status}` as const }

  const data = await res.json()
  const photo: UnsplashSearchPhoto | undefined = data.results?.[0]
  if (!photo) return { error: 'no results for query' as const }

  // Required tracking ping — does not need the response body used
  await fetch(photo.links.download_location, {
    headers: { Authorization: `Client-ID ${key}` },
  }).catch(() => {})

  return {
    url: photo.urls.regular,
    authorName: photo.user.name,
  }
}

export async function POST(req: Request) {
  const { secret, slug } = await req.json()
  if (secret !== process.env.ADMIN_API_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  if (!slug) {
    return NextResponse.json({ error: 'slug required' }, { status: 400 })
  }

  const { data: article, error: fetchError } = await supabase
    .from('articles')
    .select('id, slug, title, city, cover_image_url')
    .eq('slug', slug)
    .single()

  if (fetchError || !article) {
    return NextResponse.json({ error: 'article not found' }, { status: 404 })
  }

  if (article.cover_image_url) {
    return NextResponse.json({ skipped: true, reason: 'cover_image_url already set', cover_image_url: article.cover_image_url })
  }

  const cityEn = toEnglishCity(article.city ?? '')
  const keyword = getSectionImageKeyword(article.title, cityEn)
  const result = await fetchAndTrackUnsplashPhoto(keyword)

  if (!result || 'error' in result) {
    return NextResponse.json({ error: result?.error ?? 'unsplash fetch failed', keyword }, { status: 502 })
  }

  const { error: updateError } = await supabase
    .from('articles')
    .update({ cover_image_url: result.url, cover_image_attribution: result.authorName })
    .eq('id', article.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    slug: article.slug,
    keyword,
    cover_image_url: result.url,
    cover_image_attribution: result.authorName,
  })
}
