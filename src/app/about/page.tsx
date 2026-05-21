import { Globe, Compass, Users, BookOpen } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kiravoy 소개 | Kiravoy',
  description: 'Kiravoy는 전 세계 여행지의 정확하고 유용한 정보를 제공하는 여행 가이드 플랫폼입니다.',
}

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <Globe className="w-14 h-14 text-[var(--primary)] mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          Kiravoy에 대하여
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          전 세계 여행지의 정확하고 유용한 정보를 한곳에서 만나보세요.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {[
          {
            icon: <BookOpen className="w-6 h-6 text-yellow-500" />,
            title: '엄선된 정보',
            desc: '각 여행지의 문화, 음식, 교통, 숙박 등 다양한 측면을 깊이 있게 다룬 가이드를 제공합니다.',
          },
          {
            icon: <Compass className="w-6 h-6 text-blue-500" />,
            title: '숨겨진 명소',
            desc: '일반 여행 책에서는 찾기 어려운 현지인만 아는 숨겨진 장소를 소개합니다.',
          },
          {
            icon: <Users className="w-6 h-6 text-green-500" />,
            title: '여행자 커뮤니티',
            desc: '전 세계 여행자들과 경험을 나누고 실용적인 꿀팁을 교환하세요.',
          },
        ].map(item => (
          <div key={item.title} className="bg-[var(--bg-secondary)] rounded-[var(--radius)] p-6 text-center">
            <div className="flex justify-center mb-3">{item.icon}</div>
            <h3 className="font-bold mb-2">{item.title}</h3>
            <p className="text-sm text-gray-500">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="prose prose-gray max-w-none">
        <h2 style={{ fontFamily: 'var(--font-heading)' }}>Kiravoy의 미션</h2>
        <p>
          Kiravoy는 전 세계 여행지의 정확하고 유용한 정보를 제공하는 여행 가이드 플랫폼입니다.
          복잡한 여행 계획을 단순화하고, 신뢰할 수 있는 정보를 누구나 쉽게 접근할 수 있도록 합니다.
        </p>
        <p>
          각 여행지의 문화적 맥락, 현지 음식, 교통 정보, 숙박 옵션 등을 심층적으로 분석하여
          여행자에게 실질적인 도움이 되는 가이드를 제공합니다.
        </p>
        <h2 style={{ fontFamily: 'var(--font-heading)' }}>팀 소개</h2>
        <p>
          Kiravoy는 여행을 사랑하는 개발자, 디자이너, 콘텐츠 크리에이터들로 구성되어 있습니다.
          다양한 여행 경험에서 얻은 인사이트를 바탕으로 실용적이고 신뢰할 수 있는 여행 정보를 만들어갑니다.
        </p>
      </div>
    </div>
  )
}
