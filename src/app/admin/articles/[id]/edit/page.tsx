'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Save, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

const CATEGORIES = ['관광', '맛집', '자연', '문화', '쇼핑', '숙박', '교통', '액티비티']

interface ArticleForm {
  title: string
  slug: string
  meta_description: string
  content: string
  category: string
  city: string
  country: string
  published: boolean
}

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState<ArticleForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase
      .from('articles')
      .select('title, slug, meta_description, content, category, city, country, published')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          toast.error('아티클을 불러올 수 없습니다.')
          router.push('/admin/articles')
          return
        }
        setForm({
          title: data.title ?? '',
          slug: data.slug ?? '',
          meta_description: data.meta_description ?? '',
          content: data.content ?? '',
          category: data.category ?? '',
          city: data.city ?? '',
          country: data.country ?? '',
          published: data.published ?? false,
        })
        setLoading(false)
      })
  }, [id])

  const update = (field: keyof ArticleForm, value: string | boolean) => {
    setForm(prev => prev ? { ...prev, [field]: value } : prev)
  }

  const handleSave = async () => {
    if (!form) return
    setSaving(true)
    const { error } = await supabase
      .from('articles')
      .update({
        title: form.title,
        slug: form.slug,
        meta_description: form.meta_description,
        content: form.content,
        category: form.category,
        city: form.city,
        country: form.country,
        published: form.published,
      })
      .eq('id', id)

    setSaving(false)
    if (error) {
      toast.error(`저장 실패: ${error.message}`)
      return
    }
    toast.success('저장되었습니다.')
    router.push('/admin/articles')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!form) return null

  return (
    <div className="p-8 max-w-4xl">
      <Link href="/admin/articles" className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> 목록으로
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">아티클 수정</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          저장하기
        </button>
      </div>

      <div className="space-y-5">
        {/* 위치 정보 */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-4">위치</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">도시</label>
              <input
                value={form.city}
                onChange={e => update('city', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">국가</label>
              <input
                value={form.country}
                onChange={e => update('country', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 기본 정보 */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-4">기본 정보</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">제목</label>
              <input
                value={form.title}
                onChange={e => update('title', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">슬러그 (URL)</label>
              <input
                value={form.slug}
                onChange={e => update('slug', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">카테고리</label>
              <select
                value={form.category}
                onChange={e => update('category', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">선택 안 함</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">요약 (meta_description)</label>
              <textarea
                value={form.meta_description}
                onChange={e => update('meta_description', e.target.value)}
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* 본문 */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-4">본문 (Markdown)</h2>
          <textarea
            value={form.content}
            onChange={e => update('content', e.target.value)}
            rows={24}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500 resize-y"
          />
        </div>

        {/* 발행 설정 */}
        <div className="bg-white rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">발행 상태</p>
            <p className="text-xs text-gray-400 mt-0.5">체크하면 사이트에 즉시 노출됩니다</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={form.published}
              onChange={e => update('published', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
          </label>
        </div>

        {/* 하단 저장 버튼 */}
        <div className="flex justify-end gap-3 pb-4">
          <Link href="/admin/articles" className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50">
            취소
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            저장하기
          </button>
        </div>
      </div>
    </div>
  )
}
