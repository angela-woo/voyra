import type { Metadata } from 'next'
import { Noto_Sans_KR } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Toaster } from 'react-hot-toast'

const notoSansKR = Noto_Sans_KR({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-kr' })

export const metadata: Metadata = {
  metadataBase: new URL('https://kiravoy.com'),
  title: {
    default: 'Kiravoy — 빛나는 여행의 시작',
    template: '%s | Kiravoy',
  },
  description: '전 세계 여행지 가이드와 맞춤 여행 일정. 커플, 가족, 친구, 혼자 여행까지 Kiravoy에서 완벽한 여행을 계획하세요.',
  keywords: ['여행', '여행가이드', '여행일정', '해외여행', '도쿄여행', '파리여행', '발리여행', '방콕여행', '싱가포르여행'],
  authors: [{ name: 'Kiravoy' }],
  creator: 'Kiravoy',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://kiravoy.com',
    siteName: 'Kiravoy',
    title: 'Kiravoy — 빛나는 여행의 시작',
    description: '전 세계 여행지 가이드와 맞춤 여행 일정',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Kiravoy 여행 가이드' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kiravoy — 빛나는 여행의 시작',
    description: '전 세계 여행지 가이드와 맞춤 여행 일정',
    images: ['/og-image.jpg'],
  },
  verification: {
    google: 'adsWS-dLWCg1bUDwvbJSTq_-Cbrpl40LtvHGRIjPUMQ',
    other: {
      'naver-site-verification': 'ef62af1badd4fb9e92a943fbccbb0153',
    },
  },
  alternates: {
    canonical: 'https://kiravoy.com',
    languages: { ko: 'https://kiravoy.com', en: 'https://kiravoy.com/en' },
    types: {
      'application/rss+xml': [
        { url: 'https://kiravoy.com/feed.xml', title: 'Kiravoy 여행 가이드' },
        { url: 'https://kiravoy.com/feed-en.xml', title: 'Kiravoy Travel Guides (EN)' },
      ],
    },
  },
  other: {
    'agd-partner-manual-verification': '',
  },
}

interface SiteSettings {
  key: string
  value: string
}

async function getSiteSettings(): Promise<Record<string, string>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return {}
  try {
    // Use direct client (no cookies) – site_settings is public read-only data
    const supabase = createSupabaseClient(url, key)
    const { data } = await supabase.from('site_settings').select('key, value')
    if (!data) return {}
    return Object.fromEntries((data as SiteSettings[]).map(r => [r.key, r.value]))
  } catch {
    return {}
  }
}

function adjustColor(hex: string, amount: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, n))
  const h = hex.replace('#', '')
  const r = clamp(parseInt(h.substring(0, 2), 16) + amount)
  const g = clamp(parseInt(h.substring(2, 4), 16) + amount)
  const b = clamp(parseInt(h.substring(4, 6), 16) + amount)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function buildCssVars(settings: Record<string, string>): string {
  const primary = settings.primary_color || '#FF5722'
  const bg = settings.background_color || '#ffffff'
  const radius = settings.border_radius || '12'
  const fontHeadingName = settings.font_heading || 'Noto Sans KR'
  const fontBodyName = settings.font_body || 'Noto Sans KR'
  const toFontVar = (name: string) =>
    name === 'Noto Sans KR' ? 'var(--font-kr), sans-serif' : `'${name}', sans-serif`

  return [
    `--primary: ${primary}`,
    `--primary-hover: ${adjustColor(primary, -20)}`,
    `--bg: ${bg}`,
    `--bg-secondary: ${adjustColor(bg, bg === '#ffffff' ? -5 : 5)}`,
    `--radius: ${radius}px`,
    `--font-heading: ${toFontVar(fontHeadingName)}`,
    `--font-body: ${toFontVar(fontBodyName)}`,
  ].join('; ')
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()
  const cssVars = buildCssVars(settings)
  const siteName = settings.site_name || 'Kiravoy'

  return (
    <html lang="ko" className={notoSansKR.variable}>
      <head>
        <style>{`:root { ${cssVars} }`}</style>
        <link rel="alternate" hrefLang="ko" href="https://kiravoy.com/" />
        <link rel="alternate" hrefLang="en" href="https://kiravoy.com/en/" />
        <link rel="alternate" hrefLang="x-default" href="https://kiravoy.com/" />
      </head>
      <body className="bg-[var(--bg)] font-[family-name:var(--font-body)] text-gray-900 min-h-screen flex flex-col">
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4411523591483681"
          async
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Toaster position="top-right" />
        <Header siteName={siteName} />
        <main className="flex-1">{children}</main>
        <Footer siteName={siteName} />
      </body>
    </html>
  )
}
