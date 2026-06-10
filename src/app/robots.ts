const DISALLOW = ['/admin/', '/api/', '/auth/callback', '/*?*'] as const

export default function robots() {
  return {
    rules: [
      {
        userAgent: 'Yeti', // 네이버 크롤러
        allow: '/',
        disallow: ['/admin/', '/api/', '/auth/callback'],
      },
      { userAgent: 'Googlebot', allow: '/', disallow: [...DISALLOW] },
      { userAgent: 'GPTBot', allow: '/', disallow: [...DISALLOW] },
      { userAgent: 'ClaudeBot', allow: '/', disallow: [...DISALLOW] },
      { userAgent: 'PerplexityBot', allow: '/', disallow: [...DISALLOW] },
      { userAgent: '*', allow: '/', disallow: [...DISALLOW] },
    ],
    sitemap: 'https://kiravoy.com/sitemap.xml',
    host: 'https://kiravoy.com',
  }
}
