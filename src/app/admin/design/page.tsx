'use client'

import { useEffect, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Save, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

interface DesignSettings {
  primary_color: string
  background_color: string
  border_radius: string
  font_heading: string
  font_body: string
  site_name: string
  site_description: string
}

const FONTS_HEADING = ['Playfair Display', 'Georgia', 'Merriweather', 'Lora']
const FONTS_BODY = ['Inter', 'Roboto', 'Open Sans', 'Nunito']

const defaults: DesignSettings = {
  primary_color: '#2563eb',
  background_color: '#ffffff',
  border_radius: '8',
  font_heading: 'Playfair Display',
  font_body: 'Inter',
  site_name: 'Voyra',
  site_description: 'Discover the world with expert travel guides curated by Voyra.',
}

export default function AdminDesignPage() {
  const supabase = createClient()
  const [settings, setSettings] = useState<DesignSettings>(defaults)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeColorPicker, setActiveColorPicker] = useState<'primary' | 'bg' | null>(null)

  useEffect(() => {
    supabase.from('site_settings').select('key, value').then(({ data }) => {
      if (data) {
        const map = Object.fromEntries(data.map(r => [r.key, r.value]))
        setSettings(prev => ({ ...prev, ...map }))
      }
      setLoading(false)
    })
  }, [])

  const updateSetting = (key: keyof DesignSettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch('/api/admin/design', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    setSaving(false)
    if (!res.ok) toast.error('저장에 실패했습니다.')
    else toast.success('디자인 설정이 저장되었습니다. 페이지를 새로고침하면 적용됩니다.')
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
  }

  const previewStyle = {
    '--primary': settings.primary_color,
    '--radius': `${settings.border_radius}px`,
    '--font-heading': `'${settings.font_heading}', serif`,
  } as React.CSSProperties

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">디자인 설정</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          저장하기
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Settings */}
        <div className="space-y-6">
          {/* Site info */}
          <section className="bg-white rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold mb-4">사이트 정보</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">사이트명</label>
                <input
                  value={settings.site_name}
                  onChange={e => updateSetting('site_name', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">설명</label>
                <input
                  value={settings.site_description}
                  onChange={e => updateSetting('site_description', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </section>

          {/* Colors */}
          <section className="bg-white rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold mb-4">색상</h2>
            <div className="space-y-4">
              {/* Primary color */}
              <div>
                <label className="block text-sm font-medium mb-2">주요 색상</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveColorPicker(activeColorPicker === 'primary' ? null : 'primary')}
                    className="w-10 h-10 rounded-lg border border-gray-200 shadow-sm"
                    style={{ backgroundColor: settings.primary_color }}
                  />
                  <input
                    value={settings.primary_color}
                    onChange={e => updateSetting('primary_color', e.target.value)}
                    className="w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                {activeColorPicker === 'primary' && (
                  <div className="mt-3">
                    <HexColorPicker color={settings.primary_color} onChange={v => updateSetting('primary_color', v)} />
                  </div>
                )}
              </div>
              {/* BG color */}
              <div>
                <label className="block text-sm font-medium mb-2">배경 색상</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveColorPicker(activeColorPicker === 'bg' ? null : 'bg')}
                    className="w-10 h-10 rounded-lg border border-gray-200 shadow-sm"
                    style={{ backgroundColor: settings.background_color }}
                  />
                  <input
                    value={settings.background_color}
                    onChange={e => updateSetting('background_color', e.target.value)}
                    className="w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                {activeColorPicker === 'bg' && (
                  <div className="mt-3">
                    <HexColorPicker color={settings.background_color} onChange={v => updateSetting('background_color', v)} />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Border radius */}
          <section className="bg-white rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold mb-4">Border Radius</h2>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="24"
                value={settings.border_radius}
                onChange={e => updateSetting('border_radius', e.target.value)}
                className="flex-1 accent-blue-600"
              />
              <span className="text-sm font-mono w-12 text-center">{settings.border_radius}px</span>
            </div>
          </section>

          {/* Fonts */}
          <section className="bg-white rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold mb-4">폰트</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">제목 폰트</label>
                <select
                  value={settings.font_heading}
                  onChange={e => updateSetting('font_heading', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                >
                  {FONTS_HEADING.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">본문 폰트</label>
                <select
                  value={settings.font_body}
                  onChange={e => updateSetting('font_body', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                >
                  {FONTS_BODY.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
            </div>
          </section>
        </div>

        {/* Preview */}
        <div className="sticky top-4">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
              <Eye className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium">미리보기</span>
            </div>
            <div className="p-6" style={previewStyle}>
              <div className="mb-4 p-4 rounded-[var(--radius)] border-2 border-[var(--primary)]">
                <h3 className="font-bold text-lg mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                  {settings.site_name}
                </h3>
                <p className="text-xs text-gray-500">{settings.site_description}</p>
              </div>
              <button
                className="w-full py-2.5 rounded-[var(--radius)] text-white text-sm font-semibold mb-3"
                style={{ backgroundColor: settings.primary_color }}
              >
                주요 버튼
              </button>
              <div className="p-3 rounded-[var(--radius)] bg-gray-50 text-xs text-gray-600">
                <p style={{ fontFamily: 'var(--font-heading)' }} className="font-bold mb-1">제목 폰트 샘플</p>
                본문 텍스트 샘플입니다. 여행 가이드 내용이 이 폰트로 표시됩니다.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
