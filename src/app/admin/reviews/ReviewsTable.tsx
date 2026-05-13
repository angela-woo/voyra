'use client'

import { useState } from 'react'
import { Star, Check, X, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface Review {
  id: string
  rating: number
  content: string
  created_at: string
  approved: boolean
  author_name: string | null
  user_profiles?: { username: string | null } | null
  articles?: { title: string | null } | null
}

export default function ReviewsTable({ reviews: initial }: { reviews: Review[] }) {
  const supabase = createClient()
  const [reviews, setReviews] = useState<Review[]>(initial)
  const [pending, setPending] = useState<string | null>(null) // ID being updated

  const updateApproval = async (id: string, approved: boolean) => {
    setPending(id)
    const { error } = await supabase
      .from('reviews')
      .update({ approved })
      .eq('id', id)
    setPending(null)

    if (error) {
      toast.error(`처리 실패: ${error.message}`)
      return
    }

    setReviews(prev => prev.map(r => r.id === id ? { ...r, approved } : r))
    toast.success(approved ? '승인되었습니다.' : '거절되었습니다.')
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
            <th className="px-4 py-3 font-medium">사용자</th>
            <th className="px-4 py-3 font-medium">아티클</th>
            <th className="px-4 py-3 font-medium">평점</th>
            <th className="px-4 py-3 font-medium">내용</th>
            <th className="px-4 py-3 font-medium">날짜</th>
            <th className="px-4 py-3 font-medium">상태</th>
            <th className="px-4 py-3 font-medium">작업</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map(review => {
            const isLoading = pending === review.id
            return (
              <tr key={review.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm">
                  {review.user_profiles?.username ?? review.author_name ?? '익명'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 max-w-[180px]">
                  <p className="line-clamp-1">{review.articles?.title ?? '—'}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-400 fill-current' : 'text-gray-200'}`}
                      />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 max-w-sm">
                  <p className="line-clamp-2">{review.content}</p>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                  {formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: ko })}
                </td>
                <td className="px-4 py-3">
                  {review.approved ? (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3" /> 승인
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                      <X className="w-3 h-3" /> 대기
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    ) : review.approved ? (
                      /* 승인된 상태 → 거절 버튼만 */
                      <button
                        onClick={() => updateApproval(review.id, false)}
                        className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <X className="w-3 h-3" /> 거절
                      </button>
                    ) : (
                      /* 대기 상태 → 승인 + 거절 버튼 */
                      <>
                        <button
                          onClick={() => updateApproval(review.id, true)}
                          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-green-200 text-green-600 hover:bg-green-50 transition-colors"
                        >
                          <Check className="w-3 h-3" /> 승인
                        </button>
                        <button
                          onClick={() => updateApproval(review.id, false)}
                          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <X className="w-3 h-3" /> 거절
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
          {reviews.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">
                리뷰가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
