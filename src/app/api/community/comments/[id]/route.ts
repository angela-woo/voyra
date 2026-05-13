import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const adminSupabase = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function getAuthedUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const { id } = await params
  const { content } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: '내용을 입력해주세요.' }, { status: 400 })

  const { data: comment } = await adminSupabase
    .from('community_comments')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!comment) return NextResponse.json({ error: '댓글을 찾을 수 없습니다.' }, { status: 404 })
  if (comment.user_id !== user.id) return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })

  const { error } = await adminSupabase
    .from('community_comments')
    .update({ content: content.trim() })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const { id } = await params

  const { data: comment } = await adminSupabase
    .from('community_comments')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!comment) return NextResponse.json({ error: '댓글을 찾을 수 없습니다.' }, { status: 404 })
  if (comment.user_id !== user.id) return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })

  const { error } = await adminSupabase
    .from('community_comments')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
