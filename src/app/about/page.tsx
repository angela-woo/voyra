import { Globe, Compass, Users, Sparkles } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <Globe className="w-14 h-14 text-[var(--primary)] mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          Voyra에 대하여
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          AI의 힘으로 전 세계 여행지를 탐험하는 새로운 방법을 제안합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {[
          {
            icon: <Sparkles className="w-6 h-6 text-yellow-500" />,
            title: 'AI 큐레이션',
            desc: 'Claude AI가 최신 정보를 바탕으로 정확하고 풍부한 여행 가이드를 작성합니다.',
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
        <h2 style={{ fontFamily: 'var(--font-heading)' }}>우리의 미션</h2>
        <p>
          Voyra는 여행을 꿈꾸는 모든 사람들을 위한 AI 기반 여행 가이드 플랫폼입니다.
          복잡한 여행 계획을 단순화하고, 신뢰할 수 있는 정보를 쉽게 접근할 수 있도록 합니다.
        </p>
        <p>
          우리는 Claude AI를 활용하여 각 여행지의 문화, 음식, 교통, 숙박 등 다양한 측면을
          심층적으로 분석하고 여행자에게 맞춤화된 가이드를 제공합니다.
        </p>
        <h2 style={{ fontFamily: 'var(--font-heading)' }}>팀 소개</h2>
        <p>
          Voyra는 여행을 사랑하는 개발자, 디자이너, 콘텐츠 크리에이터들로 구성되어 있습니다.
          우리는 직접 여행하며 경험한 인사이트와 AI 기술을 결합하여 최상의 여행 경험을 제공합니다.
        </p>
      </div>
    </div>
  )
}
