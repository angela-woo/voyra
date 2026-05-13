'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ImagePlus, X, Loader2 } from 'lucide-react'
import Image from 'next/image'

const MAX_FILES = 5
const MAX_MB = 5

interface Props {
  urls: string[]
  onChange: (urls: string[]) => void
  userId: string
}

export default function ImageUploader({ urls, onChange, userId }: Props) {
  const [uploading, setUploading] = useState<Record<string, boolean>>({})
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFiles = async (files: FileList) => {
    const remaining = MAX_FILES - urls.length
    const selected = Array.from(files).slice(0, remaining)

    for (const file of selected) {
      if (file.size > MAX_MB * 1024 * 1024) {
        alert(`${file.name}: 파일 크기는 ${MAX_MB}MB 이하여야 합니다.`)
        continue
      }
      const key = `${Date.now()}-${file.name}`
      setUploading(prev => ({ ...prev, [key]: true }))

      const path = `${userId}/${key}`
      const { data, error } = await supabase.storage
        .from('community-images')
        .upload(path, file, { contentType: file.type })

      setUploading(prev => { const next = { ...prev }; delete next[key]; return next })

      if (error) { alert('업로드 실패: ' + error.message); continue }

      const { data: { publicUrl } } = supabase.storage
        .from('community-images')
        .getPublicUrl(data.path)

      onChange([...urls, publicUrl])
    }
  }

  const remove = async (url: string) => {
    const path = url.split('/community-images/')[1]
    if (path) await supabase.storage.from('community-images').remove([path])
    onChange(urls.filter(u => u !== url))
  }

  const isUploading = Object.keys(uploading).length > 0

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {urls.map(url => (
          <div key={url} className="relative w-24 h-24 rounded-[var(--radius)] overflow-hidden border border-gray-200 group">
            <Image src={url} alt="" fill className="object-cover" />
            <button
              type="button"
              onClick={() => remove(url)}
              className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {isUploading && (
          <div className="w-24 h-24 rounded-[var(--radius)] border border-gray-200 flex items-center justify-center bg-gray-50">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        )}

        {urls.length < MAX_FILES && !isUploading && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-24 h-24 rounded-[var(--radius)] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
          >
            <ImagePlus className="w-5 h-5" />
            <span className="text-xs">이미지 추가</span>
          </button>
        )}
      </div>
      {urls.length > 0 && (
        <p className="text-xs text-gray-400 mt-1">{urls.length}/{MAX_FILES}개 · 호버하면 삭제</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={e => e.target.files && handleFiles(e.target.files)}
      />
    </div>
  )
}
