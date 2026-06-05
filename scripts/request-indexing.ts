/**
 * request-indexing.ts
 *
 * Prints priority URLs to submit to Google Search Console for indexing.
 * No API calls are made. Copy the URLs and submit them manually via:
 *   Google Search Console → URL Inspection → Request Indexing
 *
 * Run with: npx ts-node -e "import('./scripts/request-indexing.ts')"
 * or:        npx tsx scripts/request-indexing.ts
 */

const BASE_URL = 'https://kiravoy.com'

const PRIORITY_URLS: Array<{ url: string; reason: string }> = [
  // Core pages
  { url: `${BASE_URL}/`, reason: 'Homepage (KO)' },
  { url: `${BASE_URL}/en`, reason: 'Homepage (EN)' },

  // Listing pages
  { url: `${BASE_URL}/articles`, reason: 'Article listing (KO)' },
  { url: `${BASE_URL}/en/articles`, reason: 'Article listing (EN)' },
  { url: `${BASE_URL}/destinations`, reason: 'Destinations listing (KO)' },
  { url: `${BASE_URL}/en/destinations`, reason: 'Destinations listing (EN)' },

  // New SEO pages
  { url: `${BASE_URL}/latest-guides`, reason: 'Latest guides hub (daily crawl target)' },
  { url: `${BASE_URL}/latest-itineraries`, reason: 'Latest itineraries hub (daily crawl target)' },
  { url: `${BASE_URL}/trending`, reason: 'Trending content hub (daily crawl target)' },

  // Magazine
  { url: `${BASE_URL}/magazine`, reason: 'Magazine landing' },
  { url: `${BASE_URL}/magazine/tokyo-2026`, reason: 'Tokyo 2026 magazine issue' },

  // RSS feeds (for discovery)
  { url: `${BASE_URL}/feed.xml`, reason: 'RSS feed (KO) — helps Google discover new content' },
  { url: `${BASE_URL}/feed-en.xml`, reason: 'RSS feed (EN) — helps Google discover new content' },

  // Sitemap
  { url: `${BASE_URL}/sitemap.xml`, reason: 'XML sitemap — submit this in GSC as well' },
]

console.log('\n========================================================')
console.log('  Kiravoy — Priority URLs for Google Search Console')
console.log('========================================================\n')
console.log('Submit each URL via: GSC → URL Inspection → Request Indexing\n')

PRIORITY_URLS.forEach(({ url, reason }, idx) => {
  console.log(`${String(idx + 1).padStart(2, ' ')}. ${url}`)
  console.log(`    → ${reason}`)
})

console.log('\n--------------------------------------------------------')
console.log(`Total: ${PRIORITY_URLS.length} URLs`)
console.log('--------------------------------------------------------\n')
console.log('TIP: Also submit https://kiravoy.com/sitemap.xml')
console.log('     in GSC → Sitemaps for automatic bulk discovery.\n')
