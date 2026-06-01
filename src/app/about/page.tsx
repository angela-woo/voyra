import { Globe, Compass, Users, BookOpen, Mail, Shield, Cpu } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Kiravoy 소개 | Kiravoy',
  description: 'Kiravoy는 전 세계 여행지의 정확하고 유용한 정보를 제공하는 여행 가이드 플랫폼입니다.',
  alternates: { canonical: 'https://kiravoy.com/about' },
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

      <div className="prose prose-gray max-w-none space-y-10 text-sm text-gray-700">

        <section>
          <h2 className="text-xl font-bold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Kiravoy의 미션</h2>
          <p>
            Kiravoy는 전 세계 여행지의 정확하고 유용한 정보를 제공하는 여행 가이드 플랫폼입니다.
            복잡한 여행 계획을 단순화하고, 신뢰할 수 있는 정보를 누구나 쉽게 접근할 수 있도록 합니다.
          </p>
          <p className="mt-2">
            각 여행지의 문화적 맥락, 현지 음식, 교통 정보, 숙박 옵션 등을 심층적으로 분석하여
            여행자에게 실질적인 도움이 되는 가이드를 제공합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>서비스 안내</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>여행 가이드:</strong> 맛집, 관광지, 쇼핑, 교통 등 실용적인 현지 정보</li>
            <li><strong>맞춤 여행 일정:</strong> 커플, 가족, 친구, 혼자 여행 등 여행 스타일별 추천 코스</li>
            <li><strong>여행자 커뮤니티:</strong> 실제 여행 경험을 바탕으로 한 정보 공유 공간</li>
            <li><strong>다국어 지원:</strong> 한국어·영어로 전 세계 여행 정보 제공</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-5 h-5 text-purple-500" />
            <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>콘텐츠 정책</h2>
          </div>
          <p>
            본 사이트의 일부 콘텐츠는 AI(인공지능) 기술을 활용하여 작성되었으며, 편집 및 검수 과정을 거쳐 게재됩니다.
            AI가 생성한 정보는 참고용으로 제공되며, 실제 여행 시 현지 상황을 별도로 확인하시기 바랍니다.
          </p>
          <p className="mt-2">
            여행 정보(가격, 운영 시간, 비자 정책 등)는 변경될 수 있으므로 공식 출처에서 반드시 재확인하세요.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>광고 및 제휴 안내</h2>
          </div>
          <p>
            Kiravoy는 서비스 운영을 위해 Google AdSense 광고와 Booking.com, Klook 등 제휴사의 어필리에이트 링크를 사용합니다.
            이용자가 제휴 링크를 통해 예약하는 경우, 추가 비용 없이 소정의 수수료가 발생할 수 있습니다.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>운영자 정보</h2>
          </div>
          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <tbody>
              {[
                ['서비스명', 'Kiravoy'],
                ['운영자', 'Kiravoy 운영팀'],
                ['이메일', 'imrubywoo@gmail.com'],
                ['서비스 URL', 'https://kiravoy.com'],
                ['서비스 시작', '2025년 5월'],
              ].map(([k, v]) => (
                <tr key={k} className="border-b border-gray-100 last:border-0">
                  <td className="py-2 px-3 font-medium bg-gray-50 w-36">{k}</td>
                  <td className="py-2 px-3">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4">
            문의사항은 <Link href="/contact" className="text-[var(--primary)] underline">문의 페이지</Link>를 통해 남겨주시거나
            이메일(<strong>imrubywoo@gmail.com</strong>)로 연락해 주세요.
          </p>
        </section>

      </div>
    </div>
  )
}
