import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { toPlanUrl } from '@/lib/location'

const BASE_URL = 'https://kiravoy.com'

export const dynamic = 'force-dynamic'

function escape(str: string | null | undefined): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function cdata(str: string | null | undefined): string {
  if (!str) return ''
  return `<![CDATA[${str.replace(/\]\]>/g, ']]]]><![CDATA[>')}]]>`
}

export async function GET() {
  const supabase = await createClient()

  const [{ data: articles }, { data: plans }] = await Promise.all([
    supabase
      .from('articles')
      .select('slug, title, meta_description, city, country, created_at')
      .eq('published', true)
      .eq('language', 'ko')
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('travel_plans')
      .select('slug, title, meta_description, city, country, created_at')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  const articleItems = (articles ?? []).map((a) => {
    const url = `${BASE_URL}/article/${a.slug}`
    const pubDate = a.created_at ? new Date(a.created_at).toUTCString() : new Date().toUTCString()
    const location = [a.city, a.country].filter(Boolean).join(', ')
    return `
    <item>
      <title>${cdata(a.title)}</title>
      <link>${escape(url)}</link>
      <guid isPermaLink="true">${escape(url)}</guid>
      <description>${cdata(a.meta_description)}</description>
      <pubDate>${pubDate}</pubDate>
      ${location ? `<category>${cdata(location)}</category>` : ''}
    </item>`
  })

  const planItems = (plans ?? []).map((p) => {
    const planPath = toPlanUrl({ country: p.country, city: p.city, slug: p.slug })
    const url = `${BASE_URL}${planPath}`
    const pubDate = p.created_at ? new Date(p.created_at).toUTCString() : new Date().toUTCString()
    const location = [p.city, p.country].filter(Boolean).join(', ')
    return `
    <item>
      <title>${cdata(p.title)}</title>
      <link>${escape(url)}</link>
      <guid isPermaLink="true">${escape(url)}</guid>
      <description>${cdata(p.meta_description)}</description>
      <pubDate>${pubDate}</pubDate>
      ${location ? `<category>${cdata(location)}</category>` : ''}
    </item>`
  })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Kiravoy 여행 가이드</title>
    <link>${BASE_URL}</link>
    <description>전 세계 여행지 가이드와 맞춤 여행 일정. 커플, 가족, 친구, 혼자 여행까지 Kiravoy에서 완벽한 여행을 계획하세요.</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${BASE_URL}/og-image.jpg</url>
      <title>Kiravoy 여행 가이드</title>
      <link>${BASE_URL}</link>
    </image>
    ${articleItems.join('')}
    ${planItems.join('')}
  </channel>
</rss>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
