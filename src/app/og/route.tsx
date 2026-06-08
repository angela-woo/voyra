import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

const BASE_URL = 'https://kiravoy.com'
const W = 1200
const H = 630

function truncate(text: string, max: number): string {
  if (!text) return ''
  if (text.length <= max) return text
  return text.slice(0, max - 1) + '…'
}

async function loadFont(url: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } })
    if (!res.ok) return null
    return res.arrayBuffer()
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const title = truncate(searchParams.get('title') ?? 'Kiravoy', 60)
  const description = truncate(searchParams.get('description') ?? '한국인을 위한 여행 가이드', 100)
  const type = searchParams.get('type') ?? 'default'

  const badge =
    type === 'article' ? '✈ Guide' :
    type === 'destination' ? '📍 Destination' :
    null

  // Noto Sans KR Regular — subset for Latin + Hangul
  const fontData = await loadFont(
    'https://fonts.gstatic.com/s/notosanskr/v36/PbykFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzuoyeLTq8H4hfeE.0.woff'
  )

  const options: ConstructorParameters<typeof ImageResponse>[1] = {
    width: W,
    height: H,
  }
  if (fontData) {
    options.fonts = [
      { name: 'NotoSansKR', data: fontData, weight: 400, style: 'normal' },
    ]
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 72px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #1a1a2e 100%)',
          fontFamily: fontData ? 'NotoSansKR, sans-serif' : 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background accent */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -120,
            width: 480,
            height: 480,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,87,34,0.18) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,87,34,0.10) 0%, transparent 70%)',
          }}
        />

        {/* Top: logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#FF5722',
            }}
          />
          <span style={{ color: '#FF5722', fontSize: 22, fontWeight: 700, letterSpacing: '0.12em' }}>
            KIRAVOY
          </span>
        </div>

        {/* Center: title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              color: '#ffffff',
              fontSize: title.length > 30 ? 52 : 64,
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
              maxWidth: 900,
            }}
          >
            {title}
          </div>

          {description && (
            <div
              style={{
                color: '#94a3b8',
                fontSize: 26,
                lineHeight: 1.5,
                maxWidth: 820,
              }}
            >
              {description}
            </div>
          )}
        </div>

        {/* Bottom row: site info + badge */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 4,
                height: 28,
                borderRadius: 2,
                background: '#FF5722',
              }}
            />
            <span style={{ color: '#64748b', fontSize: 20 }}>kiravoy.com</span>
          </div>

          {badge && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255,87,34,0.15)',
                border: '1px solid rgba(255,87,34,0.4)',
                borderRadius: 8,
                padding: '10px 20px',
                color: '#FF5722',
                fontSize: 20,
                fontWeight: 600,
                letterSpacing: '0.04em',
              }}
            >
              {badge}
            </div>
          )}
        </div>
      </div>
    ),
    options,
  )
}
