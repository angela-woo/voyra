'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, Loader2, Save, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface GeneratedArticle {
  title: string
  slug: string
  meta_description: string
  content: string
  category: string
  city: string
  country: string
}

export default function NewArticlePage() {
  const router = useRouter()
  const supabase = createClient()

  const [destination, setDestination] = useState('')
  const [topic, setTopic] = useState('')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generated, setGenerated] = useState<GeneratedArticle | null>(null)
  const [editedContent, setEditedContent] = useState('')
  const [published, setPublished] = useState(false)

  const handleGenerate = async () => {
    if (!destination.trim()) { toast.error('여행지를 입력해주세요.'); return }
    setGenerating(true)
    try {
      const res = await fetch('/api/admin/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, topic }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data: GeneratedArticle = await res.json()
      setGenerated(data)
      setEditedContent(data.content)
    } catch (e) {
      toast.error('콘텐츠 생성에 실패했습니다. API 키를 확인해주세요.')
      console.error(e)
    } finally {
      setGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!generated) return
    setSaving(true)
    const { error } = await supabase.from('articles').insert({
      title: generated.title,
      slug: generated.slug,
      meta_description: generated.meta_description,
      content: editedContent,
      category: generated.category,
      city: generated.city,
      country: generated.country,
      published,
    })
    setSaving(false)
    if (error) { toast.error(`저장 실패: ${error.message}`); return }
    toast.success('아티클이 저장되었습니다.')
    router.push('/admin/articles')
  }

  return (
    <div className="p-8 max-w-4xl">
      <Link href="/admin/articles" className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> 목록으로
      </Link>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-yellow-500" />
        AI 아티클 생성
      </h1>

      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">여행지 *</label>
            <input
              value={destination}
              onChange={e => setDestination(e.target.value)}
              placeholder="예: 도쿄, 파리, 발리..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">주제 (선택)</label>
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="예: 맛집, 숨겨진 명소, 예산 여행..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating || !destination.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-yellow-500 text-white font-semibold text-sm rounded-lg hover:bg-yellow-600 disabled:opacity-60 transition-colors"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {generating ? 'Claude가 작성 중...' : 'AI로 생성하기'}
        </button>
      </div>

      {generated && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold mb-4">생성된 아티클 편집</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">도시</label>
                <input
                  value={generated.city}
                  onChange={e => setGenerated(prev => prev ? { ...prev, city: e.target.value } : prev)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">국가</label>
                <input
                  value={generated.country}
                  onChange={e => setGenerated(prev => prev ? { ...prev, country: e.target.value } : prev)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">제목</label>
              <input
                value={generated.title}
                onChange={e => setGenerated(prev => prev ? { ...prev, title: e.target.value } : prev)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">요약 (meta_description)</label>
              <textarea
                value={generated.meta_description}
                onChange={e => setGenerated(prev => prev ? { ...prev, meta_description: e.target.value } : prev)}
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">본문 (Markdown)</label>
              <textarea
                value={editedContent}
                onChange={e => setEditedContent(e.target.value)}
                rows={20}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500 resize-y"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={e => setPublished(e.target.checked)}
                  className="rounded"
                />
                즉시 발행
              </label>
              <div className="flex-1" />
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
