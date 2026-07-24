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
    <div className="max-w-[var(--measure)] mx-auto px-6 py-16">
      <Link href="/en/community" className="link-underline flex items-center gap-1 text-sm text-[color:var(--ink-soft)] mb-8 w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Community
      </Link>
      <h1 className="editorial-heading text-3xl mb-8">Write a Post</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs text-[color:var(--ink-soft)] mb-2">Category</label>
          <div className="flex gap-5 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`text-sm transition-colors ${
                  category === cat.value
                    ? 'text-[color:var(--ink)] underline underline-offset-4'
                    : 'text-[color:var(--ink-faint)] hover:text-[color:var(--ink-soft)]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-[color:var(--ink-soft)] mb-1.5">Title</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Enter a title"
            maxLength={100}
            className="w-full border border-[var(--border)] px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[color:var(--ink)]"
          />
        </div>

        <div>
          <label className="block text-xs text-[color:var(--ink-soft)] mb-1.5">Content</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write your post..."
            rows={10}
            className="w-full border border-[var(--border)] px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[color:var(--ink)] resize-y"
          />
        </div>

        <div>
          <label className="block text-xs text-[color:var(--ink-soft)] mb-2">Images (up to 5, max 5MB each)</label>
          {userId && (
            <ImageUploader urls={imageUrls} onChange={setImageUrls} userId={userId} />
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn">
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Publish
          </button>
          <Link href="/en/community" className="btn" style={{ borderColor: 'var(--border)', color: 'var(--ink-soft)' }}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
