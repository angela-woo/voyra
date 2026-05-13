import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: 'Voyra – AI-Powered Travel Guides',
  description: 'Discover the world with AI-powered travel guides',
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
  const primary = settings.primary_color || '#2563eb'
  const bg = settings.background_color || settings.bg_color || '#ffffff'
  const radius = settings.border_radius || '8'
  const fontHeading = settings.font_heading || 'Playfair Display'
  const fontBody = settings.font_body || 'Inter'

  return [
    `--primary: ${primary}`,
    `--primary-hover: ${adjustColor(primary, -20)}`,
    `--bg: ${bg}`,
    `--bg-secondary: ${adjustColor(bg, bg === '#ffffff' ? -5 : 5)}`,
    `--radius: ${radius}px`,
    `--font-heading: '${fontHeading}', serif`,
    `--font-body: '${fontBody}', sans-serif`,
  ].join('; ')
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()
  const cssVars = buildCssVars(settings)
  const siteName = settings.site_name || 'Voyra'

  return (
    <html lang="ko" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <style>{`:root { ${cssVars} }`}</style>
      </head>
      <body className="bg-[var(--bg)] font-[family-name:var(--font-body)] text-gray-900 min-h-screen flex flex-col">
        <Toaster position="top-right" />
        <Header siteName={siteName} />
        <main className="flex-1">{children}</main>
        <Footer siteName={siteName} />
      </body>
    </html>
  )
}
