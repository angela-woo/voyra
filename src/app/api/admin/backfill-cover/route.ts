import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { fetchUnsplashPhoto, toEnglishCity } from '@/lib/unsplash'
import { getSectionImageKeyword } from '@/lib/utils/sectionKeywords'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: Request) {
  try {
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
    // fetchUnsplashPhoto triggers the required Unsplash download-tracking
    // ping internally before returning (src/lib/unsplash.ts)
    const photo = await fetchUnsplashPhoto(keyword)

    if (!photo) {
      return NextResponse.json({ error: 'no unsplash result (rate limited or zero matches)', keyword }, { status: 502 })
    }

    const { error: updateError } = await supabase
      .from('articles')
      .update({ cover_image_url: photo.url, cover_image_attribution: photo.authorName })
      .eq('id', article.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      slug: article.slug,
      keyword,
      cover_image_url: photo.url,
      cover_image_attribution: photo.authorName,
    })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'unknown error' }, { status: 500 })
  }
}
