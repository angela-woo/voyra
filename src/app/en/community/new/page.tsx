'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import ImageUploader from '@/components/community/ImageUploader'

const CATEGORIES = [
  { value: 'free', label: 'General' },
  { value: 'tips', label: 'Tips' },
  { value: 'question', label: 'Questions' },
  { value: 'review', label: 'Reviews' },
  { value: 'meetup', label: 'Meetups' },
]

export default function EnNewPostPage() {
  const router = useRouter()
  const supabase = createClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('free')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/auth/login'); return }
      setUserId(data.user.id)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      toast.error('Please enter a title and content.')
      return
    }
    setLoading(true)
    const res = await fetch('/api/community/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, category, image_urls: imageUrls }),
    })
    setLoading(false)
    if (res.status === 401) { toast.error('Please log in first.'); router.push('/auth/login'); return }
    if (!res.ok) { toast.error('Failed to publish post.'); return }
    const { id } = await res.json()
    toast.success('Post published!')
    router.push(`/en/community/${id}`)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/en/community" className="flex items-center gap-1 text-sm text-gray-500 hover:text-[var(--primary)] mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Community
      </Link>
      <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: 'var(--font-heading)' }}>Write a Post</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  category === cat.value
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Enter a title"
            maxLength={100}
            className="w-full border border-gray-200 rounded-[var(--radius)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Content</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write your post..."
            rows={10}
            className="w-full border border-gray-200 rounded-[var(--radius)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)] resize-y"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Images (up to 5, max 5MB each)</label>
          {userId && (
            <ImageUploader urls={imageUrls} onChange={setImageUrls} userId={userId} />
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[var(--primary)] text-white font-semibold text-sm rounded-[var(--radius)] hover:bg-[var(--primary-hover)] disabled:opacity-60 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Publish
          </button>
          <Link
            href="/en/community"
            className="px-6 py-2.5 border border-gray-200 text-gray-600 font-medium text-sm rounded-[var(--radius)] hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
