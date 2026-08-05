/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: '**' },
    ],
  },
  async redirects() {
    return [
      { source: '/article/:slug/', destination: '/article/:slug', permanent: true },
      { source: '/destinations/:country/:city/:slug/', destination: '/destinations/:country/:city/:slug', permanent: true },
      { source: '/en/article/:slug/', destination: '/en/article/:slug', permanent: true },
      { source: '/en/destinations/:country/:city/:slug/', destination: '/en/destinations/:country/:city/:slug', permanent: true },
      // Group A: EN travel-guide → complete-guide 301 consolidation
      { source: '/en/article/amsterdam-travel-guide-en', destination: '/en/article/amsterdam-complete-guide-en', permanent: true },
      { source: '/article/amsterdam-travel-guide-en', destination: '/en/article/amsterdam-complete-guide-en', permanent: true },
      { source: '/en/article/los-angeles-travel-guide-en', destination: '/en/article/los-angeles-complete-guide-en', permanent: true },
      { source: '/article/los-angeles-travel-guide-en', destination: '/en/article/los-angeles-complete-guide-en', permanent: true },
      { source: '/en/article/rome-travel-guide-en', destination: '/en/article/rome-complete-guide-en', permanent: true },
      { source: '/article/rome-travel-guide-en', destination: '/en/article/rome-complete-guide-en', permanent: true },
      { source: '/en/article/sydney-travel-guide-en', destination: '/en/article/sydney-complete-guide-en', permanent: true },
      { source: '/article/sydney-travel-guide-en', destination: '/en/article/sydney-complete-guide-en', permanent: true },
      // Group B: KO complete-guide → live KO article 301 consolidation
      { source: '/article/fukuoka-complete-guide-ko', destination: '/article/fukuoka-travel-guide-for-korean-travelers-2024', permanent: true },
      { source: '/en/article/fukuoka-complete-guide-ko', destination: '/article/fukuoka-travel-guide-for-korean-travelers-2024', permanent: true },
      { source: '/article/cebu-complete-guide-ko', destination: '/article/cebu-philippines-travel-guide-for-koreans-2024', permanent: true },
      { source: '/en/article/cebu-complete-guide-ko', destination: '/article/cebu-philippines-travel-guide-for-koreans-2024', permanent: true },
      { source: '/article/hanoi-complete-guide-ko', destination: '/article/hanoi-vietnam-travel-guide', permanent: true },
      { source: '/en/article/hanoi-complete-guide-ko', destination: '/article/hanoi-vietnam-travel-guide', permanent: true },
      { source: '/article/ho-chi-minh-complete-guide-ko', destination: '/article/ho-chi-minh-city-complete-travel-guide', permanent: true },
      { source: '/en/article/ho-chi-minh-complete-guide-ko', destination: '/article/ho-chi-minh-city-complete-travel-guide', permanent: true },
      // Group C: EN duplicate content 301 consolidation (AdSense manual action remediation, 2026-08)
      { source: '/article/da-nang-beach-guide-en', destination: '/en/article/da-nang-travel-guide-en', permanent: true },
      { source: '/en/article/da-nang-beach-guide-en', destination: '/en/article/da-nang-travel-guide-en', permanent: true },
      { source: '/article/phuket-travel-guide-en', destination: '/en/article/phuket-beach-guide-en', permanent: true },
      { source: '/en/article/phuket-travel-guide-en', destination: '/en/article/phuket-beach-guide-en', permanent: true },
      { source: '/article/ho-chi-minh-city-travel-guide-en', destination: '/en/article/ho-chi-minh-city-travel-tips-en', permanent: true },
      { source: '/en/article/ho-chi-minh-city-travel-guide-en', destination: '/en/article/ho-chi-minh-city-travel-tips-en', permanent: true },
      // Doorway page consolidation: city travel-style variants → single enriched itinerary (AdSense manual action remediation, 2026-08)
      { source: '/destinations/spain/barcelona/barcelona-friends-3days', destination: '/destinations/spain/barcelona/barcelona-solo-3days', permanent: true },
      { source: '/destinations/spain/barcelona/barcelona-couple-3days', destination: '/destinations/spain/barcelona/barcelona-solo-3days', permanent: true },
      { source: '/destinations/spain/barcelona/barcelona-family-4days', destination: '/destinations/spain/barcelona/barcelona-solo-3days', permanent: true },
      { source: '/destinations/japan/kyoto/kyoto-family-4days', destination: '/destinations/japan/kyoto/kyoto-solo-3days', permanent: true },
      { source: '/destinations/japan/kyoto/kyoto-couple-3days', destination: '/destinations/japan/kyoto/kyoto-solo-3days', permanent: true },
      { source: '/destinations/japan/kyoto/kyoto-friends-3days', destination: '/destinations/japan/kyoto/kyoto-solo-3days', permanent: true },
      { source: '/destinations/vietnam/hanoi/hanoi-friends-3days', destination: '/destinations/vietnam/hanoi/hanoi-couple-3days', permanent: true },
      { source: '/destinations/vietnam/hanoi/hanoi-solo-2days', destination: '/destinations/vietnam/hanoi/hanoi-couple-3days', permanent: true },
      { source: '/destinations/singapore/singapore/singapore-couple-3days', destination: '/destinations/singapore/singapore/singapore-solo-3days', permanent: true },
      { source: '/destinations/singapore/singapore/singapore-family-4days', destination: '/destinations/singapore/singapore/singapore-solo-3days', permanent: true },
      { source: '/destinations/singapore/singapore/singapore-friends-3days', destination: '/destinations/singapore/singapore/singapore-solo-3days', permanent: true },
      { source: '/destinations/indonesia/bali/bali-family-4days', destination: '/destinations/indonesia/bali/bali-solo-3days', permanent: true },
      { source: '/destinations/indonesia/bali/bali-friends-3days', destination: '/destinations/indonesia/bali/bali-solo-3days', permanent: true },
      { source: '/destinations/indonesia/bali/bali-couple-3days', destination: '/destinations/indonesia/bali/bali-solo-3days', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://www.googletagmanager.com https://partner.googleadservices.com https://tpc.googlesyndication.com https://ep1.adtrafficquality.google https://static.cloudflareinsights.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "frame-src https://www.google.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
              "connect-src 'self' https://*.supabase.co https://api.unsplash.com https://api.open-meteo.com https://pagead2.googlesyndication.com https://ep1.adtrafficquality.google https://*.doubleclick.net https://googleads.g.doubleclick.net https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://www.googletagmanager.com https://www.google.com",
              "worker-src 'self' blob:",
            ].join('; '),
          },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/article/:slug',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/en/article/:slug',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/destinations/:country/:city/:slug',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/en/destinations/:country/:city/:slug',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' },
        ],
      },
    ]
  },
}

export default nextConfig
