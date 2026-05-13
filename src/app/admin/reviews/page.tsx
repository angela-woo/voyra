import { createClient } from '@/lib/supabase/server'
import ReviewsTable from './ReviewsTable'

export const dynamic = 'force-dynamic'

export default async function AdminReviewsPage() {
  const supabase = await createClient()
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, user_profiles(username), articles(title)')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">리뷰 관리</h1>
      <ReviewsTable reviews={reviews ?? []} />
    </div>
  )
}
