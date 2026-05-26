export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/auth/callback',
          '/*?*',
        ],
      },
    ],
    sitemap: [
      'https://kiravoy.com/sitemap.xml',
    ],
    host: 'https://kiravoy.com',
  }
}
