import { createClient } from '@/lib/supabase/server'

export default async function sitemap() {
  const supabase = await createClient()

  const { data: articles } = await supabase
    .from('articles')
    .select('slug, updated_at')
    .eq('published', true)

  const { data: plans } = await supabase
    .from('travel_plans')
    .select('slug, city, country, created_at')
    .eq('published', true)

  const baseUrl = 'https://kiravoy.com'

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/articles`, lastModified: new Date() },
    { url: `${baseUrl}/destinations`, lastModified: new Date() },
    { url: `${baseUrl}/community`, lastModified: new Date() },
    ...(articles ?? []).map(a => ({
      url: `${baseUrl}/article/${a.slug}`,
      lastModified: new Date(a.updated_at),
    })),
    ...(plans ?? []).map(p => ({
      url: `${baseUrl}/destinations/${encodeURIComponent(p.country)}/${encodeURIComponent(p.city)}/${p.slug}`,
      lastModified: new Date(p.created_at),
    })),
  ]
}
