import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { destination, topic } = await req.json()
  if (!destination) return NextResponse.json({ error: 'destination required' }, { status: 400 })

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const prompt = `여행 블로그 아티클을 작성해주세요.

여행지: ${destination}
${topic ? `주제: ${topic}` : ''}

다음 JSON 형식으로 응답해주세요 (마크다운 코드블록 없이 순수 JSON만):
{
  "title": "매력적인 아티클 제목 (한국어)",
  "slug": "url-friendly-slug-in-english",
  "meta_description": "150자 이내 요약 (한국어)",
  "content": "마크다운 형식의 본문 (1500자 이상, 한국어). ## 소제목 사용, 추천 장소/음식/팁 포함",
  "category": "카테고리 (예: 관광, 맛집, 자연, 문화, 쇼핑)",
  "city": "도시명 (영문 또는 한국어)",
  "country": "국가명 (영문 또는 한국어)"
}`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  try {
    const jsonText = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    return NextResponse.json(JSON.parse(jsonText))
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response', raw: text }, { status: 500 })
  }
}
