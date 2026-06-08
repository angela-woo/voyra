import { createClient } from '@supabase/supabase-js'
import { toPlanUrl } from '@/lib/location'

export const revalidate = 3600

const BASE = 'https://kiravoy.com'

type SitemapEntry = {
  url: string
  lastModified?: Date
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
  alternates?: { languages: Record<string, string> }
}

export default async function sitemap(): Promise<SitemapEntry[]> {
  // cookies()가 필요 없는 직접 클라이언트 사용 (공개 데이터 조회)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

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
    {
      url: `${BASE}/latest-guides`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE}/latest-itineraries`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE}/trending`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE}/magazine`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE}/magazine/tokyo-2026`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]

  // Articles — KO/EN 쌍 (같은 slug로 두 언어 모두 등록)
  const seenArticleSlugs = new Set<string>()
  const articleEntries: SitemapEntry[] = []
  for (const a of articles ?? []) {
    if (seenArticleSlugs.has(a.slug)) continue
    seenArticleSlugs.add(a.slug)
    const lastMod = a.updated_at ? new Date(a.updated_at) : new Date()
    const koUrl = `${BASE}/article/${a.slug}`
    const enUrl = `${BASE}/en/article/${a.slug}`
    articleEntries.push(
      { url: koUrl, lastModified: lastMod, changeFrequency: 'monthly', priority: 0.8, alternates: { languages: { ko: koUrl, en: enUrl, 'x-default': koUrl } } },
      { url: enUrl, lastModified: lastMod, changeFrequency: 'monthly', priority: 0.8, alternates: { languages: { ko: koUrl, en: enUrl, 'x-default': koUrl } } },
    )
  }

  // Travel plans — KO/EN 쌍
  const seenPlanSlugs = new Set<string>()
  const planEntries: SitemapEntry[] = []
  for (const p of plans ?? []) {
    if (seenPlanSlugs.has(p.slug)) continue
    seenPlanSlugs.add(p.slug)
    const lastMod = p.created_at ? new Date(p.created_at) : new Date()
    const planPath = toPlanUrl({ country: p.country, city: p.city, slug: p.slug })
    const koUrl = `${BASE}${planPath}`
    const enUrl = `${BASE}/en${planPath}`
    planEntries.push(
      { url: koUrl, lastModified: lastMod, changeFrequency: 'monthly', priority: 0.8, alternates: { languages: { ko: koUrl, en: enUrl, 'x-default': koUrl } } },
      { url: enUrl, lastModified: lastMod, changeFrequency: 'monthly', priority: 0.8, alternates: { languages: { ko: koUrl, en: enUrl, 'x-default': koUrl } } },
    )
  }

  return [...staticPages, ...articleEntries, ...planEntries]
}
