'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Save, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/auth/login'); return }
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('username, bio')
        .eq('id', data.user.id)
        .single()
      if (profile) {
        setUsername(profile.username ?? '')
        setBio(profile.bio ?? '')
      }
      setLoading(false)
    })
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase
      .from('user_profiles')
      .upsert({ id: user.id, username, bio })
    setSaving(false)
    if (error) toast.error('저장에 실패했습니다.')
    else toast.success('프로필이 저장되었습니다.')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
        <User className="w-6 h-6 text-[var(--primary)]" /> 프로필 설정
      </h1>
      <form onSubmit={handleSave} className="space-y-4 bg-white rounded-[var(--radius)] border border-gray-100 p-6">
        <div>
          <label className="block text-sm font-medium mb-1">닉네임</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full border border-gray-200 rounded-[var(--radius)] px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">자기소개</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={4}
            placeholder="간단한 자기소개를 입력하세요"
            className="w-full border border-gray-200 rounded-[var(--radius)] px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)] resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-white font-semibold text-sm rounded-[var(--radius)] hover:bg-[var(--primary-hover)] disabled:opacity-60 transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          저장하기
        </button>
      </form>
    </div>
  )
}
