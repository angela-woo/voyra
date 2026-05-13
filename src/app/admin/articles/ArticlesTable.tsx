'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, Edit, Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface Article {
  id: string
  slug: string
  title: string
  published: boolean
  city: string | null
  country: string | null
  category: string | null
  created_at: string | null
}

interface DeleteModal {
  open: boolean
  id: string
  title: string
}

export default function ArticlesTable({ articles: initial }: { articles: Article[] }) {
  const router = useRouter()
  const supabase = createClient()

  const [articles, setArticles] = useState<Article[]>(initial)
  const [modal, setModal] = useState<DeleteModal>({ open: false, id: '', title: '' })
  const [deleting, setDeleting] = useState(false)

  const openModal = (id: string, title: string) => setModal({ open: true, id, title })
  const closeModal = () => setModal({ open: false, id: '', title: '' })

  const handleDelete = async () => {
    setDeleting(true)
    const { error } = await supabase.from('articles').delete().eq('id', modal.id)
    setDeleting(false)

    if (error) {
      toast.error(`삭제 실패: ${error.message}`)
      return
    }

    setArticles(prev => prev.filter(a => a.id !== modal.id))
    toast.success('아티클이 삭제되었습니다.')
    closeModal()
    router.refresh()
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
              <th className="px-4 py-3 font-medium">제목</th>
              <th className="px-4 py-3 font-medium">목적지</th>
              <th className="px-4 py-3 font-medium">카테고리</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium">날짜</th>
              <th className="px-4 py-3 font-medium">작업</th>
            </tr>
          </thead>
          <tbody>
            {articles.map(article => (
              <tr key={article.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium line-clamp-1">{article.title}</p>
                  <p className="text-xs text-gray-400">{article.slug}</p>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {[article.city, article.country].filter(Boolean).join(', ') || '—'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{article.category ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    article.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {article.published ? '발행' : '초안'}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {article.created_at
                    ? formatDistanceToNow(new Date(article.created_at), { addSuffix: true, locale: ko })
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/article/${article.slug}`}
                      target="_blank"
                      className="text-gray-400 hover:text-blue-500 transition-colors"
                      title="미리보기"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/admin/articles/${article.id}/edit`}
                      className="text-gray-400 hover:text-blue-500 transition-colors"
                      title="수정"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => openModal(article.id, article.title)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">
                  아직 아티클이 없습니다. AI로 첫 번째 아티클을 생성해보세요.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 삭제 확인 모달 */}
      {modal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-start gap-4 mb-5">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">아티클 삭제</h3>
                <p className="text-sm text-gray-500">
                  아래 아티클을 삭제하면 복구할 수 없습니다.
                </p>
                <p className="text-sm font-medium text-gray-800 mt-2 bg-gray-50 rounded-lg px-3 py-2">
                  {modal.title}
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={closeModal}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
