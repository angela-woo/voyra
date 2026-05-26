import { createClient } from '@/lib/supabase/server'
import { toPlanUrl } from '@/lib/location'

const BASE = 'https://kiravoy.com'

type SitemapEntry = {
  url: string
  lastModified?: Date
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
  alternates?: { languages: Record<string, string> }
}

export default async function sitemap(): Promise<SitemapEntry[]> {
  const supabase = await createClient()

  const [{ data: articles }, { data: plans }] = await Promise.all([
    supabase
      .from('articles')
      .select('slug, language, updated_at')
      .eq('published', true),
    supabase
      .from('travel_plans')
      .select('slug, city, country, language, created_at')
      .eq('published', true),
  ])

  const staticPages: SitemapEntry[] = [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: { languages: { ko: BASE, en: `${BASE}/en`, 'x-default': BASE } },
    },
    {
      url: `${BASE}/en`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: { languages: { ko: BASE, en: `${BASE}/en`, 'x-default': BASE } },
    },
    {
      url: `${BASE}/articles`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: { languages: { ko: `${BASE}/articles`, en: `${BASE}/en/articles`, 'x-default': `${BASE}/articles` } },
    },
    {
      url: `${BASE}/en/articles`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: { languages: { ko: `${BASE}/articles`, en: `${BASE}/en/articles`, 'x-default': `${BASE}/articles` } },
    },
    {
      url: `${BASE}/destinations`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: { languages: { ko: `${BASE}/destinations`, en: `${BASE}/en/destinations`, 'x-default': `${BASE}/destinations` } },
    },
    {
      url: `${BASE}/en/destinations`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: { languages: { ko: `${BASE}/destinations`, en: `${BASE}/en/destinations`, 'x-default': `${BASE}/destinations` } },
    },
  ]

  // Articles — pair KO and EN slugs by slug value (same slug used for both languages)
  const articleSlugs = Array.from(new Set((articles ?? []).map(a => a.slug)))
  const articleEntries: SitemapEntry[] = articleSlugs.flatMap(slug => {
    const row = (articles ?? []).find(a => a.slug === slug)
    const lastMod = row?.updated_at ? new Date(row.updated_at) : new Date()
    const koUrl = `${BASE}/article/${slug}`
    const enUrl = `${BASE}/en/article/${slug}`
    return [
      {
        url: koUrl,
        lastModified: lastMod,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
        alternates: { languages: { ko: koUrl, en: enUrl, 'x-default': koUrl } },
      },
      {
        url: enUrl,
        lastModified: lastMod,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
        alternates: { languages: { ko: koUrl, en: enUrl, 'x-default': koUrl } },
      },
    ]
  })

  // Travel plans — pair by slug
  const planSlugs = Array.from(new Set((plans ?? []).map(p => p.slug)))
  const planEntries: SitemapEntry[] = planSlugs.flatMap(slug => {
    const row = (plans ?? []).find(p => p.slug === slug)
    if (!row) return []
    const lastMod = row.created_at ? new Date(row.created_at) : new Date()
    const planPath = toPlanUrl({ country: row.country, city: row.city, slug: row.slug })
    const koUrl = `${BASE}${planPath}`
    const enUrl = `${BASE}/en${planPath}`
    return [
      {
        url: koUrl,
        lastModified: lastMod,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
        alternates: { languages: { ko: koUrl, en: enUrl, 'x-default': koUrl } },
      },
      {
        url: enUrl,
        lastModified: lastMod,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
        alternates: { languages: { ko: koUrl, en: enUrl, 'x-default': koUrl } },
      },
    ]
  })

  return [...staticPages, ...articleEntries, ...planEntries]
}
