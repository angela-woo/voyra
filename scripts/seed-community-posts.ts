#!/usr/bin/env npx tsx
/**
 * 커뮤니티 씨앗 글 생성
 * Usage: env $(cat .env.local | grep -v '^#' | xargs) npx tsx scripts/seed-community-posts.ts
 */
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const TOPICS = [
  { title: '도쿄 3박4일 다녀온 솔직 후기 (예산 포함)', category: 'review' },
  { title: '방콕 첫 여행 가서 실수했던 것들', category: 'review' },
  { title: '파리 여행 전 꼭 알아야 할 것 10가지', category: 'tips' },
  { title: '발리 여행 숙소 고르는 법 (지역별 특징)', category: 'review' },
  { title: '싱가포르 1인 여행 예산 얼마나 들까?', category: 'question' },
  { title: '유럽 여행 처음이라면 어디부터 가야 할까?', category: 'tips' },
  { title: '해외여행 짐 싸기 꿀팁 (기내 반입 주의사항)', category: 'tips' },
  { title: '여행 중 아팠을 때 대처법 (해외 병원 이용기)', category: 'review' },
  { title: '항공권 가장 싸게 사는 시기와 방법', category: 'tips' },
  { title: '여행 경비 아끼는 현실적인 방법들', category: 'tips' },
]

async function generatePost(topic: typeof TOPICS[0]): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: `여행 커뮤니티에 올릴 글을 작성해줘.

제목: "${topic.title}"

조건:
- 실제 여행자가 경험담을 공유하는 느낌으로 1인칭 구어체
- 500~800자 사이
- 딱딱하지 않게 자연스럽고 솔직하게
- 구체적인 금액, 장소, 팁 포함 (실감나게)
- 마지막 문장은 독자에게 질문 하나 던지기 ("여러분은 어떻게 생각하세요?", "혹시 비슷한 경험 있으신가요?" 같은 형태)
- 제목은 포함하지 말고 본문만 작성
- 마크다운 없이 순수 텍스트로 (줄바꿈은 \\n 사용 가능)`,
    }],
  })
  return message.content[0].type === 'text' ? message.content[0].text.trim() : ''
}

async function main() {
  // auth.users에서 email로 UUID 조회
  const { data: { users }, error: authErr } = await supabase.auth.admin.listUsers({ perPage: 1000 })

  if (authErr) {
    console.error('❌ 사용자 목록 조회 실패:', authErr.message)
    process.exit(1)
  }

  const adminUser = users.find(u => u.email === 'imrubywoo@gmail.com')
  if (!adminUser) {
    console.error('❌ 관리자 계정을 찾을 수 없습니다.')
    process.exit(1)
  }

  const userId = adminUser.id
  console.log(`✅ 관리자 UUID: ${userId}\n`)
  console.log(`🚀 커뮤니티 씨앗 글 ${TOPICS.length}개 생성 시작\n`)

  let success = 0
  let fail = 0

  for (const topic of TOPICS) {
    process.stdout.write(`  ✍️  "${topic.title}" ... `)
    try {
      const content = await generatePost(topic)

      const { error } = await supabase.from('community_posts').insert({
        title: topic.title,
        content,
        category: topic.category,
        user_id: userId,
        image_urls: [],
      })

      if (error) {
        console.log(`❌ ${error.message}`)
        fail++
      } else {
        console.log(`✅`)
        success++
      }
    } catch (e) {
      console.log(`❌ ${e}`)
      fail++
    }

    // 1.5초 딜레이
    await new Promise(r => setTimeout(r, 1500))
  }

  console.log(`\n완료: 성공 ${success}개, 실패 ${fail}개`)
}

main().catch(console.error)
