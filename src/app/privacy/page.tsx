import type { Metadata } from 'next'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: 'Kiravoy 개인정보처리방침',
  alternates: { canonical: 'https://kiravoy.com/privacy' },
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
        개인정보처리방침
      </h1>
      <p className="text-sm text-gray-400 mb-10">시행일: 2025년 5월 1일 · 최종 수정: 2026년 5월</p>

      <div className="prose prose-gray max-w-none space-y-8 text-sm text-gray-700">

        <section>
          <h2 className="text-lg font-bold mb-3">제1조 개인정보처리자 정보</h2>
          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <tbody>
              {[
                ['운영자', 'Kiravoy'],
                ['이메일', 'imrubywoo@gmail.com'],
                ['개인정보 보호책임자', '운영자 (동일)'],
                ['서비스 URL', 'https://kiravoy.com'],
              ].map(([k, v]) => (
                <tr key={k} className="border-b border-gray-100 last:border-0">
                  <td className="py-2 px-3 font-medium bg-gray-50 w-40">{k}</td>
                  <td className="py-2 px-3">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">제2조 수집하는 개인정보 항목 및 수집 방법</h2>
          <p className="mb-2"><strong>수집 항목</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>필수: 이메일 주소, 닉네임, 암호화된 비밀번호</li>
            <li>선택: 마케팅 수신 동의 여부</li>
            <li>자동 수집: 서비스 이용 기록, 접속 IP, 쿠키 (Supabase Auth 세션 관리 목적)</li>
          </ul>
          <p className="mt-2"><strong>수집 방법:</strong> 회원가입 폼을 통한 직접 입력</p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">제3조 개인정보의 처리 목적</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>회원 가입 및 본인 확인</li>
            <li>서비스 제공 (커뮤니티 글쓰기, 댓글, 일정 저장 등)</li>
            <li>서비스 운영 및 부정 이용 방지</li>
            <li>마케팅 정보 발송 (별도 동의 시에만)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">제4조 개인정보의 보유 및 이용 기간</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>회원 탈퇴 시 즉시 삭제 (단, 관련 법령에 따라 보관 의무가 있는 경우 해당 기간 보관)</li>
            <li>전자상거래 등에서의 소비자 보호에 관한 법률: 계약·청약철회 기록 5년, 불만·분쟁 기록 3년</li>
            <li>통신비밀보호법: 로그인 기록 3개월</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">제5조 개인정보의 제3자 제공</h2>
          <p>원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만 이용자의 동의가 있거나 법령에 의한 경우는 예외입니다.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">제6조 개인정보의 국외 이전</h2>
          <p>Kiravoy는 데이터베이스 서비스 제공을 위해 아래와 같이 개인정보를 국외로 이전합니다.</p>
          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden mt-2">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-2 px-3 text-left font-medium">수탁업체</th>
                <th className="py-2 px-3 text-left font-medium">국가</th>
                <th className="py-2 px-3 text-left font-medium">이전 항목</th>
                <th className="py-2 px-3 text-left font-medium">목적</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 px-3">Supabase Inc.</td>
                <td className="py-2 px-3">미국</td>
                <td className="py-2 px-3">이메일, 닉네임, 세션 정보</td>
                <td className="py-2 px-3">데이터베이스 및 인증 서비스</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">제7조 개인정보처리의 위탁</h2>
          <p>Kiravoy는 서비스 제공을 위해 아래 업체에 개인정보 처리를 위탁합니다.</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Supabase Inc. — 데이터베이스 저장 및 인증 처리</li>
            <li>Vercel Inc. — 서버 운영 및 배포</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">제8조 이용자의 권리·의무 및 행사 방법</h2>
          <p>이용자는 언제든지 다음 권리를 행사할 수 있습니다.</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>개인정보 열람 요청</li>
            <li>오류 정정 요청</li>
            <li>삭제 요청 (회원 탈퇴)</li>
            <li>처리 정지 요청</li>
          </ul>
          <p className="mt-2">위 권리 행사는 이메일(<strong>imrubywoo@gmail.com</strong>)로 요청하시면 10영업일 이내에 처리합니다.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">제9조 광고 서비스 및 쿠키 사용</h2>
          <p className="mb-3">
            본 사이트는 <strong>Google AdSense</strong>를 사용하여 광고를 게재합니다.
            Google은 쿠키를 사용하여 이용자의 이전 방문 기록을 기반으로 맞춤형 광고를 표시합니다.
          </p>
          <ul className="list-disc pl-5 space-y-1 mb-3">
            <li>Google의 광고 쿠키 사용을 통해 이용자가 관심 있을 수 있는 광고가 제공됩니다.</li>
            <li>Google의 개인정보 보호 정책은 <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] underline">https://policies.google.com/privacy</a>에서 확인할 수 있습니다.</li>
            <li>이용자는 <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] underline">Google 광고 설정</a>에서 맞춤 광고를 비활성화할 수 있습니다.</li>
          </ul>
          <p className="mb-3">
            본 사이트는 또한 <strong>Booking.com</strong>, <strong>Klook</strong> 등 제3자 제휴 서비스의 링크를 포함할 수 있으며,
            해당 서비스들도 자체적인 쿠키 정책을 운용합니다.
          </p>
          <p>
            <strong>쿠키 사용:</strong> 로그인 세션 유지 및 광고 최적화를 위해 쿠키를 사용합니다.
            브라우저 설정에서 쿠키를 거부할 수 있으나, 로그인 기능 이용이 제한될 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">제10조 개인정보의 안전성 확보 조치</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>비밀번호 암호화 저장 (bcrypt)</li>
            <li>HTTPS 암호화 전송</li>
            <li>Supabase RLS(Row Level Security)를 통한 접근 제어</li>
            <li>최소한의 개인정보만 수집</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">제11조 개인정보 보호책임자 및 문의</h2>
          <p>개인정보 처리에 관한 문의, 불만, 피해구제 등은 아래 연락처로 문의하시기 바랍니다.</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>이메일: imrubywoo@gmail.com</li>
            <li>개인정보 침해 신고: <a href="https://www.privacy.go.kr" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] underline">개인정보보호위원회</a> (privacy.go.kr)</li>
          </ul>
        </section>

      </div>
    </div>
  )
}
