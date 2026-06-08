import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { toPlanUrl } from '@/lib/location'

/**
 * tags 매핑 (스키마에 tags 컬럼 없음):
 *   type='article' → tags[0]=category, tags[1]=city
 *   type='plan'    → tags[0]=travel_type, tags[1]=city
 *
 * 두 경우 모두 articles 최대 3개 + travel_plans 최대 2개를 조회해 교차 링크 제공.
 */
interface InternalLinksProps {
  currentSlug: string
  tags: string[]
  type: 'article' | 'plan'
  language?: 'ko' | 'en'
}

interface ArticleRow {
  slug: string
  title: string
  cover_image_url: string | null
  city: string | null
  category: string | null
}

interface PlanRow {
  slug: string
  title: string
  city: string
  country: string
  travel_type: string
  days: number
}

export default async function InternalLinks({
  currentSlug,
  tags,
  type,
  language = 'ko',
}: InternalLinksProps) {
  if (tags.length === 0) return null

  const supabase = await createClient()

  // tags[0] = category(article) | travel_type(plan)
  // tags[1] = city (공통)
  const primaryTag = tags[0] ?? ''
  const cityTag = tags[1] ?? ''

  const articleFilterCol = type === 'article' ? 'category' : 'city'
  const articleFilterVal = type === 'article' ? primaryTag : cityTag

  const planFilterCol = type === 'article' ? 'city' : 'travel_type'
  const planFilterVal = type === 'article' ? cityTag : primaryTag

  const [articlesResult, plansResult] = await Promise.all([
    articleFilterVal
      ? supabase
          .from('articles')
          .select('slug, title, cover_image_url, city, category')
          .eq('published', true)
          .eq('language', language)
          .eq(articleFilterCol, articleFilterVal)
          .neq('slug', currentSlug)
          .order('created_at', { ascending: false })
          .limit(3)
      : Promise.resolve({ data: [] }),

    planFilterVal
      ? supabase
          .from('travel_plans')
          .select('slug, title, city, country, travel_type, days')
          .eq('published', true)
          .eq(planFilterCol, planFilterVal)
          .neq('slug', currentSlug)
          .order('created_at', { ascending: false })
          .limit(2)
      : Promise.resolve({ data: [] }),
  ])

  const articles = (articlesResult.data ?? []) as ArticleRow[]
  const plans = (plansResult.data ?? []) as PlanRow[]

  if (articles.length === 0 && plans.length === 0) return null

  const articlePath = language === 'ko' ? '/article' : '/en/article'

  const TRAVEL_TYPE_LABELS: Record<string, string> = {
    couple: '커플', family: '가족', friends: '친구', solo: '혼자',
  }

  return (
    <div className="not-prose my-8 rounded-xl bg-gray-50 border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-5 rounded-full shrink-0" style={{ backgroundColor: '#FF5722' }} />
        <h2 className="text-sm font-bold text-gray-700 tracking-wide">관련 콘텐츠</h2>
      </div>

      <ul className="space-y-2">
        {articles.map(a => (
          <li key={`a-${a.slug}`}>
            <Link
              href={`${articlePath}/${a.slug}`}
              className="flex items-start gap-2 text-sm text-gray-700 hover:text-[#FF5722] transition-colors group"
            >
              <span className="shrink-0 mt-0.5">📖</span>
              <span className="line-clamp-2 group-hover:underline underline-offset-2">
                {a.title}
              </span>
            </Link>
          </li>
        ))}

        {plans.map(p => {
          const planPath = toPlanUrl({ country: p.country, city: p.city, slug: p.slug })
          const typeLabel = TRAVEL_TYPE_LABELS[p.travel_type] ?? p.travel_type
          return (
            <li key={`p-${p.slug}`}>
              <Link
                href={planPath}
                className="flex items-start gap-2 text-sm text-gray-700 hover:text-[#FF5722] transition-colors group"
              >
                <span className="shrink-0 mt-0.5">🗺️</span>
                <span className="line-clamp-2 group-hover:underline underline-offset-2">
                  {p.title}
                  <span className="ml-1.5 text-xs text-gray-400">
                    {typeLabel} · {p.days}일
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
